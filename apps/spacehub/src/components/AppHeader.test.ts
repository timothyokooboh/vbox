import { render, fireEvent } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import AppHeader from './AppHeader.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/launches', component: { template: '<div />' } },
  ],
});

describe('AppHeader', () => {
  it('toggles theme with switch', async () => {
    const { getByLabelText } = render(AppHeader, {
      global: {
        plugins: [router],
      },
    });

    const toggle = getByLabelText('Toggle color theme');
    await fireEvent.click(toggle);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
