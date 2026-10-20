import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/movie/:id',
      name: 'movie-details',
      component: () => import('../views/MovieDetailsView.vue'),
      props: true,
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'instant' };
  },
});
