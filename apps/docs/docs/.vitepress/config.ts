import { vboxSsgHooks } from './vbox-ssg';
import { defineConfig } from 'vitepress';
import { vboxVitePlugin } from '@veebox/unplugin/vite';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...vboxSsgHooks,
  vite: {
    plugins: [vboxVitePlugin()],
  },
  title: 'VBox',
  head: [
    ['link', { rel: 'icon', href: '/logo.ico' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap',
      },
    ],
  ],
  description: 'The most intuitive styling framework for Vue.js Apps',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/guide/introduction.md' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Migration', link: '/guide/migration' },
        ],
      },
      {
        text: 'Essentials',
        items: [
          {
            text: 'Supported legacy VBox',
            link: '/guide/essentials/polymorphism',
          },
          { text: 'Native syntax', link: '/guide/essentials/native-syntax' },
          { text: 'Style bindings', link: '/guide/essentials/style-props' },
          { text: 'Style priority', link: '/guide/essentials/style-priority' },
          {
            text: 'Component targets',
            link: '/guide/essentials/component-targets',
          },
          {
            text: 'CSS property aliases',
            link: '/guide/essentials/css-properties-alias',
          },
          {
            text: 'Default theme',
            link: '/guide/essentials/default-theme',
          },
          {
            text: 'Pseudo classes/elements',
            link: '/guide/essentials/pseudo-classes',
          },
          {
            text: 'Responsive design',
            link: '/guide/essentials/responsive-design',
          },
          { text: 'Dark mode', link: '/guide/essentials/dark-mode' },
          { text: 'Keyframes', link: '/guide/essentials/keyframes' },
          {
            text: 'Declarations Prop',
            link: '/guide/essentials/declarations-prop',
          },
          {
            text: 'Reusing styles',
            link: '/guide/essentials/reusing-styles',
          },
        ],
      },
      {
        text: 'Customization',
        items: [
          { text: 'Vbox config', link: '/guide/customization/vbox-config' },
          {
            text: 'Classname prefix',
            link: '/guide/customization/classname-prefix',
          },
          {
            text: 'Custom aliases',
            link: '/guide/customization/custom-aliases',
          },
          {
            text: 'Responsive breakpoints',
            link: '/guide/customization/responsive-breakpoints',
          },
          { text: 'CSS resets', link: '/guide/customization/css-resets' },
          { text: 'Theme', link: '/guide/customization/theme' },
        ],
      },
      {
        text: 'Demos',
        items: [
          { text: 'Application showcases', link: '/demos/applications' },
          {
            text: 'Product Card',
            link: '/demos/product-card',
          },
          {
            text: 'Banner',
            link: '/demos/banner',
          },
        ],
      },
      {
        text: 'Integrations',
        items: [
          {
            text: 'SSR and hydration',
            link: '/up-next/ssr-support',
          },
          {
            text: 'Editor and types',
            link: '/up-next/enhanced-dx',
          },
          { text: 'Agent Skills', link: '/up-next/agent-skills' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/timothyokooboh/vbox' },
    ],
  },
});
