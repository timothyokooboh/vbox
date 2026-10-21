const ts = require('typescript');
const path = require('node:path');

/** Avoid TS's error-any poisoning when a valid runtime config imports untyped JS. */
function configTypeImport(configFile, config, compilerOptions) {
  const pending = configFile ? [configFile] : [];
  const visited = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (visited.has(file) || /\.d\.[cm]?ts$/.test(file)) continue;
    visited.add(file);
    if (!compilerOptions.allowJs && /\.[cm]?jsx?$/.test(file)) {
      return { type: JSON.stringify(config), snapshot: true };
    }
    const source = ts.sys.readFile(file);
    if (!source) continue;
    for (const { fileName } of ts.preProcessFile(source).importedFiles) {
      const resolved = ts.resolveModuleName(
        fileName,
        file,
        compilerOptions,
        ts.sys,
      ).resolvedModule;
      if (resolved) pending.push(resolved.resolvedFileName);
    }
  }
  return {
    type: configFile
      ? `typeof import(${JSON.stringify(configFile.replaceAll(path.sep, '/'))}).default`
      : '{}',
    snapshot: false,
  };
}
module.exports = { configTypeImport };
