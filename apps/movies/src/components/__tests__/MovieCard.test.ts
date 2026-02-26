import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { VBoxPlugin } from '@veebox/vue';
import MovieCard from '../MovieCard.vue';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/movie/:id', component: { template: '<div />' } }
  ]
});

describe('MovieCard', () => {
  it('renders poster alt text and title', async () => {
    render(MovieCard, {
      props: {
        movie: {
          id: 101,
          title: 'Test Movie',
          overview: 'Overview',
          poster_path: '/poster.jpg',
          backdrop_path: null,
          release_date: '2024-05-12',
          vote_average: 8.5,
          vote_count: 100,
          genre_ids: [28],
          original_language: 'en',
          adult: false
        }
      },
      global: {
        plugins: [router, VBoxPlugin]
      }
    });

    expect(screen.getByRole('heading', { name: 'Test Movie' })).toBeTruthy();
    expect(screen.getByAltText('Poster for Test Movie')).toBeTruthy();
  });
});
