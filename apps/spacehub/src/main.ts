import { createApp } from 'vue';
import { VBoxPlugin } from '@veebox/vue';
import App from './App.vue';
import router from './router';
import vboxConfig from '../vbox.config';
import './styles.css';

const app = createApp(App);
app.use(VBoxPlugin, vboxConfig);
app.use(router);
app.mount('#app');
