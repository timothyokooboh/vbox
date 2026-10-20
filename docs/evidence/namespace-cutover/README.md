# Namespace cutover — ticket #14

The unpublished inference bridge is gone. The compiler processes explicit
`vb-*`/`:vb` only; the published VBox component keeps its API. Native attribute
augmentation no longer overlays semantic HTML/SVG props with broad style types.
Old inference options fail with migration guidance; retired markers are ordinary
attributes with advisories, not eligibility or suppression switches.

## Executable contract map

All browser paths below are relative to `apps/acceptance/tests/browser`. They
assert rendered DOM/computed CSS in Chromium, Firefox and WebKit through both
Vite and webpack, rather than class hashes or private registry shapes.

| Contract                                                                                                      | Public evidence                                                                           |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Native semantic/style collisions, Vue camel/kebab names, reactive scopes, spreads                             | `native-scalar.spec.ts`, `legacy.spec.ts`; `packages/unplugin/tests/cutover.test.mjs`     |
| Grouped objects, ordered sources, direct priority, null/undefined, zero, shorthand/longhand                   | `grouped.spec.ts`, `composition.spec.ts`                                                  |
| Interaction order, conjunctions, separate targets                                                             | `interactions.spec.ts`                                                                    |
| Theme-first dark hover versus md hover, dark+md refinement, breakpoint ordering/defaults/units                | `theme-responsive.spec.ts`                                                                |
| Media/container nesting, overlapping queries, stable query/source ties                                        | `queries.spec.ts`                                                                         |
| Selector branches, escaping, specificity, pseudo-elements and external cascade                                | `selectors.spec.ts`                                                                       |
| Caller versus internal defaults, withdrawal, nested owners, shared classes, mount permutations, v-once/v-memo | `owners.spec.ts`, `nested-owners.spec.ts`                                                 |
| Single-root/fragments, explicit forwarding, primitives, published VBox/asChild/PVA                            | `targets.spec.ts`, `legacy.spec.ts`                                                       |
| SSR critical CSS before JavaScript, delayed hydration, theme/reset bootstrap, request isolation               | `ssr.spec.ts`; `apps/acceptance/tests/nuxt`, `ssr.test.mjs`, core collector tests |
| Vue syntax, source maps, Vite/webpack HMR/config updates, external scripts                                    | `vue-syntax.spec.ts`, `config-dev.spec.ts`; unplugin maps/boundaries tests                |
| Config discovery/manual metadata, aliases and compatibility conditions                                        | `vocabulary.spec.ts`; unplugin config tests; real editor config tests                     |
| Semantic typing, contextual completions, previews, live edits, diagnostics, latency                           | `apps/acceptance/tests/editor*.test.cjs`, public `vue-tsc` consumer                       |
| Unknown names remain styling; effective alias recognition; literal regions stay literal                       | unplugin cutover/config tests; `editor-cutover.test.cjs`                                  |
| Repeated update/withdraw/remount, shared survivor, finite/unique style resources                              | `resources.spec.ts`                                                                       |
| Consumer migration, responsive/a11y/motion cases, deterministic external API fixtures                         | `apps/acceptance/tests/{playground,docs,movies,atelier}`                                  |

Published component/directive tests remain in `packages/vue/tests`. The old
inference-only transform snapshots were replaced, not disabled: a compiled Vue
consumer now proves independent semantic attributes and style objects alongside
published VBox, including updates. The lower Vue unit count reflects removal of
obsolete behavior, while browser coverage remains the primary integration gate.

## Red / green and review

- An ordinary-attribute-only SFC previously entered inference; it now remains
  byte-for-byte unchanged, including descendants of published VBox.
- Retired options previously remained active; they now produce migration errors.
- Unknown explicit names previously passed silently. Source-located compiler
  warnings and property-name editor hover guidance now remain non-fatal.
- Real editor testing caught the string-key mapping protocol: Vue boundary
  tokens are necessary for attribute-name quick-info to reach the advisory
  documentation.
- Independent inspection found default-alias replacement and v-pre advisory
  mistakes. Public regressions failed before the fixes and pass afterwards.

## Resource sample

macOS arm64, Apple M2, Node 22.14.0. The finite workload warms two cycles, then
performs 20 update/withdraw/remount cycles. A shared sibling stays styled. It
then applies 20 new widths and unmounts the target. All six builder/engine
combinations passed with the following DOM/CSS observations:

| Sample              | Stylesheets | CSS bytes | Top-level rules | Live element nodes |
| ------------------- | ----------- | --------- | --------------- | ------------------ |
| Warmed              | 1           | 11,912    | 190             | 225                |
| After finite reuse  | 1           | 11,912    | 190             | 225                |
| After unique widths | 1           | 12,872    | 210             | 225                |
| Target unmounted    | 1           | 12,872    | 210             | 224                |

The 20-cycle browser-automation workload took 1.81–2.95 seconds; this includes
input/click actionability and assertions, not just style generation time.
Chromium post-GC used-heap samples were 4,125,616 → 4,338,240 → 4,377,020 bytes
(Vite) and 4,205,332 → 4,417,488 → 4,455,164 bytes (webpack). Other engines
expose no CDP heap sample. These are observations, not a portable memory bound
or leak proof. There was no historical heap baseline; this establishes one.

Finite reuse plateaus, but unique values remain in the browser registry and its
prefix cache after unmount. This is an explicit limitation, not an eviction
claim. Shared and cached consumers must not lose CSS prematurely. Use ordinary
inline CSS variables with stable generated declarations for continuously varying
values. Request-local collector reset clears its own rules and prefix cache; it
does not clear global browser storage.

## Validation status

The initial integrated gate passed 14/14 tasks, 881 browser cases and four
intentional Chromium-only instrumentation skips. The public editor suite passed
79 cases before adding the two independent-review regressions. The final gate,
updated measurements and independent final reviews are recorded below after
completion. No publication, tag, merge, or manual deployment is authorized here.
