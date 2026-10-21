/** Node-only configuration loading; never imported by the browser entry point. */
import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import { resolveBreakpoints } from './helpers/resolveBreakpoints.js';
import { validateAliasKeys } from './helpers/resolveConfig.js';
import type { VBoxPluginOptions } from './types.js';

const filenames = [
  'vbox.config.ts',
  'vbox.config.js',
  'vbox.config.cjs',
  'vbox.config.mjs',
];
const load = createJiti(import.meta.url, {
  interopDefault: true,
  moduleCache: false,
  fsCache: false,
  tryNative: false,
});
export type ConfigLocation = { rootDir?: string; configPath?: string };

export const findVBoxConfig = (
  options: ConfigLocation = {},
  fromFile?: string,
) => {
  if (options.configPath)
    return path.resolve(options.rootDir ?? process.cwd(), options.configPath);
  let current = path.resolve(
    options.rootDir ?? (fromFile ? path.dirname(fromFile) : process.cwd()),
  );
  while (true) {
    for (const name of filenames) {
      const file = path.join(current, name);
      if (fs.existsSync(file)) return file;
    }
    const parent = path.dirname(current);
    if (current === parent || options.rootDir) return null;
    current = parent;
  }
};

export const loadVBoxConfig = (
  options: ConfigLocation = {},
  fromFile?: string,
) => {
  const file = findVBoxConfig(options, fromFile);
  if (!file) return { file: null, config: {} as VBoxPluginOptions };
  try {
    const module = load(file) as {
      default?: VBoxPluginOptions;
    } & VBoxPluginOptions;
    const config = module?.default ?? module;
    if (!config || typeof config !== 'object' || Array.isArray(config))
      throw new Error('Expected a configuration object as the default export.');
    validateAliasKeys(
      Object.keys(config.aliases?.values ?? {}),
      `${file} aliases.values`,
    );
    resolveBreakpoints(config.breakpoints);
    return { file, config };
  } catch (error) {
    throw new Error(
      `[VBox] Failed to load configuration ${file}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
};
