import { inject, useSSRContext, mergeProps, type ComponentOptions } from 'vue';
import {
  type AliasMap,
  DefaultAliases,
  DefaultBreakpoints,
  createDjb2Hash,
  injectCSS,
  readStyleObject,
} from '@veebox/core';
import {
  aliasKey,
  breakpointsKey,
  classNamePrefixKey,
} from '../injectionSymbols';
import { getSSRCollector, type VBoxSSRContext } from '../ssr';
import { resolveVBoxCss } from './resolveVBoxStyles';

/** Compiler runtime: class bindings participate in Vue rendering and hydration. */
export const useVBoxStyleBinding = () => {
  const aliases = inject<AliasMap>(aliasKey, DefaultAliases);
  const breakpoints =
    inject(breakpointsKey, DefaultBreakpoints) ?? DefaultBreakpoints;
  const prefix = inject(classNamePrefixKey, '');
  const context =
    typeof window === 'undefined' ? useSSRContext<VBoxSSRContext>() : undefined;

  return (
    direct: Record<string, unknown>,
    semanticProps?: Record<string, unknown> | null,
    grouped?: unknown,
  ) => {
    const styles = {
      ...readStyleObject(grouped),
      ...readStyleObject(direct, 'individual'),
    };
    const hash = createDjb2Hash(JSON.stringify([styles, aliases, breakpoints]));
    const className = `${prefix ? `${prefix}-` : ''}css-${hash}`;
    const css = resolveVBoxCss({ styles, className, aliases, breakpoints });
    if (context) getSSRCollector(context).collect(css);
    else injectCSS(css);
    return mergeProps(semanticProps ?? {}, { class: className });
  };
};

/** Normal SFC scripts keep their setup, including async setup and lifecycle hooks.
 * A local mixin provides the template binding without replacing authored options.
 */
export const withVBoxStyleBinding = <T extends ComponentOptions>(
  component: T,
  name: string,
): T => {
  const binding: ComponentOptions = {
    beforeCreate() {
      this[name] = useVBoxStyleBinding();
    },
  };
  return { ...component, mixins: [...(component.mixins ?? []), binding] };
};
