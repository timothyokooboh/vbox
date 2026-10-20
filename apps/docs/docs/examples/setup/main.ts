import { createApp } from 'vue';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import config from './theme/vbox.config';
createApp(App).use(VBoxPlugin, config).mount('#app');
