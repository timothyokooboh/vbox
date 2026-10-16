# Style Bindings

Use CSS property names with the `vb-` namespace, including familiar units,
functions and CSS custom properties. There is no separate utility-name
vocabulary to learn. Tokens and [property aliases](./css-properties-alias.md)
are optional shortcuts; they do not change ordinary HTML bindings.

<<< @/examples/ExampleFive.vue

<ExampleFive />

Use Vue bindings for dynamic values: ``:vb-width="`${width}px`"``. For condition
groups, always bind an object: `:vb-hover="{ color: 'red' }"`. Use `:vb` for
[reusable objects and PVA results](./reusing-styles.md).

The compiler diagnoses malformed bindings, but currently does not warn for every
unfamiliar property (a typo such as `vb-colro` can pass silently). Future CSS is
not rejected solely because the bundled property dataset is older. The browser
ultimately decides which declarations it supports. No `CSS.supports` check
controls server/client class identity.

<script setup lang="ts">
import ExampleFive from '../../examples/ExampleFive.vue'
</script>
