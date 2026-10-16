# Keyframes

`keyframes` returns a stable animation name from the authored definition. Use it
with `:vb-animation` or `:vb-animation-name`. In SSR, collect keyframes using
the same request-local collector as component styles.

<<< @/examples/ExampleEighteen.vue

<ExampleEighteen />

For reusable animations, export the **definition**, then register it from setup
for each SSR request. A module-level registration has no request context and
must not be relied on for critical SSR CSS.

```ts
export const fadeDefinition = { from: { opacity: 0 }, to: { opacity: 1 } };
// In setup, after obtaining the current request collector when server rendering:
// const fade = keyframes('fade', fadeDefinition, { collector });
```

The optional first string supplies a readable name prefix; a hash still
separates different definitions. Percentages such as `'0%'`, `'70%'`, `'100%'`
are also supported. Choose the same definition and initial data on server and
client, and respect `prefers-reduced-motion` as shown in the runnable example.

<script setup lang="ts">
import ExampleEighteen from '../../examples/ExampleEighteen.vue'
</script>
