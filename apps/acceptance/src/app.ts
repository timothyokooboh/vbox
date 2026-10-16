import { createApp, createSSRApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import config from '../vbox.config';
export const createFixture = (ssr = false) =>
  (ssr ? createSSRApp(App) : createApp(App)).use(VBoxPlugin, config).use(
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
    }),
  );
