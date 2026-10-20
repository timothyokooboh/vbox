import { createSSRApp } from 'vue';
import { VBoxPlugin } from '@veebox/vue';
import config from '../vbox.config';
import App from './App.vue';
export const createApp = () => createSSRApp(App).use(VBoxPlugin, config);
