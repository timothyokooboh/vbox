import type VBox from './components/VBox.vue';
import type { VBoxNativeTemplateProps } from '@veebox/core';

export { default as VBox } from './components/VBox.vue';
export { default as VBoxPlugin } from './plugins';
export { VBOX_SSR_COLLECTOR_KEY, getSSRCollector, getSSRStyles } from './ssr';
export { vboxRuntimeDirective } from './directives/vboxRuntime';

declare module 'vue' {
  export interface GlobalComponents {
    VBox: typeof VBox;
  }

  export interface HTMLAttributes extends VBoxNativeTemplateProps {
    vbox?: boolean | '';
    'vbox-ignore'?: boolean | '';
  }

  export interface SVGAttributes extends VBoxNativeTemplateProps {
    vbox?: boolean | '';
    'vbox-ignore'?: boolean | '';
  }
}
