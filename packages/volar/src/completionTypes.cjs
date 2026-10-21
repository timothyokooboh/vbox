const core = require('@veebox/core');
const path = require('node:path');

// Type imports let the editor invalidate config/token dependencies itself. A Vue
// document need not change for its imported vocabulary to become up to date.
function buildTokenTypes(
  configFile,
  defaultTokenMap,
  prefixByProperty,
  aliases,
  config,
) {
  const resolved = core.resolveVBoxConfig(config);
  const code = [
    `type __vboxConfig = ${configFile ? `typeof import(${JSON.stringify(configFile.replaceAll(path.sep, '/'))}).default` : '{}'};\n`,
    `type __vboxGet<T, K> = K extends keyof T ? NonNullable<T[K]> : {};\n`,
    `type __vboxKeys<T, Fallback = never> = string extends keyof T ? Fallback : Extract<keyof T, string>;\n`,
    `type __vboxUseDefaults = import('@veebox/core').VBoxDefaultThemeEnabled<__vboxConfig, ${config.enableDefaultTheme !== false}>;\n`,
    'type __vboxTokens = {\n',
  ];
  for (const [prefix, category] of Object.entries(core.TokenCategories)) {
    const declaration = `${category[0].toUpperCase()}${category.slice(1)}TokensInterface`;
    const defaults =
      [...defaultTokenMap.keys()]
        .filter((key) => key.startsWith(`${prefix}-`))
        .map((key) => JSON.stringify(key.slice(prefix.length + 1)))
        .join(' | ') || 'never';
    const runtimeKeys =
      Object.keys(resolved.normalized[category] ?? {})
        .map((key) => JSON.stringify(key))
        .join(' | ') || 'never';
    const keys = `__vboxKeys<__vboxGet<__vboxGet<__vboxConfig, 'theme'>, '${category}'>, ${runtimeKeys}> | Extract<keyof import('@veebox/core').${declaration}, string> | (__vboxUseDefaults extends false ? never : ${defaults})`;
    code.push(
      `${prefix}: \`${prefix}-\${${keys}}\` | \`var(--${core.toKebabCase(category)}-\${${keys}})\`;\n`,
    );
  }
  code.push('};\n');
  code.push(`
type __vboxCamel<S extends string> = S extends \`\${infer H}-\${infer T}\` ? \`\${H}\${Capitalize<__vboxCamel<T>>}\` : S;
type __vboxKebab<S extends string> = S extends \`\${infer H}\${infer T}\` ? T extends Uncapitalize<T> ? \`\${Lowercase<H>}\${__vboxKebab<T>}\` : \`\${Lowercase<H>}-\${__vboxKebab<T>}\` : S;
`);
  code.push(
    `type __vboxNormalizeAliases<T> = { [K in keyof T as K extends string ? __vboxCamel<K> : never]: T[K] };\n`,
    `type __vboxConfigAliases = __vboxNormalizeAliases<__vboxGet<__vboxGet<__vboxConfig, 'aliases'>, 'values'>>;\n`,
  );
  const customKeys = [
    ...new Set(
      Object.keys(config.aliases?.values ?? {}).map(core.kebabToCamelCase),
    ),
  ];
  code.push(
    `type __vboxCustomAliases = string extends keyof __vboxConfigAliases ? { ${customKeys.map((key) => `${JSON.stringify(key)}: ${JSON.stringify(resolved.aliases[key])}`).join('; ')} } : __vboxConfigAliases;\n`,
  );
  code.push(
    `type __vboxDeclaredAliases = __vboxNormalizeAliases<Omit<import('@veebox/core').AliasMap, keyof typeof import('@veebox/core').DefaultAliases>>;\n`,
  );
  code.push(
    `type __vboxAliasStrategy = __vboxGet<__vboxGet<__vboxConfig, 'aliases'>, 'strategy'>;\n`,
    `type __vboxReplaceAliases = __vboxAliasStrategy extends 'replace' ? true : __vboxAliasStrategy extends 'merge' ? false : ${config.aliases?.strategy === 'replace'};\n`,
    `type __vboxDefaultAliases = __vboxReplaceAliases extends true ? {} : typeof import('@veebox/core').DefaultAliases;\n`,
  );
  code.push(
    `type __vboxDiscoveredAliases = Omit<__vboxDeclaredAliases, keyof __vboxCustomAliases> & __vboxCustomAliases;\n`,
  );
  const manualKeys = Array.isArray(aliases)
    ? aliases
        .map((key) => JSON.stringify(core.kebabToCamelCase(key)))
        .join(' | ') || 'never'
    : null;
  code.push(
    `type __vboxSelectedAliases = ${manualKeys === null ? '__vboxDiscoveredAliases' : `{ [K in ${manualKeys}]: K extends keyof __vboxDiscoveredAliases ? __vboxDiscoveredAliases[K] : K }`};\n`,
  );
  code.push(
    `type __vboxAliases = Omit<__vboxDefaultAliases, keyof __vboxSelectedAliases> & __vboxSelectedAliases;\n`,
  );
  code.push(
    `type __vboxAliasKeys = Extract<keyof __vboxAliases, string> | __vboxKebab<Extract<keyof __vboxAliases, string>>;\n`,
  );
  code.push(
    'type __vboxExplicitAliasKeys = `vb-${__vboxKebab<Extract<keyof __vboxAliases, string>>}` | `vb${Capitalize<__vboxCamel<Extract<keyof __vboxAliases, string>>>}`;\n',
  );
  const resolvedAliases = resolved.aliases;
  code.push(
    `type __vboxRuntimeAliases = { ${Object.entries(resolvedAliases)
      .map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
      .join('; ')} };\n`,
  );
  code.push(
    `type __vboxAliasValue<K extends keyof __vboxAliases> = string extends __vboxAliases[K] ? K extends keyof __vboxRuntimeAliases ? __vboxRuntimeAliases[K] : never : Extract<__vboxAliases[K], string>;\n`,
  );
  code.push(
    `type __vboxProperty<K extends string> = __vboxCamel<K> extends keyof __vboxAliases ? __vboxAliasValue<__vboxCamel<K>> : __vboxCamel<K>;\n`,
  );
  code.push(
    `type __vboxPrefixByProperty = { ${[...prefixByProperty].map(([property, prefix]) => `${JSON.stringify(property)}: ${JSON.stringify(prefix)}`).join('; ')} };\n`,
  );
  code.push(
    'type __vboxPrefix<K extends string> = K extends `--${string}` ? keyof __vboxTokens : __vboxKebab<__vboxProperty<K>> extends keyof __vboxPrefixByProperty ? __vboxPrefixByProperty[__vboxKebab<__vboxProperty<K>>] : never;\n',
  );
  code.push(
    `type __vboxValue<K extends string> = __vboxRawValue<__vboxProperty<K>> | __vboxTokens[__vboxPrefix<K>];\n`,
  );
  return code;
}

module.exports = { buildTokenTypes };
