# Pseudo-Classes/Elements

VBox supports styling elements based on their state using pseudo-class props.
You can apply styles for various states such as hover, focus, active, and
disabled by using the corresponding pseudo-class props.

## hover

You can use the `hover` prop to apply styles when the element is hovered over.

<<< @/examples/Example8.vue

<Example8 />

## focus

You can use the `focus` prop to apply styles when the element is focused.

<<< @/examples/Example7.vue

<Example7 />

## focusVisible

You can use the `focusVisible` prop to apply styles when the element is focused
and the focus is visible (typically when navigating via keyboard).

<<< @/examples/Example9.vue

<Example9 />

## focusWithin

You can use the `focusWithin` prop to apply styles when the element or any of
its descendants are focused.

<<< @/examples/Example10.vue

<Example10 />

## active

You can use the `active` prop to apply styles when the element is in an active
state (e.g., being clicked).

<<< @/examples/Example11.vue

<Example11 />

## \_disabled

You can use the `_disabled` prop to apply styles when the element is disabled.
The prop is prefixed with an underscore to avoid conflicts with the native
`disabled` attribute.

<<< @/examples/Example12.vue

<Example12 />

## pseudos

What about other pseudo-classes or pseudo-elements? Well, you can define any
valid pseudo-class or pseudo-element styles inside the `pseudos` prop :sparkles:

<<< @/examples/Example13.vue

<Example13 />

<hr />

::: tip

You can define valid CSS selectors inside any of the pseudo class props
discussed above

<<< @/examples/Example27.vue

<Example27 />

:::

<script setup lang="ts">
import Example7 from '../../examples/Example7.vue'
import Example8 from '../../examples/Example8.vue'
import Example9 from '../../examples/Example9.vue'
import Example10 from '../../examples/Example10.vue'
import Example11 from '../../examples/Example11.vue'
import Example12 from '../../examples/Example12.vue'
import Example13 from '../../examples/Example13.vue'
import Example27 from '../../examples/Example27.vue'
</script>
