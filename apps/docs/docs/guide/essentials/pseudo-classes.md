# Pseudo-Classes/Elements

VBox supports styling elements based on their state using pseudo-class props.
You can apply styles for various states such as hover, focus, active, and
disabled by using the corresponding pseudo-class props.

## hover

You can use the `hover` prop to apply styles when the element is hovered over.

<<< @/examples/ExampleEight.vue

<ExampleEight />

## focus

You can use the `focus` prop to apply styles when the element is focused.

<<< @/examples/ExampleSeven.vue

<ExampleSeven />

## focusVisible

You can use the `focusVisible` prop to apply styles when the element is focused
and the focus is visible (typically when navigating via keyboard).

<<< @/examples/ExampleNine.vue

<ExampleNine />

## focusWithin

You can use the `focusWithin` prop to apply styles when the element or any of
its descendants are focused.

<<< @/examples/ExampleTen.vue

<ExampleTen />

## active

You can use the `active` prop to apply styles when the element is in an active
state (e.g., being clicked).

<<< @/examples/ExampleEleven.vue

<ExampleEleven />

## \_disabled

You can use the `_disabled` prop to apply styles when the element is disabled.
The prop is prefixed with an underscore to avoid conflicts with the native
`disabled` attribute.

<<< @/examples/ExampleTwelve.vue

<ExampleTwelve />

## pseudos

What about other pseudo-classes or pseudo-elements? Well, you can define any
valid pseudo-class or pseudo-element styles inside the `pseudos` prop :sparkles:

<<< @/examples/ExampleThirteen.vue

<ExampleThirteen />

<hr />

::: tip

You can define valid CSS selectors inside any of the pseudo class props
discussed above

<<< @/examples/ExampleTwentySeven.vue

<ExampleTwentySeven />

:::

<script setup lang="ts">
import ExampleSeven from '../../examples/ExampleSeven.vue'
import ExampleEight from '../../examples/ExampleEight.vue'
import ExampleNine from '../../examples/ExampleNine.vue'
import ExampleTen from '../../examples/ExampleTen.vue'
import ExampleEleven from '../../examples/ExampleEleven.vue'
import ExampleTwelve from '../../examples/ExampleTwelve.vue'
import ExampleThirteen from '../../examples/ExampleThirteen.vue'
import ExampleTwentySeven from '../../examples/ExampleTwentySeven.vue'
</script>
