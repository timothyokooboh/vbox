import {
  DefaultAliases,
  DefaultBreakpoints,
  createDjb2Hash,
  type CssPriority,
  injectCSS,
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

type RuntimeElement = HTMLElement & {
  __vboxRuntimeClassMap?: Map<string, string>;
};

const getOwnerKey = (binding: DirectiveBinding<Record<string, unknown>>) => {
  const uid = binding.instance?.$?.uid;
  return uid != null ? `uid:${uid}` : 'uid:unknown';
};

const ensureClass = (
  el: RuntimeElement,
  ownerKey: string,
  className: string,
) => {
  if (!el.__vboxRuntimeClassMap) {
    el.__vboxRuntimeClassMap = new Map();
  }

  const map = el.__vboxRuntimeClassMap;
  const previousClassName = map.get(ownerKey);
  map.set(ownerKey, className);
  if (previousClassName && ![...map.values()].includes(previousClassName)) {
    el.classList.remove(previousClassName);
  }

  if (!el.classList.contains(className)) {
    el.classList.add(className);
  }
};

const clearClass = (el: RuntimeElement, ownerKey: string) => {
  const map = el.__vboxRuntimeClassMap;
  if (!map) return;

  const previousClassName = map.get(ownerKey);
  map.delete(ownerKey);
  // A parent and child may still share the same generated class on this target.
  if (previousClassName && ![...map.values()].includes(previousClassName)) {
    el.classList.remove(previousClassName);
  }

  if (map.size === 0) {
    delete el.__vboxRuntimeClassMap;
  }
};

const resolvePriority = (
  binding: DirectiveBinding<Record<string, unknown>>,
): CssPriority => {
  return binding.arg === 'override' ? 'override' : 'base';
};

const resolveAppContextValues = (
  binding: DirectiveBinding<Record<string, unknown>>,
) => {
  const appContext = binding.instance?.$?.appContext;
  const provides = appContext?.provides as
    | Record<PropertyKey, unknown>
    | undefined;

  const aliases =
    (provides?.[aliasKey as symbol] as AliasMap) ?? DefaultAliases;
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
  const { aliases, breakpoints, classNamePrefix } =
    resolveAppContextValues(binding);
  // Nested values, authored declaration order and effective config define the rule.
  const hash = createDjb2Hash(JSON.stringify([styles, aliases, breakpoints]));
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
  const ownerKey = getOwnerKey(binding);
  const priority = resolvePriority(binding);
  const styles = binding.value;
  if (!styles || typeof styles !== 'object') {
    clearClass(el, ownerKey);
    return;
  }

  const { className, css } = computeClassAndCss(styles, binding);
  ensureClass(el, ownerKey, className);
  injectCSS(css, priority);
};

export const vboxRuntimeDirective: Directive<
  RuntimeElement,
  Record<string, unknown>
> = {
  // Hydration must establish directive-owned DOM before mount-time checks/hooks.
  // Keep mounted too: a fresh mount patches authored class props after created.
  created(el, binding) {
    applyRuntimeStyles(el, binding);
  },
  mounted(el, binding) {
    applyRuntimeStyles(el, binding);
  },
  updated(el, binding) {
    applyRuntimeStyles(el, binding);
  },
  unmounted(el, binding) {
    clearClass(el, getOwnerKey(binding));
  },
  getSSRProps(binding) {
    const styles = binding.value;
    if (!styles || typeof styles !== 'object') return {};

    const { className, css } = computeClassAndCss(styles, binding);
    const { ssrContext } = resolveAppContextValues(binding);

    if (ssrContext) {
      const collector = getSSRCollector(ssrContext);
      collector.collect(css, resolvePriority(binding));
    }

    return {
      class: className,
    };
  },
};
