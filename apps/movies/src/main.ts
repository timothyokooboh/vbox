import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import { router } from './router';
import vboxConfig from '../vbox.config';
import './styles.css';

const app = createApp(App);
const pinia = createPinia();
const queryClient = new QueryClient();

app.use(pinia);
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.use(VBoxPlugin, vboxConfig);

app.mount('#app');
