import { createApp } from 'vue';
import App from './App.vue';
import { VBoxPlugin } from '@veebox/vue';
import './styles.css';
import vboxConfig from '../vbox.config';

const app = createApp(App);
app.use(VBoxPlugin, vboxConfig);

app.mount('#app');
