import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/launches',
      name: 'launches',
      component: () => import('@/views/LaunchesView.vue'),
    },
  ],
});

export default router;
