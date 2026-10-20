# Replacement verification and retirement gate

Issue #28, slice 23/27. Builds on Atelier PR #51 and its
[recorded acceptance evidence](../atelier/README.md).

## Acceptance status

**The maintainer accepted Atelier and approved SpaceHub retirement on
2026-10-20.** When explicitly asked whether Atelier was accepted as the
replacement and `apps/spacehub` could be removed in the separate retirement PR,
the maintainer replied **"yes i accept"**. The approval is recorded in
[issue #28](https://github.com/timothyokooboh/vbox/issues/28#issuecomment-6291292092).
This supersedes the earlier pending-acceptance state and safety rejection; it is
acceptance of the working replacement, not an inference from the plan.

The old app's 32 tracked files and its lockfile importer are removed in this
isolated review branch. The workspace uses `apps/*`, so no root script or
workspace glob needs replacement. Remaining reference checks found only
historical evidence/brief discussion, not executable SpaceHub consumers. The
original checkout and main branch are untouched. This slice neither deploys
Atelier nor publishes packages. Merge remains a separate maintainer action.

## Replacement evidence

Atelier's completed implementation records 90 real webpack dev/production
browser passes, 10 API/component tests, type checks, responsive light/dark
screenshots and independent standards/spec reviews. The complete pre-retirement
repository gate passed 15/15 tasks, including 878 browser cases (four additional
intentional CDP/non-Chromium skips) and 76 editor checks.

The browser cases cover search/detail/return, both dismissals, scroll/result/
focus restoration, theme changes and persistence, narrow/desktop layouts,
keyboard/axe checks, reduced motion, loading, stale requests, retry, empty and
missing/withdrawn image states. No new journey is required by the brief. Manual
screen-reader/zoom/live-artwork/real-device review remains a maintainer review
boundary, not an automated WCAG guarantee.

## Bundler coverage inventory

SpaceHub does not own the webpack regression safety net:

| Existing SpaceHub check                  | Retained public coverage                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| Default button renders                   | Atelier compiled `AppButton.test.ts`, real gallery UI                           |
| Anchor semantics on a polymorphic button | Shared `legacy.spec.ts` polymorphism/as-child; Movies routing/button journeys   |
| Theme switch updates dark mode           | Atelier/Movie browser tests check actual computed colors, state and persistence |
| Distance/velocity formatting             | App-specific display helpers; no shared compiler/runtime contract               |

`apps/acceptance/playwright.config.ts` runs the same shared browser fixtures
against Vite and webpack in three engines. They cover explicit/semantic scalar
bindings, grouping, source composition, target forwarding, conditions, aliases,
config changes, ownership, selectors and SSR/hydration. The webpack development
fixture in `config-dev.spec.ts` is independent of either showcase. Atelier's
separate suite exercises actual webpack development and production builds. None
of these files or commands is removed by the retirement proposal.

## Documentation

The new application-showcases page links Movies and Atelier source, identifies
their bundlers, provides workspace start/verification commands, and explains
credential/data/accessibility limits. It makes no claim that a hosted deployment
exists. Source links target main and explicitly become available there when the
reviewed release stack is merged.

A public browser regression first failed because the page did not exist. The
implementation adds the page and sidebar entry; VitePress's accessible heading
name includes its permalink label, which the assertion accounts for.

Verification on 2026-10-19: `pnpm --filter @vbox/acceptance test:docs` passed
(type checks, production VitePress build, 26 executable snippet checks, and 27
browser checks across Chromium/Firefox/WebKit). These documentation checks
preceded retirement; post-retirement checks are recorded below.

## Post-retirement verification

`pnpm install --ignore-scripts --no-frozen-lockfile` regenerated the workspace
lockfile; `pnpm install --frozen-lockfile --ignore-scripts --offline` then
passed. The change removes the SpaceHub importer without changing shared
dependency versions. Post-retirement verification on 2026-10-20 passed:

- `CI=true NUXT_TELEMETRY_DISABLED=1 pnpm run test --concurrency=1`: 14/14 tasks
  successful in 8m42s; five build outputs cached, tests executed.
- Browser matrices: 881 passed, four intentional Movies non-Chromium CDP skips.
  Includes shared webpack/Vite, Nuxt, playground, docs and both showcases.
- Core `tsc`, Vue/acceptance `vue-tsc`: passed.
- `pnpm --filter @vbox/acceptance test:editor`: 76 passed.
- Independent read-only Standards and Spec reviews: no actionable findings.

Local Node 22.14.0 / pnpm 9.9.0; CI pins pnpm 10.14.0. Atelier's preceding
[GitHub acceptance job](https://github.com/timothyokooboh/vbox/actions/runs/39330256121/job/118326332869)
also passed. Its separate Vercel preview check failed; no claim is made that all
external deployment checks pass and no deployment was performed here.
