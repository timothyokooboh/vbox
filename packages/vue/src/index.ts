import type VBox from './components/VBox.vue';
import type { VBoxNativeStyleProps } from '@veebox/core';

export { default as VBox } from './components/VBox.vue';
export { default as VBoxPlugin } from './plugins';
export { VBOX_SSR_COLLECTOR_KEY, getSSRCollector, getSSRStyles } from './ssr';
export { vboxRuntimeDirective } from './directives/vboxRuntime';

declare module 'vue' {
  export interface GlobalComponents {
    VBox: typeof VBox;
  }

  interface HTMLAttributes extends VBoxNativeStyleProps {
    vbox?: boolean | '';
    'vbox-ignore'?: boolean | '';
  }

  interface SVGAttributes extends VBoxNativeStyleProps {
    vbox?: boolean | '';
    'vbox-ignore'?: boolean | '';
  }
}
