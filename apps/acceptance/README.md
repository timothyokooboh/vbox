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

The `test` script builds independent Vite/webpack production clients and SSR
entries, then builds the real Nuxt fixture and runs its browser checks. After a
build, focus without rebuilding:

```sh
pnpm --filter @vbox/acceptance run test:browser --project=vite-chromium -g hover
pnpm --filter @veebox/vue test -- tests/vbox-ssr.test.ts
pnpm --filter @veebox/property-variance-authority test
```

Matrix: pinned Playwright Chromium, Firefox and WebKit, each with Vite and
webpack client/server pairs, plus three Nuxt production-server projects. See
[SSR coverage and integration](./SSR.md) for the rendering contract and limits.

Every test gets a fresh browser context/page (DOM and client registries). Each
SSR request creates an app and collector. Only loopback network requests are
allowed; no third-party APIs are needed. Readiness and retries use Playwright
assertions, not sleeps. Ports 4721/4722/4723 must be free: existing servers are
deliberately not reused. Traces are retained only on failure. No watch processes
survive the suite.

The editor test invokes the TypeScript/Vue service adapter and public quick-info
requests, including a live edit; it does not call VBox private `_test` exports.
The `vue-tsc` fixture consumes the actual package declarations. Wider completion
and diagnostic assertions are added alongside the corresponding feature slices.

See [Vue editing and builds](./BUILDS.md) for the supported template forms,
source-map handoff, actual HMR coverage and installed-artifact checks.

## Namespace cutover

The temporary inference bridge has been removed. Only explicit `vb-*` and `:vb`
enter native styling; ordinary bindings stay semantic, including in files
without any explicit styling. The published VBox API remains independently
supported. Old inference options fail with migration guidance, and retired
markers cannot opt into or suppress styling. Source-located compiler advisories
and editor name hovers flag unfamiliar explicit names without rejecting future
CSS.

Consumer migrations, documentation, Movies, and the webpack Atelier replacement
are integrated. Artifact readiness and the final quality review remain separate
release gates; this branch is not authorization to publish.

[Editor coverage and limitations](./EDITOR.md) describes contextual completions,
project invalidation, generated declarations and the real-service latency
checks.
