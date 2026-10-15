import { createApp, createSSRApp } from 'vue';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import config from '../vbox.config';
export const createFixture = (ssr = false) =>
  (ssr ? createSSRApp(App) : createApp(App)).use(VBoxPlugin, config);
