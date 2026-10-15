import { createFixture } from './app';
createFixture(document.documentElement.hasAttribute('data-ssr')).mount('#app');
document.documentElement.setAttribute('data-mounted', 'true');
