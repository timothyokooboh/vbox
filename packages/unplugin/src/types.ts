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
}

export interface VBoxSfcTransformPayload {
  code: string;
  dependencies?: string[];
  warnings?: Array<{
    message: string;
    loc: { line: number; column: number; offset: number };
  }>;
  map: import('magic-string').SourceMap | null;
}

export type VBoxSfcTransformResult = VBoxSfcTransformPayload | null;

export interface VBoxVitePlugin {
  name: string;
  enforce: 'pre';
  handleHotUpdate?: (ctx: {
    file: string;
    server: {
      moduleGraph: { invalidateAll: () => void };
      ws: { send: (payload: { type: 'full-reload' }) => void };
    };
  }) => [] | void;
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
