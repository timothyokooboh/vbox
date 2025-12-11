# Polymorphism

## is prop

`v-box` takes an optional `is` prop that accepts any valid HTML element. If the
`is` prop is not passed, the component renders a `div` by default.

<<< @/examples/Example3.vue

<Example3
 />

<hr />

The `is` prop is compatible with
[eslint-plugin-vuejs-accessibility](https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/)
for stactic analysis of accessible elements.

<img src="/images/a11y-analysis.png" alt="A11y Analysis Screenshot" />

## asChild prop

`v-box` also supports the `asChild` prop popularized by
[Radix UI](https://www.radix-ui.com/primitives/docs/guides/composition). When
`asChild` is set to `true`, instead of rendering its default DOM element,
`v-box` merges its props with its immediate child element.

NB: Only a single root element is allowed inside the default slot when using
`asChild`.

<<< @/examples/Example4.vue

<Example4 />

<script lang='ts' setup>
  import Example3 from '../../examples/Example3.vue'
  import Example4 from '../../examples/Example4.vue'
</script>
