# Declarations Prop

The `declarations` prop accepts any valid CSS property and CSS selectors. We've
seen that all the pseudo props and responsive style props accepts CSS selectors.
The `declarations` prop is a good place to apply selectors that are not scoped
to pseudo states, responsive design etc.

<<< @/examples/ExampleTwentyNine.vue

<ExampleTwentyNine />

::: tip

This is also a good place to apply _scoped CSS custom properties_.

<br />

:x: won't work as Vue.js does not consider --border-input a valid attribute

```html
<v-box --border-input="gray">
  <v-box is="input" border="1px solid var(--border-input)"> </v-box
></v-box>
```

:white_check_mark: works

<<< @/examples/ExampleThirty.vue

<ExampleThirty />

:::

## Setting Vendor prefixes

The `declarations` prop is also where vendor prefixes should be applied when
necessary. For the same reason as custom properties above, setting
`-ms-overflow-style` directly as an attribute is invalid in Vue.js.

```html
<v-box
  display="flex"
  gap="1rem"
  overflow-x="auto"
  scrollbar-width="none"
  :declarations="{
        '-ms-overflow-style': 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
      }"
/>
```

::: info

If a CSS property has an associated vendor prefix, VBox autogenerates and
applies the vendor prefix on your behalf. Thanks to
[stylis](https://www.npmjs.com/package/stylis).

NB: When you explicitly set vendor prefixes, they would only appear in the
generated CSS if that vendor prefix is supported by the browser inwhich the code
is running. This is because, VBox internally uses `CSS.supports` to permit style
rules that are supported by the that browser.

:::

<script lang="ts" setup>
import ExampleTwentyNine from '../../examples/ExampleTwentyNine.vue'
import ExampleThirty from '../../examples/ExampleThirty.vue'
</script>
