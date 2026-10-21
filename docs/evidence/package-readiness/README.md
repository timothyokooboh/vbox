# Package readiness - ticket #19

Implementation and verification are in progress. No package/skill publication,
release tag or manual deployment has occurred. The original dirty checkout is
untouched; work is isolated on `codex/native-26-package-readiness`.

## Red / green evidence

- Actual tarball metadata failed for unplugin/Volar consumer `postinstall`
  builds and core's missing production `csstype` dependency. All five artifact
  checks passed after fixing those defects.
- A fresh npm consumer installed with lifecycle scripts enabled and no pnpm on
  PATH. Loading retained UMD files without `process` reproduced a
  ReferenceError. Guarding the development flag fixed both core and Vue's
  browser globals.
- NodeNext consumer compilation reproduced extensionless declaration errors. The
  build now rewrites only relative declaration module specifiers using the
  TypeScript parser and validates their destinations. The actual tarball `.mts`
  and `.cts` consumers then passed without `skipLibCheck`.
- A public skill-builder regression demonstrated incidental local files and a
  linked example entering the archive. Explicit entry-point/regular-Vue-example
  selection now excludes them; both artifact tests pass.
- The first clean **beta npm** consumer passed public module entries, type
  generation, Bundler/NodeNext types, real editor token assistance, Vite/webpack
  production builds and browser SSR/hydration with computed styles and updates.
  Exact tool versions are printed by the runner. Subsequent final hash-enabled
  and package-manager matrix results will be recorded below.

## Scope and gates

See `release/README.md` for candidate versions, supported module/Node matrix,
installation/rollback guidance and the explicit remaining #20 quality gate.
Clean consumers use tarball overrides for every internal dependency; no package
source aliases or dependency symlinks into the monorepo are used. The editor
test adapter is copied as test code and resolves installed consumer
dependencies.

CI's packed-consumer matrix complements the full multi-engine workspace suite.
It is not a claim of older Node, Yarn Plug'n'Play, all editor versions or
complete accessibility certification. Final CI/full-suite/review results are
pending.

## Review refinements

The initial full workspace gate at `fc580db` passed **14/14 tasks, 938 browser
cases and four intentional CDP-only skips** in 10m27s. Independent reviews then
identified two gaps: test-canary cleanup could delete an existing file after
exclusive creation failed, and the packed webpack client hydrated Vite-rendered
markup rather than proving webpack's own server build. Cleanup now tracks only
successfully created, uniquely named paths. The installed consumer builds both
server outputs independently and checks critical computed styles with client
JavaScript disabled before testing hydration and interactive updates.

CI passed npm on Node 22/24 and Yarn Classic. Its pnpm setup exposed a
shell-shim assumption in the runner; package managers now execute as programs,
not as Node source. Self-review also found that a simple `typeof process` guard
suppressed browser development diagnostics after bundler replacement. A public
Vite-built probe reproduced `__DEV__ === false` in development. Safe fallback
evaluation now preserves development/production replacement while standalone UMD
remains free of a required process shim.

The stronger pnpm consumer passes these refinements. Final CI/full-gate and
review rechecks follow before this PR becomes ready. Earlier successful runs are
not presented as evidence for subsequently added checks.

## Final verification

For PR source `02ba54c`, the clean
[acceptance job](https://github.com/timothyokooboh/vbox/actions/runs/39473042419/job/118801788120)
passed **14/14 workspace tasks, 938 browser cases, four intentional CDP-only
skips, 81/81 editor tests**, and core/Vue/public-consumer typechecks. The
separate
[packed-artifact matrix](https://github.com/timothyokooboh/vbox/actions/runs/39473042458)
passed all four jobs:

| Node    | Package manager      | Result |
| ------- | -------------------- | ------ |
| 22.14.0 | npm 10.9.2           | Passed |
| 22.14.0 | pnpm 10.14.0         | Passed |
| 22.14.0 | Yarn Classic 1.22.22 | Passed |
| 24.22.0 | npm 11.19.1          | Passed |

Each job installed hashed tarballs, exercised both module styles, types/editor,
standalone UMD, development/production diagnostics, both bundlers' own server
outputs, critical CSS without JavaScript, hydration and interaction. Workflow
artifacts contain tarballs, checksums and source provenance. Those artifacts are
not an npm publication.

Both independent follow-up reviews cleared their findings: **Standards: zero
remaining findings; Spec: zero remaining findings**. The automatic Vercel
preview failed independently; it was not used as acceptance evidence or manually
deployed.

One final local workspace attempt timed out during Movies' WebKit search-refresh
check. The saved trace shows an approximately 147-second gap in both browser
activity and test-runner timeout delivery, not a normal 15-second assertion
window. No application cause was established; six focused repeats under the same
two-worker WebKit setup passed, as did the complete clean CI gate at this
source. This local failure is retained in the evidence rather than relabeled as
a successful full run.

The release-aligned skill at source `02ba54c13fd92e1e8b385d58c01c5e94b2119e9e`
validated successfully with `workingTreeDirty: false`. Its local archive
`/private/tmp/vbox-native-skill-02ba54c.tgz` has SHA256
`e260a405a7caa8e3590c84d085403de6d3e3a77e63739dcc5dac5e6f4a0eca38`. It records
the exact candidate versions and still makes no claim that they are published.
The final quality ticket must rebuild/revalidate release artifacts after its
changes. **Ticket #20 remains a release gate.**
