# Vue editing and build integration - ticket #9

## Public contract

Use `vboxVitePlugin()` before Vue's Vite plugin, or install
`vboxWebpackPlugin()` alongside `VueLoaderPlugin`. Both plugins remain available
from `@veebox/unplugin` and their `/vite` and `/webpack` subpaths. They share
the same Vue-AST transform; style expression scope and evaluation belong to Vue.

The transform supports HTML SFC templates, inline script setup, and inline
Options API scripts. Template preprocessors such as Pug are not supported and
receive a located error rather than being scanned as HTML. External
`<script src>` blocks with explicit styling also receive an actionable error:
move the component export into an inline script. This slice does not silently
claim support for those forms.

Ordinary shorthand bindings, dynamic arguments, models, listeners, refs and
spreads retain Vue semantics in explicit files. `:vb-color` uses Vue's same-name
shorthand (`vbColor`); `:vb-color="color"` explicitly reads `color`. Static
object style attributes need Vue binding syntax, for example
`:vb-hover="{ color: 'red' }"`, not `vb-hover="{}"`. Empty expressions,
malformed expressions, normalized duplicates, modifiers and non-rendering
targets have original-source diagnostics.

## Boundaries and source maps

- Dependency SFCs under `node_modules`, non-SFC files and virtual module IDs are
  excluded. Vite's language-block query requests are not authored SFC passes.
- Webpack differs: Vue loader receives the **full SFC** for its language-block
  requests, so the pre-loader deliberately transforms `resourcePath` there too.
  It must not blindly copy Vite's query exclusion rule.
- Vue loader recreates its own block maps. A thin post-loader reconnects those
  maps to the authored SFC using a weak, invocation-local record. There is no
  process-global filename cache to become stale across builds or HMR.
- Inline Options API exports are rewritten with Vue's AST utility and mapped
  script fragments, not by replacing the whole script with an unmapped string.
- Root and subpath imports are exercised from copied distribution artifacts in a
  project path containing spaces; loader URLs are converted to filesystem paths.
- No-op HTML SFCs retain authored bytes. Changed explicit files preserve script,
  style and custom-block content except for required runtime binding setup.

The unpublished inference bridge still exists for old demos until the separate
namespace-cutover ticket. Already transformed files cannot enter that bridge a
second time. This is internal transition handling, not a second public mode.

## Executable evidence

`src/syntax` runs through both production builders. Browser checks cover scoped
slots, loops/branches, nested templates, comments, entities, quoted angle
brackets/braces, void/self-closing elements, SVG, same-name shorthand, models,
refs, dynamic arguments, ordinary spreads, merged listeners and Options API
updates. Side-effectful style expressions are counted through rendered output to
detect accidental repeated evaluation.

`tests/builds.test.mjs` builds actual installed artifacts, traces both
production source maps back to authored script/template lines and checks both
bundlers' original-location diagnostics. The compiler package supplements these
with exact-column and block-preservation tests, not generated-output snapshots.

`tests/browser/config-dev.spec.ts` starts real Vite and webpack-dev-server
instances. Template style edits update without a manual page reload and retain
component state; config edits update alias/token meaning without restarting the
bundler. Tests use isolated temporary projects and loopback ephemeral ports.

From the repository root:

```sh
pnpm --filter @veebox/unplugin test
pnpm --filter @vbox/acceptance build
pnpm --filter @vbox/acceptance exec node --test tests/builds.test.mjs
pnpm --filter @vbox/acceptance exec playwright test vue-syntax.spec.ts config-dev.spec.ts
```

The regular acceptance command and CI include these checks across Chromium,
Firefox and WebKit. No packages are published by these tests.
