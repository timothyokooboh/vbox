# Acceptance baseline - ticket #2

Recorded on Node 22.14.0, macOS arm64, Apple M2; workspace lockfile versions.
These are observations, not portable performance thresholds.

| Measurement                                               | Baseline                    |
| --------------------------------------------------------- | --------------------------- |
| Vite client compile                                       | 361 ms                      |
| webpack client compile                                    | 1251 ms                     |
| Vite shared SSR compile                                   | 126 ms                      |
| Complete fixture build command                            | 3629 ms                     |
| Public consumer vue-tsc command                           | 1373 ms                     |
| Editor cold quick-info (including host construction)      | 491 ms                      |
| Editor warm quick-info p95, 20 samples                    | 0.91 ms                     |
| Browser matrix                                            | 42/42 passing, 30.4 seconds |
| Navigation + hydration + interactive click, Vite Chromium | 306 ms test duration        |

Run `pnpm --filter @vbox/acceptance benchmark` to reproduce build/type/editor
measurements. Each hydration test also attaches its measured runtime duration.
No generated-code snapshots or class-name assertions establish correctness.

## Red/green evidence

With the hover declaration omitted, the real Chromium test failed: expected
`rgb(0, 128, 0)`, received `rgb(0, 0, 0)`. Adding the published
`:hover="{ color: 'green' }"` declaration made that same test pass. The complete
fixture then passed in Chromium, Firefox, and WebKit for both bundlers,
including JavaScript-disabled critical SSR styling and interactive hydration.

The public editor service initially had no preview for a token omitted from the
fixture's explicit theme. Supplying that token in the theme made the assertion
pass; edits from `fs-xl` to `fs-lg` refresh without restarting the service.

## Existing-suite observations

Core public collection/parser baseline: 15/15; Vue published/SSR baseline: 4/4;
PVA: 8/8 plus its existing type-consumer checks. A full workspace run exposed
two old Vue transform tests assuming `parseAllComponents` still defaulted to
false. Their opt-out intent is now explicit (`parseAllComponents: false`),
without a production behavior change. Existing asChild slot warnings remain
observable; they are not hidden or misrepresented as a newly fixed issue.

The baseline is not evidence for the new namespace, recursive conditions, parent
ownership, webpack SSR output, or the release quality gate. Subsequent slices
add and prove those contracts.
