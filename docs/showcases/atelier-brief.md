# Atelier: Replacement Showcase Brief

Issue #17, slice 21/27. Implementation is bounded by #27; verification and
SpaceHub retirement belong to #28.

## Decision and authorization

Select **Atelier**, an editorial art-discovery experience for curious viewers
and visual designers. This deliberately complements Movies: a quiet, image-led
museum experience rather than a second entertainment dashboard.

The original ticket asked for an approval checkpoint. The maintainer's later
execution instruction explicitly said **“Do not wait for approvals”** and asked
for the new design-intensive webpack app to be ready for final PR review. This
choice is made under that delegated execution authority; it is not a claim that
the maintainer separately reviewed or endorsed this specific design. Final
acceptance remains with the maintainer before merging the replacement and
retirement PRs. No deployment or publication is authorized.

## One complete journey

**Discover → search → inspect an artwork → return to the same results.**

1. Open the gallery; see a featured work and a bounded set of public-domain art.
2. Submit a title/artist query (or select a suggested search). Show the
   submitted query, the result count and the first 12 matches; do not imply the
   full collection is loaded.
3. Activate an artwork to open its accessible detail dialog: uncropped image,
   title, artist, date, medium, dimensions and source/rights link.
4. Close by button or Escape. Restore focus to the initiating card and preserve
   the search, results and scroll position.
5. Change theme without losing journey state.

No account, favorites, collection builder, checkout, download tool, infinite
scrolling, multi-museum aggregation, social features or new backend. Those are
not hidden additions to #27. No extra journey is needed for this MVP.

## Visual direction

- Gallery/editorial, not a generic admin dashboard: generous margins, a large
  serif headline, compact sans-serif labels, deliberate art framing and a
  restrained border/spacing system.
- Light: warm paper, charcoal ink, deep botanical green and a small clay accent.
  Dark: green-black canvas, warm off-white ink and muted sage accents. Both are
  first-class designs, not a simple inversion.
- Self-hosted Newsreader display typography and Manrope interface typography;
  preserve their licenses. No external font request.
- Desktop: spacious masthead, one asymmetric featured-work composition, then a
  three-column row-major gallery. Mobile: stacked masthead/feature, full-width
  search, one/two-column artwork grid as space permits. Art remains uncropped.
- Detail dialog: artwork and catalogue label side by side on wide screens,
  vertically stacked on narrow screens. No wrapper inserted around consumer
  components solely to fix styling inheritance.
- No decorative entrance that hides usable content. Fine-pointer hover feedback
  is brief (at most 200 ms, transform/opacity only); focus is immediate. Reduced
  motion removes positional changes. No custom cursor or parallax.

## Observable acceptance

| Area            | Required observable behavior                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary journey | Submitting “Monet” changes results; opening a matching card shows that artwork's metadata; Escape/Close restores the same results and card focus.                                                       |
| Data lifecycle  | Initial loading is named and visible; a new search cannot be overwritten by an older response; pending requests may be cancelled.                                                                       |
| Empty/error     | Zero results retain the query and offer a clear reset. Network/HTTP errors show an honest retry action, never invented live results.                                                                    |
| Missing data    | Missing artist/date/medium/dimensions use neutral fallbacks. Missing or failed images show a labelled placeholder without broken layout.                                                                |
| Themes          | Switch has an accessible name/state, persists preference, and changes theme tokens while keeping search/dialog state.                                                                                   |
| Responsive      | No page-level horizontal overflow at 320, 390, 768 and 1440 px. Touch controls have 44 px target areas. Long titles and artist names wrap.                                                              |
| Keyboard        | First Tab reaches Skip to content; search form works with Enter; every artwork is actionable by keyboard; dialog traps focus and restores it on close.                                                  |
| Accessibility   | Semantic landmarks, ordered headings, useful image alternatives, visible focus, labelled controls, polite result/status updates; automated axe checks in both themes. No full WCAG certification claim. |
| Motion          | Reduced-motion and coarse-pointer tests show no hover enlargement. Closing/interruption never blocks the next interaction.                                                                              |
| Builds          | Same journey passes against real webpack development and production output, with no Vite-only workaround in the app.                                                                                    |
| Evidence        | Record real rendered desktop/mobile, light/dark screenshots, browser results, unit/component results and type checks; distinguish controlled fixture art from live museum images.                       |

## Data and source constraints

Use the Art Institute of Chicago API and its IIIF images. No API key or paid
service. Query public-domain artworks only, request the necessary fields, and
cache responses. Search is submit-driven rather than a request per keystroke.
Use the response's IIIF base URL with validated HTTPS museum URLs and bounded
image sizes. Do not use API descriptions/HTML in this MVP; render metadata as
text, not `v-html`. Treat image withdrawal and missing values as normal states.
Display museum/source attribution and an unofficial-demo notice; do not imply
museum endorsement. See the
[primary-source research note](../research/atelier-data.md) for current API
limits and licensing distinctions.

## Implementation boundaries

```text
apps/atelier/
  src/api/          # typed museum adapter, field selection, image/source URLs
  src/composables/  # submitted query, fetch/cache lifecycle, theme, selection
  src/components/   # only Button, Surface, ArtworkCard, Search, DetailDialog
  src/App.vue       # semantic shell and composition, not fetch orchestration
  vbox.config.ts    # tokens, light/dark values, cssResets, small alias vocabulary
  webpack.config.mjs
```

Vue 3, TypeScript, webpack 5, Radix Vue, TanStack Vue Query where it simplifies
request caching/cancellation, and workspace `@veebox/core`, `@veebox/vue`,
`@veebox/unplugin`, `@veebox/volar`, `@veebox/property-variance-authority`. No
Pinia is necessary for this one-screen journey; do not invent global state. No
Tailwind, Sass, competing styling framework or standalone component library.

Use semantic props and events unchanged, `vb-*` for individual styles, and `:vb`
for reusable/PVA sources. Button variants and active filter styling expose PVA
composition. At least one caller-provided style override must preserve an
internal conditional state and withdraw cleanly. Tokens and responsive/dark/
hover/focus groups should be exercised naturally, not as artificial demo knobs.
Explicit forwarding is required only where a component actually needs it.

## Tests and scope control

Use the agreed public seams: real built consumer UI, actual compiled Vue
components, and the external HTTP boundary. Deterministic museum metadata and
original synthetic artwork fixtures make CI independent of the live service.
Unexpected endpoints fail tests. No real credentials or downloaded copyrighted
images in fixtures.

Implement one red/green behavior at a time. Run Vue type checks and focused
component tests frequently; finish with real webpack dev/production Chromium,
Firefox and WebKit journeys, axe/theme/keyboard checks and the full repository
gate. Do not test generated class identifiers or private helper shapes.

The first-journey ticket stays bounded to this screen and its dialog. If an
additional user journey becomes necessary, stop expanding this slice: record a
separately reviewable issue and blocker. Visual polish within this brief is part
of #27, not permission for an unbounded design system.

## SpaceHub retention

Keep SpaceHub source, scripts and tests through implementation. The standalone
acceptance app already exercises the webpack adapter and remains independent of
either showcase. #28 must verify the replacement, preserve that bundler safety
net, update references deliberately and present any retirement as a separate PR
for maintainer acceptance. Nothing is deleted from the default branch before
review/merge; no automatic deployment replaces an existing demo.
