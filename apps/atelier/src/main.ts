import { createApp } from 'vue';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { VBoxPlugin } from '@veebox/vue';
import config from '../vbox.config';
import App from './App.vue';
import '@fontsource-variable/manrope';
import '@fontsource-variable/newsreader';
createApp(App)
  .use(VueQueryPlugin, { queryClient: new QueryClient() })
  .use(VBoxPlugin, config)
  .mount('#app');

import './styles.css';
