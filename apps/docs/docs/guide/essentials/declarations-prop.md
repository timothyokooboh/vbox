# Declarations Prop

The `declarations` prop accepts any valid CSS property and CSS selectors. We've
seen that all the pseudo props and responsive style props accepts CSS selectors.
The `declarations` prop is a good place to apply selectors that are not scoped
to pseudo states, responsive design etc.

:x:

<<< @/examples/Example29.vue

<Example29 />

::: tip

This is also a good place to apply _scoped CSS custom properties_.

:x: won't work as Vue.js does not consider --border-input a valid attribute

```html
<v-box --border-input="gray">
  <v-box is="input" border="1px solid var(--border-input)"> </v-box
></v-box>
```

:white_check_mark: works

<<< @/examples/Example30.vue

<Example30 />

:::

<script lang="ts" setup>
import Example29 from '../../examples/Example29.vue'
import Example30 from '../../examples/Example30.vue'
</script>
