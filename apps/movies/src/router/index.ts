import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MovieDetailsView from '../views/MovieDetailsView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/movie/:id',
      name: 'movie-details',
      component: MovieDetailsView,
      props: true
    }
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  }
});

router.beforeResolve((to, from, next) => {
  const supportsViewTransition =
    typeof document !== 'undefined' && 'startViewTransition' in document;

  if (!supportsViewTransition || to.fullPath === from.fullPath) {
    next();
    return;
  }

  // Defer navigation inside the browser view-transition pipeline.
  (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition?.(() => {
    next();
  });
});
