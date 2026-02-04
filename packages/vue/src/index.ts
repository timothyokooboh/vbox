import type VBox from './components/VBox.vue';

export { default as VBox } from './components/VBox.vue';
export { default as VBoxPlugin } from './plugins';
export { VBOX_SSR_COLLECTOR_KEY, getSSRCollector, getSSRStyles } from './ssr';

declare module 'vue' {
  export interface GlobalComponents {
    VBox: typeof VBox;
  }
}
