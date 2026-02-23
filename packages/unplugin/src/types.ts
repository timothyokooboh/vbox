export interface VBoxNativePluginOptions {
  /**
   * Custom alias keys defined in vbox.config.ts (for example ['borderR']).
   * Pass alias keys so the compiler treats them as style attributes.
   */
  aliases?: string[];
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
