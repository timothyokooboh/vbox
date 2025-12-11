# Keyframes

VBox provides a `keyframes` helper function that allows you to define CSS
keyframe animations directly within your Vue components.

<<< @/examples/Example18.vue

<Example18 />

<hr />

::: tip

You can export animations to reuse across components

```ts
// animations.ts
import { keyframes } from '@veebox/core';

export const slideFromTop = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(-15px)',
  },
  to: {
    opacity: 1,
    transform: 'none',
  },
});
```

:::

You could also use percentage for the keyframe steps

```ts
const slideFromTop = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translateY(-15px)',
  },
  '70%': {
    opacity: 0.7,
    transform: 'translateY(-5px)',
  },
  '100%': {
    opacity: 1,
    transform: 'none',
  },
});
```

<hr />

By default, `keyframes` generates unique and stable identifiers used for the
`animation-name` e.g vbox-kf-15614bc4, where 15614bc4 is a stable hash based on
the object passed to the `keyframes` function. However, you can customize the
animation name by providing a string as the first argument.

```ts
const fadeIn = keyframes('fade-in', {
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
});
```

Now, the generated animation name will be `fade-in-xxxxxxxx`, where `xxxxxxxx`
is a stable hash based on the keyframes object.

And the usage is still the same:

```html
<v-box is="p" :animation="`${fadeIn} 0.5s ease-in-out both`">...</v-box>
```

<script lang="ts" setup>
import Example18 from '../../examples/Example18.vue'
</script>
