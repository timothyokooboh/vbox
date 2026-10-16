import { createApp, createSSRApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import HydrationFixture from './ssr/HydrationFixture.vue';
import SyntaxFixture from './syntax/SyntaxFixture.vue';
const fixtures = {
  standard: App,
  hydration: HydrationFixture,
  syntax: SyntaxFixture,
};
export type FixtureName = keyof typeof fixtures;
export const resolveFixtureName = (
  value: string | null | undefined,
): FixtureName =>
  value && Object.hasOwn(fixtures, value) ? (value as FixtureName) : 'standard';
import config from '../vbox.config';
export const createFixture = (ssr = false, fixture: FixtureName = 'standard') =>
  (ssr ? createSSRApp : createApp)(fixtures[fixture])
    .use(VBoxPlugin, config)
    .use(
      createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/:pathMatch(.*)*', component: { render: () => null } },
        ],
      }),
    );
