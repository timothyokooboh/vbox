const { configTypeImport } = require('./configTypeImport.cjs');
const core = require('@veebox/core');

// Imported literal types keep values live when config changes but the SFC does not.
function buildHoverTypes(configFile, config, compilerOptions) {
  const imported = configTypeImport(configFile, config, compilerOptions);
  const code = [
    `type __vboxHoverConfig = ${imported.type};\n`,
    `type __vboxHoverDefaults = ${JSON.stringify(core.DefaultTheme)};\n`,
    `type __vboxHoverDefaultsEnabled = 'enableDefaultTheme' extends keyof __vboxHoverConfig ? boolean extends __vboxHoverGet<__vboxHoverConfig, 'enableDefaultTheme'> ? ${config.enableDefaultTheme !== false} : __vboxHoverGet<__vboxHoverConfig, 'enableDefaultTheme'> : true;\n`,
    `
type __vboxHoverGet<T, K, F = never> = K extends keyof T ? NonNullable<T[K]> : F;
type __vboxHoverCustom<C> = __vboxHoverGet<__vboxHoverGet<__vboxHoverConfig, 'theme', {}>, C, {}>;
type __vboxHoverLookup<C, K> = K extends keyof __vboxHoverCustom<C> ? __vboxHoverCustom<C>[K] : __vboxHoverDefaultsEnabled extends false ? never : __vboxHoverGet<__vboxHoverGet<__vboxHoverDefaults, C>, K>;
type __vboxHoverProperty<C, K, F, T> = K extends keyof __vboxHoverCustom<C> ? string extends keyof __vboxHoverCustom<C> ? F extends null ? {} : T : T : __vboxHoverDefaultsEnabled extends false ? {} : K extends keyof __vboxHoverGet<__vboxHoverDefaults, C> ? T : {};
type __vboxHoverSnapshot<F> = F extends string ? \`\${F} (snapshot: config value type widened)\` : F;
type __vboxHoverFormat<V, C, F, Seen> = 0 extends (1 & V) ? __vboxHoverSnapshot<F> : V extends string ? string extends V ? __vboxHoverSnapshot<F> : V extends \`$\${infer Category}.\${infer Key}\` ? C extends 'color' ? \`var(--color-\${Key})\` : [__vboxHoverLookup<Category, Key>] extends [never] ? V : __vboxHoverValue<Category, Key, F, Seen> : V : V extends { default: infer D extends string } ? string extends D ? __vboxHoverSnapshot<F> : V extends { dark: infer Dark extends string } ? string extends Dark ? __vboxHoverSnapshot<F> : \`\${D} (dark: \${Dark})\` : D : F;
type __vboxHoverValue<C extends string, K extends string, F, Seen = never> = 0 extends (1 & __vboxHoverLookup<C, K>) ? __vboxHoverSnapshot<F> : \`\${C}.\${K}\` extends Seen ? 'Unresolved circular token reference' : [__vboxHoverLookup<C, K>] extends [never] ? F : __vboxHoverFormat<__vboxHoverLookup<C, K>, C, F, Seen | \`\${C}.\${K}\`>;
`,
  ];
  return { code, snapshot: imported.snapshot };
}
module.exports = { buildHoverTypes };
