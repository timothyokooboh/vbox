# Final package quality review - ticket #20

This is the final review of the explicit `vb-*` / `:vb` API, not permission to
publish it. Work is isolated from the maintainer's original checkout. The
candidate remains unpublished; PRs remain open for maintainer review.

## Package audit

| Package  | Findings addressed                                                                                                                                                                                                                                                                            | Boundaries retained                                                                                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core     | Recursive canonical serialization no longer drops nested values; unchanged stylesheet synchronization avoids redundant DOM replacement; request collectors protect independent snapshots; normalization no longer depends on the legacy parser; unused registry-listener scaffolding removed. | Pure source/context/bundle/selector modules remain separate from DOM synchronization. Legacy raw-CSS priority lanes remain distinct from deterministic explicit style bundles.                          |
| Vue      | Retained directive identity includes nested values, declaration order, aliases and breakpoints. Withdrawing one owner no longer removes a class another owner still uses.                                                                                                                     | Vue target/owner lifecycle stays in Vue; core does not import Vue. Native bindings continue to use explicit style contributions rather than retrofitting the retained directive into that architecture. |
| Unplugin | Element binding collection and validation extracted from SFC/source-map wiring. Non-styling targets now share core metadata with the editor.                                                                                                                                                  | Vue parser locations drive edits; expression validation and diagnostics remain at the compiler boundary. Vite and webpack reuse the transform, not parallel implementations.                            |
| Volar    | Project vocabulary/cache ownership, AST hint collection, and mapped completion emission separated from the host adapter. Reuses core normalization. Exact-case target handling fixes custom `Meta`, `Link` and `Title` completion gaps.                                                       | Editor effects stay outside runtime packages. Each plugin instance owns its cache; config changes invalidate it. Live config-file discovery is retained even when resolved values are unchanged.        |
| PVA      | Empty-string variant keys now behave consistently with their declared types, including defaults and compounds. Added shallow-replacement/frozen-input tests.                                                                                                                                  | Framework independent, no Vue/VBox runtime dependency. Fresh top-level results, shallow nested replacement and shared nested references remain intentional.                                             |

Build/export and dependency direction were reviewed across all five packages.
Core/Vue retain ESM, genuine CJS and standalone UMD; unplugin/PVA's require
support uses the documented Node 22.14+ ESM interoperability. Consumer builds
must not require pnpm at installation time. The packed-consumer gate verifies
these contracts rather than relying on workspace resolution.

## Cohesion rather than file-size quotas

Volar's 786-line entry point is now a host adapter with cohesive modules for
project state, vocabulary, hint collection and code emission. The compiler
separates element binding decisions from SFC orchestration/source maps. These
are responsibility boundaries, not one-function pass-through abstractions.

Core's mostly static theme/constants data remains together. Its published legacy
style parser remains supported; deleting it as "old code" would break legitimate
consumers. Runtime token traversal and type-generation traversal have different
output/error contracts and were not mechanically combined. PVA and the native
Vue binding composable were already cohesive and were not split merely to
shorten files.

## Public tests and red/green evidence

- Nested serialization previously erased nested object values. Public helper
  tests now cover distinct values, canonical keys, ordered arrays, frozen/shared
  inputs, dates/undefined and cycle failure.
- Repeating an unchanged public style bundle previously triggered a stylesheet
  mutation. A MutationObserver test now checks zero redundant writes, changed
  computed styles and restoration after external stylesheet removal.
- Two request collectors retain independent snapshots when input objects mutate
  or one request resets.
- Empty PVA selections previously skipped their variant styles. Public output
  and TypeScript fixtures cover explicit/default empty selections and compounds.
- Two independent real editor projects now exercise aliases, token values,
  updates and service recreation. A failing custom-component completion case
  protects the exact-case target fix through the public language-service seam.
- Retained Vue directive tests reproduce nested-value/config identity and
  shared-owner withdrawal defects. Browser coverage adds actual computed styles,
  shorthand/longhand order, updates and multiple same-prefix app configurations.

The old Volar `_test` export and private-helper suite were removed. Their useful
coverage is exercised through the real editor suite: default/custom tokens,
aliases and replacement, compound strings, object values, branches/loops,
empty-value insertion, broad property completion, semantic/ignored hover
previews and source mappings. Public package tests separately cover lifecycle,
unsupported inputs and actionable retired-option errors. The root acceptance
command now runs this editor suite, instead of leaving it as a separate CI-only
step. This is a change in test seam, not a claim that fewer assertions alone
mean better coverage.

## Performance and resource contract

The focused editor run after extraction passed 83 cases. Its measured native
completion cold/warm-p95/incremental-max times were 409/6/607 ms; native hover
was 391/0.51/357 ms. These are observations from this host, not universal SLAs.
The full final gate remeasures the executable budgets and browser resource
plateaus; results are recorded below when complete.

The stylesheet optimization avoids identical DOM writes but still serializes
registered CSS synchronously. Unique CSS rules are deliberately retained for
shared targets, memoized and once-rendered nodes. No bounded-memory or eviction
guarantee is introduced. Finite repeated-state workloads must plateau; unique
state growth is measured and disclosed. The existing short class hash still has
a theoretical collision risk; replacing the identity scheme is a separate
design, not a hidden cleanup change.

## Final verification status

All implementation gates passed for source revision `2638d93c812a23c1e06bef0f8a8233ab55fa0afa`.
Independent Standards and Spec reviews cleared the final fixes. The results below
are tied to that exact revision; this subsequent evidence-only update changes no code. No
beta, skill, release tag or manual deployment has been published.

### Review follow-ups

The independent Spec review caught boxed Number/String/Boolean values losing
native JSON unboxing during recursive sorting. A public red/green regression
now preserves those values and boxed BigInt rejection.

The new directive browser fixture initially failed all 24 cases on hydration
class diagnostics for a render-function component. The directive now establishes
its actual styles in `created`, retaining `mounted` for fresh-mount class
patching. Vue deliberately skips attribute comparison for directives with
`created`; the regression also proves genuine text-mismatch diagnostics remain
active. There is no `data-allow-mismatch` or client-only fixture workaround.
All **24 browser cases passed** after rebuilding; **18 Vue unit tests** passed.

Local free space fell below 1 GB during verification. Final full acceptance and
packed-install matrices will run on clean CI runners, with their exact source
revision recorded here. Focused package checks passed locally: core 108 before
the added wrapper regression, compiler 61, Volar public-contract 3, PVA 10 plus
type fixtures, and the previously recorded real editor suite 83.


## Completed gates

- [Full acceptance](https://github.com/timothyokooboh/vbox/actions/runs/39553172328/job/119066745454): **14/14 tasks**, **962 browser cases**, **83 real editor cases**, core/Vue/consumer type checks. Four intentional CDP-only skips remain. Core's final suite includes **109** tests, Vue **18**, compiler **61**, PVA **10** plus type fixtures.
- [Packed installations](https://github.com/timothyokooboh/vbox/actions/runs/39553172296): all four jobs passed, npm/pnpm/Yarn Classic on Node 22.14 and npm on Node 24. Actual five-package tarballs were installed outside the workspace with lifecycle scripts enabled, then tested for exports, types, CLI, editor, Vite/webpack SSR/hydration and interactive styles.
- Final CI completion timings: cold **817 ms**, warm p95 **6.67 ms**, incremental max **759 ms**. Hover: cold **650 ms**, warm p95 **0.58 ms**, incremental **677 ms**. Executable budgets passed.
- Browser finite-state measurements plateaued at **one stylesheet, 13,901 bytes, 220 rules, 258 live nodes**. Unique states increased to **14,861 bytes/240 rules**; unmount reduced nodes to 257 while intentionally retaining CSS. This is not a bounded-memory guarantee.
- The unpublished skill built and validated from clean revision `2638d93`; candidate versions match the package plan. Archive SHA-256: `0b808af005b5bbaaa23638efc979707c9fe4a1a2a00fd4d77beb01a8b4bb5e29`. Local artifact: `/private/tmp/vbox-native-skill-2638d93.tgz`. Rebuild from the approved release revision before publication.

## Handoff

All 27 tickets have corresponding PRs. At verification, slices 1-23 were already
merged in GitHub; slices 24-27 remained open as PRs #54, #55, #56 and #57.
Review the remaining stack in that order. No merges were performed during this
round-up. The original maintainer checkout remains untouched.

The separate Vercel preview check is failing; it is not included in the passing
acceptance claim, and hosting/deployment settings were not modified. Automated
checks are not exhaustive WCAG certification, universal editor compatibility or
proof against every external CSS interaction. The documented Node/runtime and
retained-rule limitations still apply. Beta publication, skill distribution and
manual deployment remain maintainer-controlled, separately authorized actions.
