import type VBox from './components/VBox.vue';

export { default as VBox } from './components/VBox.vue';
export { VBoxPlugin } from './plugins';

declare module 'vue' {
  export interface GlobalComponents {
    VBox: typeof VBox;
  }
}
