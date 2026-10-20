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
