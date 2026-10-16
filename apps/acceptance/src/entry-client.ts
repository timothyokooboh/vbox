import { createFixture } from './app';
createFixture(document.documentElement.hasAttribute('data-ssr'), document.documentElement.dataset.fixture === 'hydration' ? 'hydration' : 'standard').mount('#app');
document.documentElement.setAttribute('data-mounted', 'true');
