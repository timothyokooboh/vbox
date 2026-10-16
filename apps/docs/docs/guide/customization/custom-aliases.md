# Custom Aliases

Aliases rename properties, not token values or condition groups. Define their
runtime meaning in the shared config:

```ts
import { defineConfig } from '@veebox/core';
export default defineConfig({
  aliases: {
    strategy: 'merge',
    values: { mTop: 'marginBlockStart', borderR: 'borderRadius' },
  },
});
```

Use `vb-m-top="12px"`, `vb-border-r="8px"`, or the matching Vue camelCase
spellings. Object keys stay unprefixed. `strategy: 'merge'` keeps default
aliases; `strategy: 'replace'` disables defaults and uses the supplied
definitions. CSS property names remain available. Aliases may not replace
built-in condition-group names such as `hover` or `md`.

## Compiler and editor discovery

Both tools discover the project config by default. A nonstandard location can be
specified with `rootDir` and `configPath`. Prefer that over repeating alias
keys.

```ts
vboxVitePlugin({ rootDir: projectRoot, configPath: './theme/vbox.config.ts' });
// The webpack wrapper accepts the same options.
```

An explicit `aliases: ['borderR']` is still available. It **replaces**
discovered custom alias keys in compiler/editor metadata; it does not merge with
them, and an empty array is an intentional empty override. It does not supply
runtime property mappings or override `aliases.strategy`. The runtime config
must still define the aliases you use. Default alias availability follows that
strategy.

Keep compiler, editor and runtime config aligned. Namespacing means an
unfamiliar alias is still styling, but incorrect metadata can produce advisory
warnings or incomplete editor suggestions.

Run `npx vbox-type-gen` after changing aliases and include the generated
`vbox.d.ts` in the app's tsconfig. See
[editor setup](../../up-next/enhanced-dx.md).
