# Release Notes (Draft)

## @veebox/core
- Added a request-scoped SSR style collector for framework-agnostic SSR CSS extraction.
- Made CSS validation SSR-safe to avoid dropping declarations when `window` or `document` is unavailable.
- Added SSR-aware keyframes collection support.
- Added tests for SSR validation and collector behavior.

## @veebox/vue
- Added SSR helpers and context integration for collecting styles during server render.
- Mirrored SSR collector onto Nuxt `event.context` for easy head injection.
- Added an SSR smoke test and updated exports map to ensure correct ESM resolution.
