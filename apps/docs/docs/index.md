---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'VBox'
  text: 'The intuitive styling framework for Vue.js applications'
  tagline: Style Vue apps with expressive attributes, props, and design tokens.
  alt: 'VBox - The most intuitive styling framework for Vue.js applications'
  image: /logo.png
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: Demos
      link: /demos/product-card

features:
  - title: Style Props
    details:
      Keep native HTML semantics and add explicit vb-* style bindings with
      contextual completions.

  - title: Automatic vendor Prefixing
    details:
      Adds applicable vendor prefixes; browsers retain control over support for
      modern CSS.

  - title: Light & Dark Mode
    details: Easily implement light and dark themes

  - title: CSS Property Aliases
    details:
      Provides convenient aliases for common CSS properties to simplify styling.
      You can also provide your own custom aliases.

  - title: Customizations
    details:
      Customize responsive design breakpoints, CSS property aliases, and design
      theme to maintain consistency in colors, spacing, etc

  - title: Pseudo-Class Styles
    details: Style elements based on their state using pseudo-class props.
---
