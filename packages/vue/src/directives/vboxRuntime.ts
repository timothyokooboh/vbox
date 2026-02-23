import {
  DefaultAliases,
  DefaultBreakpoints,
  createDjb2Hash,
  injectCSS,
  stableStringify,
} from '@veebox/core';
import type { AliasMap, Breakpoints } from '@veebox/core';
import type { Directive, DirectiveBinding } from 'vue';
import { ssrContextKey } from 'vue';
import { resolveVBoxCss } from '../composables/resolveVBoxStyles';
import {
  aliasKey,
  breakpointsKey,
  classNamePrefixKey,
} from '../injectionSymbols';
import { getSSRCollector, type VBoxSSRContext } from '../ssr';

type RuntimeElement = HTMLElement & { __vboxRuntimeClassName?: string };

const ensureClass = (el: RuntimeElement, className: string) => {
  const previousClassName = el.__vboxRuntimeClassName;
  if (previousClassName && previousClassName !== className) {
    el.classList.remove(previousClassName);
  }

  if (!el.classList.contains(className)) {
    el.classList.add(className);
  }

  el.__vboxRuntimeClassName = className;
};

const resolveAppContextValues = (
  binding: DirectiveBinding<Record<string, unknown>>,
) => {
  const appContext = binding.instance?.$?.appContext;
  const provides = appContext?.provides as Record<PropertyKey, unknown> | undefined;

  const aliases = (provides?.[aliasKey as symbol] as AliasMap) ?? DefaultAliases;
  const breakpoints =
    (provides?.[breakpointsKey as symbol] as Breakpoints) ?? DefaultBreakpoints;
  const classNamePrefix =
    (provides?.[classNamePrefixKey as symbol] as string | undefined) ?? '';

  const ssrContext = provides?.[ssrContextKey as symbol] as
    | VBoxSSRContext
    | undefined;

  return {
    aliases,
    breakpoints,
    classNamePrefix,
    ssrContext,
  };
};

const computeClassAndCss = (
  styles: Record<string, unknown>,
  binding: DirectiveBinding<Record<string, unknown>>,
) => {
  const { aliases, breakpoints, classNamePrefix } = resolveAppContextValues(binding);
  const hash = createDjb2Hash(stableStringify(styles));
  const baseClassName = `css-${hash}`;
  const className = classNamePrefix
    ? `${classNamePrefix}-${baseClassName}`
    : baseClassName;

  const css = resolveVBoxCss({
    styles,
    className,
    aliases,
    breakpoints,
  });

  return {
    className,
    css,
  };
};

const applyRuntimeStyles = (
  el: RuntimeElement,
  binding: DirectiveBinding<Record<string, unknown>>,
) => {
  const styles = binding.value;
  if (!styles || typeof styles !== 'object') return;

  const { className, css } = computeClassAndCss(styles, binding);
  ensureClass(el, className);
  injectCSS(css);
};

export const vboxRuntimeDirective: Directive<RuntimeElement, Record<string, unknown>> = {
  mounted(el, binding) {
    applyRuntimeStyles(el, binding);
  },
  updated(el, binding) {
    applyRuntimeStyles(el, binding);
  },
  getSSRProps(binding) {
    const styles = binding.value;
    if (!styles || typeof styles !== 'object') return {};

    const { className, css } = computeClassAndCss(styles, binding);
    const { ssrContext } = resolveAppContextValues(binding);

    if (ssrContext) {
      const collector = getSSRCollector(ssrContext);
      collector.collect(css);
    }

    return {
      class: className,
    };
  },
};
