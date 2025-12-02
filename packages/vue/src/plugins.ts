import type { App } from "vue";
import {
  DefaultAliases,
  DefaultBreakpoints,
  injectCSS,
  normalizeTheme,
  buildCSSVariables,
} from "@vbox/core";
import type { VBoxPluginOptions } from "@vbox/core";
import cssResets from "@vbox/core/styles/resets.css?inline";
import VBox from "@/components/VBox.vue";
import {
  classNamePrefixKey,
  aliasKey,
  breakpointsKey,
} from "./injectionSymbols";

export type AliasStrategy = "merge" | "replace";

export const VBoxPlugin = {
  install(app: App<Element>, options?: VBoxPluginOptions) {
    if (options?.theme) {
      const { normalized, colorDarkMap } = normalizeTheme(options.theme);
      const css = buildCSSVariables({ normalized, colorDarkMap });
      injectCSS(css);
    }

    if (options?.cssResets) {
      injectCSS(cssResets);
    }

    const userDefinedAlias = options?.aliases?.values ?? {};
    const strategy = options?.aliases?.strategy ?? "merge";
    const finalAlias =
      strategy === "replace"
        ? Object.assign({}, userDefinedAlias)
        : Object.assign({}, DefaultAliases, userDefinedAlias);

    app.provide(breakpointsKey, options?.breakpoints ?? DefaultBreakpoints);
    app.provide(aliasKey, finalAlias);
    app.provide(classNamePrefixKey, options?.classNamePrefix);
    app.component("VBox", VBox);
  },
};
