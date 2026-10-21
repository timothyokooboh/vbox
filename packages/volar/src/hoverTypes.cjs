const { configTypeImport } = require('./configTypeImport.cjs');
const core = require('@veebox/core');

// Imported literal types keep values live when config changes but the SFC does not.
function buildHoverTypes(configFile, config, compilerOptions) {
  const imported = configTypeImport(configFile, config, compilerOptions);
  const code = [
    `type __vboxHoverConfig = ${imported.type};\n`,
    `type __vboxHoverDefaults = ${JSON.stringify(core.DefaultTheme)};\n`,
    `type __vboxHoverToken<C extends string, K extends string, F> = import('@veebox/core').VBoxTokenPreview<__vboxHoverConfig, __vboxHoverDefaults, C, K, F, ${config.enableDefaultTheme !== false}>;\n`,
    `type __vboxHoverProperty<C extends string, K extends string, F, T> = __vboxHoverToken<C, K, F>['exists'] extends true ? T : {};\n`,
    `type __vboxHoverValue<C extends string, K extends string, F> = __vboxHoverToken<C, K, F>['value'];\n`,
  ];
  return { code, snapshot: imported.snapshot };
}
module.exports = { buildHoverTypes };
