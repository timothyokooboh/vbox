# Full SSR Support

VBox currently works out of the box in client-rendered Vue applications. For SSR
setups (for example, Nuxt with SSR enabled), there is a brief flash of unstyled
content.

Work is underway to support static CSS extraction, allowing VBox to emit a CSS
file that can be loaded before hydration. This will enable seamless SSR
rendering with no visual flashes and improved first paint.
