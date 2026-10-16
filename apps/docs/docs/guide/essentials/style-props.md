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

The compiler diagnoses malformed bindings and advises on unfamiliar names; it
does not reject future CSS solely because the bundled property dataset is older.
The browser ultimately decides which declarations it supports. No `CSS.supports`
check controls server/client class identity.

<script setup lang="ts">
import ExampleFive from '../../examples/ExampleFive.vue'
</script>
