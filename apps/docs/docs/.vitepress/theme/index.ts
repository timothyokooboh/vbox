import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { VBoxPlugin } from '@veebox/vue';
import vboxConfig from '../../../vbox.config';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // register your custom global components
    app.use(VBoxPlugin, vboxConfig);
  },
} satisfies Theme;
