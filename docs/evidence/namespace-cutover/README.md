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

| Contract                                                                                                      | Public evidence                                                                       |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Native semantic/style collisions, Vue camel/kebab names, reactive scopes, spreads                             | `native-scalar.spec.ts`, `legacy.spec.ts`; `packages/unplugin/tests/cutover.test.mjs` |
| Grouped objects, ordered sources, direct priority, null/undefined, zero, shorthand/longhand                   | `grouped.spec.ts`, `composition.spec.ts`                                              |
| Interaction order, conjunctions, separate targets                                                             | `interactions.spec.ts`                                                                |
| Theme-first dark hover versus md hover, dark+md refinement, breakpoint ordering/defaults/units                | `theme-responsive.spec.ts`                                                            |
| Media/container nesting, overlapping queries, stable query/source ties                                        | `queries.spec.ts`                                                                     |
| Selector branches, escaping, specificity, pseudo-elements and external cascade                                | `selectors.spec.ts`                                                                   |
| Caller versus internal defaults, withdrawal, nested owners, shared classes, mount permutations, v-once/v-memo | `owners.spec.ts`, `nested-owners.spec.ts`                                             |
| Single-root/fragments, explicit forwarding, primitives, published VBox/asChild/PVA                            | `targets.spec.ts`, `legacy.spec.ts`                                                   |
| SSR critical CSS before JavaScript, delayed hydration, theme/reset bootstrap, request isolation               | `ssr.spec.ts`; `apps/acceptance/tests/nuxt`, `ssr.test.mjs`, core collector tests     |
| Vue syntax, source maps, Vite/webpack HMR/config updates, external scripts                                    | `vue-syntax.spec.ts`, `config-dev.spec.ts`; unplugin maps/boundaries tests            |
| Config discovery/manual metadata, aliases and compatibility conditions                                        | `vocabulary.spec.ts`; unplugin config tests; real editor config tests                 |
| Semantic typing, contextual completions, previews, live edits, diagnostics, latency                           | `apps/acceptance/tests/editor*.test.cjs`, public `vue-tsc` consumer                   |
| Unknown names remain styling; effective alias recognition; literal regions stay literal                       | unplugin cutover/config tests; `editor-cutover.test.cjs`                              |
| Repeated update/withdraw/remount, shared survivor, finite/unique style resources                              | `resources.spec.ts`                                                                   |
| Consumer migration, responsive/a11y/motion cases, deterministic external API fixtures                         | `apps/acceptance/tests/{playground,docs,movies,atelier}`                              |

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

## Initial resource sample (before review refinement)

macOS arm64, Apple M2, Node 22.14.0. The finite workload warms two cycles, then
performs 20 update/unmount/remount cycles. This initial sample did not measure
mounted contribution withdrawal, which the review correctly identified. A shared
sibling stays styled. It then applies 20 new widths and unmounts the target. All
six builder/engine combinations passed with the following DOM/CSS observations:

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

## Follow-up validation status

The sequential editor benchmark passed all 81 tests, including the two review
regressions. The build/type/editor command totals were 7,816 / 4,367 / 53,194
ms. Vite client/SSR builds took 1.08 s / 617 ms; webpack client/server took
4,784 / 2,212 ms. The fixture is substantially larger than ticket #2's baseline,
and webpack SSR is additional work, so totals are not like-for-like regressions.
Published hover cold/warm p95 measured 619 / 0.80 ms (baseline 491 / 0.91 ms).
Native-heavy completion cold/warm p95/incremental max was 361 / 3.65 / 351 ms.
These machine-local measurements are not portable latency guarantees.

An earlier parallel-editor attempt hit ENOSPC. Sequential execution reduced peak
process concurrency and passed. The final full gate also hit ENOSPC during
browserContext.close; a later missing artifact-directory error was secondary.
The disk had approximately 137 MB free. This is recorded as an incomplete gate,
not a code assertion failure or a pass.

Standards review found no actionable issues. Spec review requested an explicit
mounted null-withdraw/reapply phase and removal while sharing the same complete
style contributions. The resource fixture now includes these phases with
computed internal-default and shared-survivor assertions. Updated browser
measurements and final gate results remain pending sufficient disk space.

### Reviewed lifecycle follow-up

After some space became available, the refined fixture passed all six
browser/bundler cases locally. It now withdraws and reapplies a caller
contribution while keeping the target mounted, verifies black/10px internal
defaults, restores red/20px, and unmounts while the survivor shares those
contributions. Finite CSS reuse stayed at one sheet / 11,962 bytes / 191
top-level rules / 226 live elements. Twenty unique widths grew CSS to 12,922
bytes / 211 rules; unmount reduced live elements to 225 without evicting CSS.
This replaces the narrower initial sample for lifecycle coverage. Both
independent review axes now have zero outstanding code findings; the complete
GitHub gate remains in progress.
