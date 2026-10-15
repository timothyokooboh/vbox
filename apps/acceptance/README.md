# Native styling acceptance seam

One authored Vue app runs through the actual workspace Vite and webpack plugins.
Browser tests assert accessible DOM and **computed styles**, not implementation
class names. Package entry points (including built distributions) are consumed,
not test-only copies of the engine. The server entry uses the public Vue SSR
collector and supplies theme variables before client JavaScript.

## Run

From the repository root, after
`pnpm install --frozen-lockfile --ignore-scripts`:

```sh
pnpm --filter '@veebox/*' build
pnpm install --frozen-lockfile --ignore-scripts --offline # link newly built workspace CLI bins
pnpm --filter @vbox/acceptance exec playwright install chromium firefox webkit
pnpm --filter @vbox/acceptance test
pnpm --filter @vbox/acceptance type-check
pnpm --filter @vbox/acceptance test:editor
pnpm --filter @vbox/acceptance benchmark
```

The `test` script builds both production clients and the shared Vite SSR entry.
After a build, focus without rebuilding:

```sh
pnpm --filter @vbox/acceptance run test:browser --project=vite-chromium -g hover
pnpm --filter @veebox/vue test -- tests/vbox-ssr.test.ts
pnpm --filter @veebox/property-variance-authority test
```

Matrix: pinned Playwright Chromium, Firefox and WebKit, each with Vite and
webpack clients. The SSR renderer is currently built with Vite for both clients,
**not** a claim of independent webpack SSR or Nuxt coverage. Add those in the
SSR slice.

Every test gets a fresh browser context/page (DOM and client registries). Each
SSR request creates an app and collector. Only loopback network requests are
allowed; no third-party APIs are needed. Readiness and retries use Playwright
assertions, not sleeps. Ports 4721/4722 must be free: existing servers are
deliberately not reused. Traces are retained only on failure. No watch processes
survive the suite.

The editor test invokes the TypeScript/Vue service adapter and public quick-info
requests, including a live edit; it does not call VBox private `_test` exports.
The `vue-tsc` fixture consumes the actual package declarations. Wider completion
and diagnostic assertions are added alongside the corresponding feature slices.

## Expansion plan

1. Keep the published VBox API green. Add explicit `vb-*` recognition in a small
   Vue-AST transform seam, separate from Vite/webpack lifecycle effects.
2. Migrate behavior incrementally behind internal module boundaries. Unpublished
   inference and explicit syntax may coexist only where unambiguous, without a
   public compatibility mode. A file using the new namespace must never have its
   ordinary semantic bindings consumed by the old inference path.
3. When semantic isolation requires replacing the default transform, use the
   stacked integration branches: keep legacy/new acceptance tests green and
   explicitly record old inferred examples/tests awaiting migration.
4. Migrate consumers and docs, then remove the inference path and obsolete
   options. Ticket #14 is the full-green integration cutover gate. No
   intermediate stack branch is a beta-release candidate; #19 and #20 gate
   publication readiness.

Only introduce shared normalization metadata when the next tested behavior needs
it; do not split every file or redesign the engine in this baseline ticket.
