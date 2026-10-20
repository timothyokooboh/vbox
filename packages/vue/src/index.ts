import type VBox from './components/VBox.vue';
import type { VBoxStyleInput } from '@veebox/core';

export { default as VBox } from './components/VBox.vue';
export { default as VBoxPlugin } from './plugins';
export { VBOX_SSR_COLLECTOR_KEY, getSSRCollector, getSSRStyles } from './ssr';
export { vboxRuntimeDirective } from './directives/vboxRuntime';

declare module 'vue' {
  export interface GlobalComponents {
    VBox: typeof VBox;
  }

  export interface HTMLAttributes {
    vb?: VBoxStyleInput;
  }

  export interface SVGAttributes {
    vb?: VBoxStyleInput;
  }
}

export {
  useVBoxStyleBinding,
  withVBoxStyleBinding,
} from './composables/useVBoxStyleBinding';
