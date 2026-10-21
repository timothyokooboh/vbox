# Style Priority

Class-list order is not a priority mechanism. VBox orders its generated rules
using styling contexts and owners, independently of component mounting order.
This contract covers **VBox-generated structured styling**, not all possible
CSS.

## Internal defaults and callers

```vue
<!-- Inside AppButton.vue -->
<template>
  <button vb-color="white" :vb-hover="{ color: 'red' }"><slot /></button>
</template>
```

```vue
<template>
  <AppButton vb-color="yellow">Save</AppButton>
</template>
```

Resting color is yellow; hover stays red. A caller only overrides conflicting
internal declarations in the **same normalized context**. This also preserves
internal responsive, dark-mode and container-query styling when the caller only
changes a base declaration. A matching caller hover overrides internal hover.
For nested callers, the outermost explicit caller wins a matching conflict.
Removing its value with `null` or `undefined` reveals the next remaining owner.

## Context order

The low-to-high built-in interaction order is:

`hover < focusWithin < focus < focusVisible < active < disabled`.

Interaction styling wins over resting styling, including resting rules combining
multiple conditions. Within the same interaction state, theme-specific styling
wins generic responsive styling:

```vue
<template>
  <button
    :vb="{
      hover: { color: 'red' },
      md: { hover: { color: 'green' } },
      dark: { hover: { color: 'blue' } },
    }"
  >
    Hover to compare
  </button>
</template>
```

| Context             | Hover color |
| ------------------- | ----------- |
| Light, below md     | Red         |
| Light, md and above | Green       |
| Dark, below md      | Blue        |
| Dark, md and above  | Blue        |

Add `dark: { md: { hover: { color: 'purple' } } }` to refine the last case. A
generic hover also beats `dark: { md: { color: 'black' } }`, because the latter
is still a resting context. These are deliberate VBox rules, not a claim that
media queries inherently increase CSS selector specificity.

Nested conditions are ANDed. For the same target, `dark.md.hover` and
`hover.md.dark` identify the same conjunction. This equivalence stops at a
selector that changes the target: a hovered parent and a hovered child are not
the same context.

## Breakpoints and arbitrary queries

Named breakpoint priority follows `sm < md < lg < xl < 2xl`, regardless of
object insertion order. Configured thresholds decide applicability; they are not
sorted by converting rem/em/px to guessed pixel sizes. Partial configuration
merges with defaults; the configuration key remains `_2xl`.

After interaction, theme and named breakpoint priority, overlapping arbitrary
container queries are compared, then arbitrary media queries. Each uses its set
of normalized full query strings, sorted by JavaScript code-unit order: the
highest differing key wins; a strict superset refines its constituent set. An
at-rule keyword is lowercased and outer/header-edge whitespace trimmed; interior
header spelling is preserved. This is stable, not a CSS implication solver or a
claim that `900px` sorts numerically after `1000px`. Prefer named breakpoints
for ordinary responsive design and explicit combined contexts when overlap needs
a precise authored refinement.

## CSS boundaries

Arbitrary selectors preserve native specificity. The parent-override guarantee
covers matching normalized contexts/selectors, not every pair of selectors that
happens to match the same element. Inline styles, external stylesheets and
`!important` continue to participate in normal CSS cascade. Do not use them
while expecting VBox to unconditionally win.

See [responsive styling](./responsive-design.md),
[advanced declarations](./declarations-prop.md), and
[component targeting](./component-targets.md).

## Try the priority rules

The first button demonstrates the table above. Enable the checkbox to add the
explicit dark-md-hover refinement. The second demonstrates why a generic hover
still wins over a combined dark-md resting rule.

<PriorityExample />

<<< @/examples/composition/PriorityExample.vue

<script setup lang="ts">
import PriorityExample from '../../examples/composition/PriorityExample.vue';
</script>
