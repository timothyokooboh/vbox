# Dark mode

VBox has built-in support for light and dark themes, allowing you to easily
implement color mode switching in your Vue applications.

There are three ways to handle dark mode styling in VBox: `dark` prop,
`prefers-color-scheme` media query via the `mq` prop, or applying colors via the
`light-dark` css function when the :root has color-scheme set to `light dark`

## dark prop

The `dark` prop applies styles specifically for dark mode when the html element
has a `dark` class.

<<< @/examples/Example17.vue{7-9}

Toggle light/dark mode of this page to see the effect.

<Example17 />

::: tip

VBox supports [theme-aware design tokens](../customization/theme.md#color). You
can define colors in your theme configuration with different values for light
and dark modes using an object with `default` and `dark` keys.

When you use these colors in your components, VBox will automatically apply the
appropriate color based on the current theme, reducing the need for manual dark
mode styling via the `dark` prop :sparkles:.

:::

::: info

In addition to CSS properties, the `dark` prop also accepts valid CSS selectors
:sparkles:

```html
<!-- Example -->
<v-box
  :dark="{
      backgroundColor: 'black',
      color: 'white',
      '&:has([data-scope=child])': {
        backgroundColor: 'gray',
      },
    }"
>
  <div data-scope="child">I'm a child element</div>
</v-box>
```

:::

## prefers-color-scheme

You can also use the `mq` prop to apply styles based on the user's system color
scheme preference using the `prefers-color-scheme` media query.

```html
<!-- Example -->
<template>
  <v-box
    :mq="{
      '@media (prefers-color-scheme: dark)': {
        backgroundColor: 'black',
        color: 'white',
      },
      '@media (prefers-color-scheme: light)': {
        backgroundColor: 'white',
        color: 'black',
      },
    }"
  />
</template>
```

## light-dark css function

If the `:root` element has `color-scheme: light dark` set, you can use the
`light-dark` css function to apply colors that adapt to light and dark modes.
Check out the
[MDN docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme)
for more information on `color-scheme` property.

```css
/* styles.css */
:root {
  color-scheme: light dark;
}
```

```html
<template>
  <v-box background="light-dark(white, black)" />
</template>
```

<script setup lang="ts">
import Example17 from '../../examples/Example17.vue'
</script>
