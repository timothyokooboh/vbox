# Native Styling

Use `vb-*` for individual style bindings and `:vb` for grouped style objects.
Enable the [compiler plugin](../installation.md) once. No per-element marker,
wrapper, component opt-in list or scope container is needed.

```vue
<template>
  <button
    type="button"
    translate="no"
    vb-translate="8px"
    vb-color="white"
    :vb-hover="{ color: 'red' }"
  >
    Save
  </button>
  <img
    src="/poster.jpg"
    alt="Film poster"
    width="160"
    height="240"
    vb-width="20rem"
    vb-height="auto"
  />
  <BaseButton color="primary" size="large" vb-color="yellow"
    >Continue</BaseButton
  >
</template>
```

HTML `translate="no"` is unrelated to the CSS transform. The image retains its
intrinsic dimensions. `BaseButton` receives its own `color` and `size` props;
only `vb-color` contributes VBox styling. The same boundary applies to SVG,
RouterLink and NuxtLink. Component classes must reach a real
[style target](./component-targets.md).

## Static names and values

- Prefer kebab-case: `vb-font-size`, `:vb-focus-visible`, `:vb-2xl`. Vue SFC
  camelCase forms such as `vbFontSize` and `:vbFocusVisible` also work.
- Prefix only template bindings, not keys inside objects. Use
  `:vb-hover="{ fontSize: 'fs-lg' }"`, not an object containing `vb-font-size`.
- Bind objects as Vue expressions. `vb-hover="{ color: 'red' }"` is an invalid
  string, not a style object. The valid form is `:vb-hover="{ color: 'red' }"`.
- Clean `disabled` and `2xl` style keys coexist with `_disabled` and `_2xl`
  compatibility spellings. An ordinary `disabled` binding still controls the
  button's disabled state.
- CSS custom properties are case-sensitive: `vb---accent="red"` supplies
  `--accent`; `vb---Accent` is a different property. Grouped objects are often
  clearer: `:vb="{ '--accent': 'red', color: 'var(--accent)' }"`.
- An unfamiliar `vb-*` name remains an explicit style declaration, even when not
  recognized. The current compiler does not warn for every unknown property. A
  CSS dataset cannot silently turn it into a semantic prop. Browsers decide
  whether future CSS declarations are supported.
- Duplicate equivalent individual names, style-binding modifiers, invalid object
  values and non-rendering targets receive diagnostics. Do not style `template`,
  `slot`, script/style blocks or rely on a fragment receiving classes.

## Ordinary Vue bindings stay ordinary

```vue
<script setup lang="ts">
import type { VBoxStyles } from '@veebox/core';
const semantic = { type: 'button' as const, translate: 'no' as const };
const styles: VBoxStyles = { translate: '8px', padding: '12px' };
const attributeName = 'title';
</script>
<template>
  <button v-bind="semantic" :[attributeName]="'Save your work'" :vb="styles">
    Save
  </button>
</template>
```

Argumentless `v-bind` and dynamic attribute names are not style spreads. Even a
runtime key called `vb-color` inside an ordinary spread remains Vue data; it is
not reinterpreted as compiler syntax. Put dynamic styling keys in `:vb` instead.
Detectable misuse receives guidance. Existing listeners, `v-if`, `v-for`, slots,
`v-model`, refs and keys continue to belong to Vue.

The transform handles HTML Vue SFC templates. Non-HTML preprocessors such as Pug
are passed through with guidance for detectable explicit bindings, not rewritten
as HTML. Vite and webpack share the same transform; no browser CSS validation
API is needed to compile or server-render.

See [migration](../migration.md) for the removed experimental inference
controls.
