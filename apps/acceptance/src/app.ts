import { createApp, createSSRApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import HydrationFixture from './ssr/HydrationFixture.vue';
export type FixtureName = 'standard' | 'hydration';
import config from '../vbox.config';
export const createFixture = (ssr = false, fixture: FixtureName = 'standard') =>
  (ssr ? createSSRApp : createApp)(fixture === 'hydration' ? HydrationFixture : App).use(VBoxPlugin, config).use(
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
    }),
  );
