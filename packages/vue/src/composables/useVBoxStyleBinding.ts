import {
  inject,
  getCurrentInstance,
  useSSRContext,
  mergeProps,
  type ComponentOptions,
} from 'vue';
import {
  type AliasMap,
  DefaultAliases,
  DefaultBreakpoints,
  createDjb2Hash,
  injectStyleBundle,
  composeStyleSources,
  renderStyleRules,
} from '@veebox/core';
import {
  aliasKey,
  breakpointsKey,
  classNamePrefixKey,
} from '../injectionSymbols';
import { getSSRCollector, type VBoxSSRContext } from '../ssr';

/** Compiler runtime: class bindings participate in Vue rendering and hydration. */
export const useVBoxStyleBinding = () => {
  let ownerDepth = 0;
  for (let owner = getCurrentInstance()?.parent; owner; owner = owner.parent)
    ownerDepth++;
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
    const styles = composeStyleSources(grouped, direct, aliases);
    const hash = createDjb2Hash(
      JSON.stringify([styles, aliases, breakpoints, ownerDepth]),
    );
    const className = `${prefix ? `${prefix}-` : ''}css-${hash}`;
    const bundle = {
      key: className,
      ownerDepth,
      rules: renderStyleRules(styles, className, breakpoints),
    };
    if (context) getSSRCollector(context).collectStyleBundle(bundle);
    else injectStyleBundle(bundle);
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
