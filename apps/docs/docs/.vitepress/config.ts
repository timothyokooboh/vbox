import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    ssr: {
      noExternal: ['@veebox/core', '@veebox/vue'],
    },
  },
  title: 'VBox',
  description:
    'A polymorphic Vue component with a lightweight runtime styling engine.',
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
        ],
      },
      {
        text: 'Essentials',
        items: [
          { text: 'Polymorphism', link: '/guide/essentials/polymorphism' },
          { text: 'Style props', link: '/guide/essentials/style-props' },
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
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/timothyokooboh/vbox' },
    ],
  },
});
