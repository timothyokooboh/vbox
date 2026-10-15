export interface VBoxNativePluginOptions {
  /**
   * Optional path to vbox config file used to auto-load aliases.
   * If omitted, vbox config is discovered by walking up from each transformed file.
   */
  configPath?: string;

  /**
   * Base directory for resolving `configPath` when a relative path is used.
   * Defaults to `process.cwd()`.
   */
  rootDir?: string;

  /**
   * Custom alias keys defined in vbox.config.ts (for example ['borderR']).
   * Manual override. When provided, this replaces aliases auto-loaded from vbox config.
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
   * Default is `true`.
   * Set to `false` to make custom components opt-in via `vbox`
   * (framework link components `router-link`, `nuxt-link` are still parsed by default).
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

export interface VBoxWebpackRule {
  test?: RegExp;
  enforce?: 'pre' | 'post';
  use?: Array<{
    loader: string;
    options?: VBoxNativePluginOptions;
  }>;
}

export interface VBoxWebpackCompiler {
  options: {
    module?: {
      rules?: VBoxWebpackRule[];
    };
  };
  hooks: {
    environment: {
      tap: (name: string, callback: () => void) => void;
    };
  };
}

export interface VBoxWebpackPlugin {
  name: string;
  apply: (compiler: VBoxWebpackCompiler) => void;
}
