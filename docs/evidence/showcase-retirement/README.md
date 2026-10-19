# Replacement verification and retirement gate

Issue #28, slice 23/27. Builds on Atelier PR #51 and its
[recorded acceptance evidence](../atelier/README.md).

## Acceptance status

**Retirement is pending explicit maintainer acceptance. SpaceHub is retained.**
The ticket requires acceptance of the working replacement, not merely approval
of its plan. An automatic safety review rejected removal before that acceptance.
The maintainer has been asked to accept Atelier and approve the separate
retirement PR; no response is recorded here yet. Do not treat the implementation
brief, passing tests, or this document as that response.

The original checkout and main branch are untouched. This slice neither deploys
Atelier nor publishes packages. After acceptance, remove the old app in the
separate review branch, regenerate the lockfile, verify a frozen workspace
install and run the remaining consumer gate before proposing merge.

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
