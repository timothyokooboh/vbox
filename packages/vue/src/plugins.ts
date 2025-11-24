import type { App } from "vue";
import { DefaultAliases } from "@vbox/core";
import VBox from "@/components/VBox.vue";

export type Breakpoints = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type AliasStrategy = "merge" | "replace";

export interface VBoxPluginOptions {
  breakpoints?: Breakpoints;
  classNamePrefix: string;
  alias?: {
    strategy?: AliasStrategy;
    values: Record<string, keyof CSSStyleDeclaration>;
  };
}

export const VBoxPlugin = {
  install(app: App<Element>, options?: VBoxPluginOptions) {
    const userAlias = options?.alias?.values ?? {};
    const strategy = options?.alias?.strategy ?? "merge";
    const finalAlias =
      strategy === "replace" ? userAlias : { ...DefaultAliases, ...userAlias };

    app.provide(
      "vbox-breakpoints",
      options?.breakpoints ?? {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    );

    app.provide("vbox-aliases", finalAlias);
    app.provide("class-name-prefix", options?.classNamePrefix);

    app.component("VBox", VBox);
  },
};
