export interface VBoxNativePluginOptions {
  /**
   * Custom alias keys defined in vbox.config.ts (for example ['borderR']).
   * Pass alias keys so the compiler treats them as style attributes.
   */
  aliases?: string[];

  /**
   * Attribute names that should always be treated as style attributes.
   * Useful to override semantic collisions in edge-cases.
   */
  forceStyleAttrs?: string[];

  /**
   * Attribute names that should always be treated as semantic attributes.
   * Useful to patch new/unknown platform attributes before an upstream release.
   */
  forceSemanticAttrs?: string[];

  /**
   * When true, parse all custom components globally.
   * Use with care: this can collide with semantic component props like `color` or `size`.
   *
   * Default behavior keeps custom components opt-in via `vbox`,
   * except framework link components (`router-link`, `nuxt-link`) which are parsed by default.
   */
  parseAllComponents?: boolean;
}

export interface VBoxSfcTransformPayload {
  code: string;
  map: null;
}

export type VBoxSfcTransformResult = VBoxSfcTransformPayload | null;

export interface VBoxVitePlugin {
  name: string;
  enforce: 'pre';
  transform: (code: string, id: string) => VBoxSfcTransformResult;
}
