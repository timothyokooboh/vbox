import type { InjectionKey } from "vue";
import type { VBoxPluginOptions } from "./plugins";

export const aliasKey = Symbol("aliases") as InjectionKey<
  Record<string, keyof CSSStyleDeclaration>
>;

export const classNamePrefixKey = Symbol("class-name-prefix") as InjectionKey<
  VBoxPluginOptions["classNamePrefix"]
>;

export const breakpointsKey = Symbol("breakpoints") as InjectionKey<
  VBoxPluginOptions["breakpoints"]
>;
