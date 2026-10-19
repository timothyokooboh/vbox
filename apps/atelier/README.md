# Atelier

An independent editorial art-discovery demo for VBox's explicit native styling
interface. Vue 3, TypeScript, webpack 5, Radix Vue, TanStack Vue Query and
workspace VBox/PVA packages. No Tailwind, Sass, API key or backend.

## Develop

From the repository root:

```sh
pnpm install
pnpm --filter '@veebox/*' build
pnpm --filter @vbox/atelier dev
```

The local app opens at `http://127.0.0.1:5178`.
`pnpm --filter @vbox/atelier build` type-checks and creates the production
webpack output. `pnpm --filter @vbox/atelier preview` serves that output on
loopback for verification; it is not a production hosting service.

## One journey

Discover, submit an artist/title search, inspect an artwork, and close its
accessible detail dialog without losing the current query, results, scroll or
focus. The first 12 matches are shown; there is no hidden infinite scroll,
account, favorites or collection-builder scope.

[Product/acceptance brief](../../docs/showcases/atelier-brief.md) and
[API/licensing research](../../docs/research/atelier-data.md).

## Sources and rights

The live application queries the Art Institute of Chicago's public API. It
requests public-domain works only and rechecks that designation before showing
an image. Search is submit-driven and cached; service failures remain visible,
not replaced with invented live results. Images may be withdrawn, so missing
images have a fallback. Only validated museum HTTPS image/source URLs are used.

Metadata is rendered as text. API descriptions are deliberately omitted because
their licensing differs from the remaining metadata. Museum captions and source
links identify the originals; independent Atelier branding does not imply museum
endorsement. See the research note for policy and third-party-rights limits.

Newsreader and Manrope are self-hosted through Fontsource packages; their SIL
Open Font License files remain in those packages. No external font service.

## Styling and architecture

`vbox.config.ts` owns light/dark tokens and normalization. Semantic bindings
stay ordinary Vue; `vb-*` and `:vb` are explicit style sources. Small accessible
components consume PVA variants; application data flow lives in composables and
the typed museum adapter. Theme preferences persist locally; query state is not
sent anywhere except the museum search endpoint.

Browser tests substitute HTTP metadata and original synthetic illustrations;
they do not download museum artwork or depend on external uptime. Automated
accessibility checks complement, rather than certify, WCAG compliance. Manual
screen-reader, zoom, live-artwork and real-device review remains necessary.

## Verify

```sh
pnpm --filter @vbox/atelier test
pnpm --filter @vbox/atelier type-check
pnpm --filter @vbox/acceptance test:atelier
```

The final command exercises actual webpack development and production output in
Chromium, Firefox and WebKit. The repository acceptance command includes this
matrix. See [implementation evidence](../../docs/evidence/atelier/README.md) for
screenshots, covered behaviors and the remaining manual review boundary.
