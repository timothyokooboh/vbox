import type VBox from "./components/VBox.vue";
import type { VBoxPluginOptions } from "./plugins";

export { default as VBox } from "./components/VBox.vue";
export { VBoxPlugin } from "./plugins";
export type { VBoxPluginOptions, AliasStrategy } from "./plugins";

export function defineVBoxConfig(config: VBoxPluginOptions) {
  return config;
}

declare module "vue" {
  export interface GlobalComponents {
    VBox: typeof VBox;
  }
}
