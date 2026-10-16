# Introduction

VBox brings CSS properties, design tokens and conditional styling into Vue
markup without replacing semantic elements with a generic box. The recommended
native styling interface uses an explicit **style namespace**:

<<< @/examples/ExampleOne.vue

<ExampleOne />

`vb-color` is styling; ordinary `color`, `translate`, `width`, `size`, `v-bind`
and event bindings keep their HTML or component meaning. The compiler
understands Vue templates, while the runtime composes styles and collects CSS
during SSR. The [supported legacy VBox component](./essentials/polymorphism.md)
remains useful for polymorphism and `asChild`; it is not removed or deprecated.

::: warning Release status

This site documents the upcoming native-interface beta. The existing stable
release does not yet provide this interface. Use the repository's built
workspace packages until the coordinated beta is published; do not assume
installing the current `latest` tag enables it.

:::

## Why native tags?

A template full of `button`, `p` and `section` is easier to scan. Accessibility
linters can recognize these native elements without a VBox component mapping.
That visibility is **not** guaranteed WCAG compliance: labels, semantic nesting,
keyboard behavior, contrast, focus, motion and custom-component behavior still
need appropriate design and testing.

Start with [installation](./installation.md), then learn
[native bindings](./essentials/native-syntax.md),
[composition](./essentials/reusing-styles.md), and
[style priority](./essentials/style-priority.md).

<script setup lang="ts">
import ExampleOne from '../examples/ExampleOne.vue'
</script>
