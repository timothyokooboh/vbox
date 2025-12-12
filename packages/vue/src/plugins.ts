import type { App } from 'vue';
import {
  DefaultAliases,
  DefaultBreakpoints,
  DefaultTheme,
  injectCSS,
  normalizeTheme,
  buildCSSVariables,
  deepMerge,
} from '@veebox/core';
import type { VBoxPluginOptions } from '@veebox/core';
import cssResets from '@veebox/core/styles/resets.css?inline';
import VBox from '@/components/VBox.vue';
import {
  classNamePrefixKey,
  aliasKey,
  breakpointsKey,
} from './injectionSymbols';

export type AliasStrategy = 'merge' | 'replace';

export default {
  install(app: App<Element>, options?: VBoxPluginOptions) {
    const enableDefaults = options?.enableDefaultTheme !== false;
    const baseTheme = enableDefaults ? DefaultTheme : {};
    const mergedTheme = deepMerge(baseTheme as any, options?.theme ?? {});

    if (Object.keys(mergedTheme).length > 0) {
      const { normalized, colorDarkMap } = normalizeTheme(mergedTheme);
      const css = buildCSSVariables({ normalized, colorDarkMap });
      injectCSS(css);
    }

    if (options?.cssResets) {
      injectCSS(cssResets);
    }

    const userDefinedAlias = options?.aliases?.values ?? {};
    const strategy = options?.aliases?.strategy ?? 'merge';
    const finalAlias =
      strategy === 'replace'
        ? Object.assign({}, userDefinedAlias)
        : Object.assign({}, DefaultAliases, userDefinedAlias);

    app.provide(breakpointsKey, options?.breakpoints ?? DefaultBreakpoints);
    app.provide(aliasKey, finalAlias);
    app.provide(classNamePrefixKey, options?.classNamePrefix);
    app.component('VBox', VBox);
  },
};
