# Responsive Design

## Breakpoints

`v-box` includes a default set of responsive breakpoints that can be customized
via the theme configuration. The default breakpoints are: `sm`, `md`, `lg`, and
`xl`.

```ts
// Default breakpoints
{
  sm: '40rem', // ~640px
  md: '48rem', // ~768px
  lg: '64rem', // ~1024px
  xl: '80rem', // ~1280px
}
```

<<< @/examples/ExampleFourteen.vue{5-13}

<p>Resize the screen</p>

<ExampleFourteen />
## Media queries

The `mq` prop allows you to provide arbitrary media queries for responsive
styling.

<<< @/examples/ExampleFifteen.vue{8-13}

<ExampleFifteen />

::: info The `mq` prop can also be used for other media features such as
`prefers-color-scheme`, `orientation`, `hover` etc.

```js
// e.g
<v-box
  :mq="{
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'black',
      color: 'white',
    },
  }"
/>
```

:::

## Container queries

Similar to the `mq` prop, the `cq` prop allows you to provide container queries
for responsive styling based on the size of the parent container. To use
container queries, ensure that the parent `v-box` has `container-type` and an
optional `container-name` prop. Checkout container queries
[MDN docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
for more information.

<<< @/examples/ExampleSixteen.vue{3-4,15-19}

<ExampleSixteen />

<hr />

::: tip

All the responsive style props discussed above also support valid CSS selectors

<<< @/examples/ExampleTwentyEight.vue

<ExampleTwentyEight />
:::

<script lang='ts' setup>
  import ExampleFourteen from '../../examples/ExampleFourteen.vue'
  import ExampleFifteen from '../../examples/ExampleFifteen.vue'
  import ExampleSixteen from '../../examples/ExampleSixteen.vue'
  import ExampleTwentyEight from '../../examples/ExampleTwentyEight.vue'
</script>
