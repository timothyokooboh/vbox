# Reusable style objects - ticket #11

```vue
<script setup lang="ts">
import type { VBoxStyleProps, VBoxStyles } from '@veebox/core';
const defaults: VBoxStyleProps = { color: 'red', translate: '8px' };
const optional: VBoxStyles = { color: null, opacity: 'initial' };
</script>
<template>
  <button translate="no" :vb="defaults">Save</button>
  <p v-bind:vb="optional">Optional contribution</p>
</template>
```

`translate="no"` remains HTML. The CSS translate inside the object belongs only
to styling. `VBoxStyleProps` remains supported; `VBoxStyles` is the open,
style-only object boundary and permits null declarations. `VBoxStyleInput`
currently attaches one object, null or undefined. No full CSS-property set is
added to the native attribute interface; only the grouped `vb` value is typed.

Use `:vb="buttonVariants(selection)"` for a plain object returned by PVA.
`GroupedObject.vue` demonstrates defaults, size/appearance variants and a compound
variant. PVA itself is unchanged, including its framework independence and
shallow merge: VBox cannot restore anything already replaced inside PVA's result.

Ordinary `v-bind="attrs"` retains Vue semantics, even if a key looks like a style
or starts with `vb-`. It is not a substitute for `:vb` and does not suppress
native type errors. For dynamic style keys, use `:vb="{ [property]: value }"`.
Object keys do not use the template prefix.

Reactive replacement, null/undefined withdrawal, zero, explicit CSS reset values,
immutable input objects and SSR/hydration are exercised in the real fixture.
Scalar/group shape errors and circular objects produce source-oriented runtime
diagnostics instead of object-to-string CSS. Literal `vb="..."` is rejected by
the compiler; use an expression binding. Source arrays and full multi-source
composition are deliberately the next slice, not completed by this ticket.

```sh
pnpm --filter @vbox/acceptance test
pnpm --filter @vbox/acceptance type-check
pnpm --filter @vbox/acceptance test:editor
```

The editor suite checks the original broad style-object type on a native button,
verifies that ordinary style-looking spreads still conflict with HTML translate,
and rejects a scalar grouped value. Generated alias/token declarations continue
to augment the same core types.
