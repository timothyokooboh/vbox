import { createFixture, resolveFixtureName } from './app';
createFixture(
  document.documentElement.hasAttribute('data-ssr'),
  resolveFixtureName(document.documentElement.dataset.fixture),
).mount('#app');
document.documentElement.setAttribute('data-mounted', 'true');
