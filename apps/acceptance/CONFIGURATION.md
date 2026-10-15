# Configured native styling - ticket #3

`Vocabulary.vue` is a built-package consumer, exercised through both bundlers
and Chromium, Firefox and WebKit. It demonstrates:

```vue
<p
  vb-brand-color="cl-reference"
  vb-pad-2="sp-larger"
  vb-max-w="200px"
  vb---Accent="40px"
  vb-width="var(--Accent)"
/>
```

- `vb-` is stripped once. Unknown properties still express styling intent; a
  property catalog never decides whether a prefixed binding is semantic.
- CSS custom properties retain their exact case. `--Accent` and `--accent` are
  independent variables. Grouped object keys (next slice) are ordinary style
  keys, not template namespace names.
- Runtime configuration supplies alias **meanings**. Compiler alias-key metadata
  cannot create a missing runtime mapping. Kebab/camel spellings and numeric
  segments normalize through core; vendor-prefixed declarations remain CSS.
- `aliases: ['customKey']` on a bundler/editor plugin replaces its discovered
  custom-key metadata; `aliases: []` disables discovery of custom-key metadata.
  Neither option disables explicit `vb-*` recognition.
- Runtime `aliases.strategy: 'replace'` is different: it removes default alias
  mappings. The default runtime strategy is `merge`.
- Custom aliases cannot replace built-in condition groups, including clean and
  underscore spellings. Configuration diagnostics name the file and key.
- Core owns effective aliases, theme merging, token categories and condition
  names. The Vue runtime, compiler configuration loader, type generator and
  editor consume that vocabulary rather than maintaining independent lists.

## Configuration locations

Root `vbox.config.ts/js/cjs/mjs` discovery works without plugin options. For
non-standard locations, use `configPath` relative to `rootDir` (or the process
working directory for compiler options). Volar defaults its root to the
consumer tsconfig directory. Apply the same runtime configuration to VBoxPlugin.

The public type-generation command supports matching explicit locations:

```sh
pnpm exec vbox-type-gen --root ./apps/example --config ./theme/vbox.config.ts
```

The generated `vbox.d.ts` is written to the selected root. Ordinary invocation
still writes to the current project root.

## Updates and isolation

Configuration loads do not retain stale module/alias results across consumers.
Vite registers the discovered config as a watched dependency and reloads after
changes; webpack registers it as a loader dependency. The dev test edits config
while the real Vite server / webpack watcher stays alive and checks the rendered
result (automatic Vite reload, explicit page reload after webpack rebuild).

Editor vocabulary refreshes on the next template edit, including values from
imported config modules. Config-only changes with no document update are not yet
an editor notification guarantee; the live editor integration slice owns that.
Type generation is intentionally an explicit regeneration command.

Two SSR consumers in one Node process have independent alias resolution, class
identity and collected token CSS. Theme variables remain document-global CSS
variables: this is not a promise of independently themed apps sharing one DOM.

## Checks

```sh
pnpm test
pnpm --filter @vbox/acceptance type-check
pnpm --filter @vbox/acceptance test:editor
```

Public consumer coverage includes case-sensitive custom properties, aliases,
compound tokens, references, light/dark values, resets, class prefixes, default
theme enable/disable, runtime alias replacement, config overrides/recovery,
real dev-session edits, generated declarations checked by TypeScript and
per-project editor previews. Conditional precedence and the final SSR reset
collection are separate later tickets, not claims made by this slice.
