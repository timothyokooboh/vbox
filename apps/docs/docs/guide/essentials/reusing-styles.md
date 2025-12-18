# Reusing Styles

It's very simple to reuse the same styles across elements. Simply store the
styles in an object and use Vue's `v-bind` to spread :tada:

::: tip

When creating reusable styles, ensure to use `VBoxStyleProps` type to get type
safety & intellisense support for every VBox style props.

:::

<<< @/examples/Example31.vue

<ClientOnly>
    <Example31 />
</ClientOnly>

<script lang="ts" setup>
    import Example31 from '../../examples/Example31.vue'
</script>
