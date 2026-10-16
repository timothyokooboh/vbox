# VBox documentation

The VitePress site teaches the explicit native styling interface (`vb-*` /
`:vb`) and retains labeled examples of the supported legacy VBox component.

From the repository root:

```sh
pnpm install
pnpm --filter '@veebox/*' build
pnpm --filter docs dev
```

VitePress reads `docs/.vitepress/config.ts`, not the root `vite.config.ts`. The
shared theme installs the runtime plugin; page-local SSG hooks put critical CSS
in the initial head. Do not hide examples in ClientOnly to avoid SSR
integration.

```sh
pnpm --filter docs type-check
pnpm --filter docs build
pnpm --filter @vbox/acceptance test:docs
```

The last command builds the actual site, compiles every Vue/HTML fenced snippet,
typechecks the executable starter files, and exercises the Vite/webpack starters
and rendered docs in Chromium, Firefox and WebKit. Install Playwright browsers
with `pnpm --filter @vbox/acceptance exec playwright install` first. Tests block
external assets; they do not depend on remote fonts, photos or API availability.

Installation snippets include the actual files under `docs/examples/setup`.
Update those files rather than maintaining a separate copy in Markdown. The
starter test uses already-built workspace dependencies; published npm/pnpm/yarn
installation is checked separately during release preparation. Nuxt snippets
include the actual `apps/vboxssr` files, covered by its consumer acceptance
suite.

No documentation build command publishes or deploys the site.
