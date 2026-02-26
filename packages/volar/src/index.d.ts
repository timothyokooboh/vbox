export interface VBoxVolarPluginConfig {
  /**
   * Project root used to resolve `vbox.config.*` and `@veebox/core`.
   * Defaults to the tsconfig directory when available.
   */
  rootDir?: string;

  /**
   * Optional path to a specific VBox config file.
   * Example: "./vbox.config.ts"
   */
  configPath?: string;

  /**
   * Attribute names that should always be treated as style attrs in hover classification.
   */
  forceStyleAttrs?: string[];

  /**
   * Attribute names that should always be treated as semantic attrs in hover classification.
   */
  forceSemanticAttrs?: string[];

  /**
   * When true, treats all custom components as VBox-eligible for hover analysis.
   * Default remains opt-in custom components (except router-link/nuxt-link which are included by default).
   */
  parseAllComponents?: boolean;
}

export interface VBoxVolarPluginReturn {
  version: 2.2;
  name: 'veebox-token-hover';
  order: number;
  getEmbeddedCodes: () => [];
  resolveEmbeddedCode: (
    fileName: string,
    sfc: unknown,
    embeddedFile: unknown,
  ) => void;
}

declare function createPlugin(ctx: {
  compilerOptions?: {
    configFilePath?: string;
  };
  config?: VBoxVolarPluginConfig;
}): VBoxVolarPluginReturn;

export = createPlugin;
