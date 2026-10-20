const {
  collectNameAdvisories,
  buildNameAdvisories,
} = require('./nameAdvisories.cjs');
const { collectTokenHints, buildHoverCode } = require('./tokenPreviews.cjs');
const { templateElements } = require('./templateElements.cjs');
const path = require('node:path');
// vue-tsc injects a tree-shaken TS facade; parsing uses the full public compiler API.
const typescript = require('typescript');
const { collectExpressionCompletions } = require('./styleExpressions.cjs');
const { buildTokenTypes } = require('./completionTypes.cjs');
const { scopeCompletionCode } = require('./completionScope.cjs');
const { prioritizeEditorMappings } = require('./editorMappings.cjs');
const { createJiti } = require('jiti');
const knownCssPropertiesModule = require('known-css-properties');

const importWithJiti = createJiti(__filename, { interopDefault: true });
const core = require('@veebox/core');
const TOKEN_PREFIX_TO_CATEGORY = core.TokenCategories;

const COMPLETION_FEATURES = {
  verification: true,
  completion: true,
  semantic: true,
  navigation: true,
  structure: false,
  format: false,
};

const VBOX_DEFAULT_ALIAS_KEYS = new Set(Object.keys(core.DefaultAliases));

const isVBoxComponentTag = (tag) => tag === 'v-box' || tag === 'VBox';
const NON_TRANSFORM_NATIVE_TAGS = new Set([
  'script',
  'style',
  'meta',
  'link',
  'base',
  'title',
]);
const canProcessNativeTag = (tag) =>
  !NON_TRANSFORM_NATIVE_TAGS.has(String(tag).toLowerCase());
const TOKEN_IN_VALUE_REGEX = /\b([a-z]{1,3}-[A-Za-z0-9_-]+)\b/g;

const normalizeCssPropertyKey = (name) =>
  name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).toLowerCase();

const kebabToCamelCase = (name) =>
  name.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());

const getKeyVariants = (name) => {
  const normalized = normalizeCssPropertyKey(name);
  const camel = kebabToCamelCase(name);
  const lower = name.toLowerCase();
  return new Set([name, normalized, camel, lower]);
};

const getAttrValueContentAndOffset = (attrValueNode) => {
  const source = attrValueNode.loc.source || '';
  const quote = source[0];
  const isQuoted =
    (quote === '"' || quote === "'") && source[source.length - 1] === quote;

  const contentOffset = attrValueNode.loc.start.offset + (isQuoted ? 1 : 0);

  return {
    content: attrValueNode.content,
    offset: contentOffset,
  };
};

const resolveRootDir = (ctx, userConfig = {}) => {
  if (typeof userConfig.rootDir === 'string') {
    return path.resolve(userConfig.rootDir);
  }

  const configFilePath = ctx?.compilerOptions?.configFilePath;
  if (typeof configFilePath === 'string') {
    return path.dirname(configFilePath);
  }

  return process.cwd();
};

const configLoader = importWithJiti('@veebox/core/config');
const loadVBoxConfig = (rootDir, userConfig = {}) =>
  configLoader.loadVBoxConfig({ rootDir, configPath: userConfig.configPath })
    .config;

const buildTokenResolutionMap = (vboxConfig, rootDir) => {
  const { normalized, colorDarkMap } = core.resolveVBoxConfig(vboxConfig);

  const resolved = new Map();

  for (const [prefix, category] of Object.entries(TOKEN_PREFIX_TO_CATEGORY)) {
    const bucket = normalized?.[category] ?? {};

    for (const [key, value] of Object.entries(bucket)) {
      const token = `${prefix}-${key}`;

      if (category === 'color' && colorDarkMap?.[key]) {
        resolved.set(token, `${value} (dark: ${colorDarkMap[key]})`);
      } else {
        resolved.set(token, String(value));
      }
    }
  }

  return resolved;
};

const resolveAliasKeys = (vboxConfig = {}, pluginConfig = {}) =>
  Array.isArray(pluginConfig?.aliases)
    ? pluginConfig.aliases
    : Object.keys(vboxConfig?.aliases?.values ?? {});

const createStyleKeyMatcher = (vboxConfig = {}, pluginConfig = {}) => {
  const known = core.createStyleVocabulary(knownCssPropertiesModule.all, [
    ...(vboxConfig.aliases?.strategy === 'replace'
      ? []
      : VBOX_DEFAULT_ALIAS_KEYS),
    ...resolveAliasKeys(vboxConfig, pluginConfig),
  ]);
  return (_tag, key) => known(key);
};

const buildTokenPrefixByProperty = (vboxConfig = {}, pluginConfig = {}) => {
  const base = new Map([
    ['color', 'cl'],
    ['background', 'cl'],
    ['background-color', 'cl'],
    ['border-color', 'cl'],
    ['outline-color', 'cl'],
    ['text-decoration-color', 'cl'],
    ['caret-color', 'cl'],
    ['accent-color', 'cl'],
    ['fill', 'cl'],
    ['stroke', 'cl'],
    ['font-size', 'fs'],
    ['font-weight', 'fw'],
    ['font-family', 'ff'],
    ['line-height', 'lh'],
    ['letter-spacing', 'ls'],
    ['border-radius', 'br'],
    ['box-shadow', 'bs'],
    ['z-index', 'z'],
    ['margin', 'sp'],
    ['margin-top', 'sp'],
    ['margin-right', 'sp'],
    ['margin-bottom', 'sp'],
    ['margin-left', 'sp'],
    ['padding', 'sp'],
    ['padding-top', 'sp'],
    ['padding-right', 'sp'],
    ['padding-bottom', 'sp'],
    ['padding-left', 'sp'],
    ['gap', 'sp'],
    ['row-gap', 'sp'],
    ['column-gap', 'sp'],
    ['top', 'sp'],
    ['right', 'sp'],
    ['bottom', 'sp'],
    ['left', 'sp'],
    ['inset', 'sp'],
    ['width', 'sp'],
    ['height', 'sp'],
    ['max-width', 'sp'],
    ['min-width', 'sp'],
    ['max-height', 'sp'],
    ['min-height', 'sp'],
  ]);

  for (const property of knownCssPropertiesModule.all ?? []) {
    const key = normalizeCssPropertyKey(property);
    if (key.endsWith('-color')) base.set(key, 'cl');
    if (key.endsWith('-radius')) base.set(key, 'br');
    if (/^(margin|padding|inset)-/.test(key)) base.set(key, 'sp');
  }
  for (const property of ['border', 'outline', 'text-shadow'])
    base.set(property, 'cl');

  const effectiveAliases = core.resolveVBoxConfig(vboxConfig).aliases;
  const enabledAliases = new Set([
    ...(vboxConfig.aliases?.strategy === 'replace'
      ? []
      : Object.keys(core.DefaultAliases)),
    ...resolveAliasKeys(vboxConfig, pluginConfig).map(core.kebabToCamelCase),
  ]);
  for (const [alias, property] of Object.entries(effectiveAliases)) {
    if (!enabledAliases.has(alias)) continue;
    const css = normalizeCssPropertyKey(property);
    const prefix =
      base.get(css) ??
      (/^(margin|padding|inset)-/.test(css) ? 'sp' : undefined);
    if (!prefix) continue;
    for (const variant of getKeyVariants(alias))
      base.set(normalizeCssPropertyKey(variant), prefix);
  }

  return base;
};

const extractTokenPrefix = (value) => {
  const match = String(value || '')
    .trim()
    .match(/^([a-z]{1,3})-[A-Za-z0-9_-]*$/);
  return match ? match[1] : '';
};

const getTokenCandidatesForKey = (
  key,
  tokenMap,
  tokenPrefixByProperty,
  cache,
  typedPrefix = '',
) => {
  if (!key) return [];
  const normalized = normalizeCssPropertyKey(
    core.getStyleBindingKey(key) ?? key,
  );
  const prefixHint = String(typedPrefix || '');
  const cacheKey = `${normalized}::${prefixHint}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const propertyPrefix = tokenPrefixByProperty.get(normalized);
  const effectivePrefix = prefixHint || propertyPrefix || '';

  if (effectivePrefix) {
    const narrowed = [];
    for (const token of tokenMap.keys()) {
      if (token.startsWith(`${effectivePrefix}-`)) {
        narrowed.push(token);
      }
    }
    narrowed.sort();
    cache.set(cacheKey, narrowed);
    return narrowed;
  }

  const all = Array.from(tokenMap.keys()).sort();
  cache.set(cacheKey, all);
  return all;
};

const buildAttrCompletionKeys = (
  vboxConfig = {},
  objectStyleKeys = [],
  pluginConfig = {},
) => {
  const out = new Set();

  for (const key of vboxConfig.aliases?.strategy === 'replace'
    ? []
    : VBOX_DEFAULT_ALIAS_KEYS) {
    for (const variant of getKeyVariants(key)) {
      out.add(variant);
    }
  }

  for (const key of objectStyleKeys.flatMap((key) => [
    key,
    key.replace(/^_/, ''),
  ])) {
    for (const variant of getKeyVariants(key)) {
      out.add(variant);
    }
  }

  for (const key of resolveAliasKeys(vboxConfig, pluginConfig)) {
    for (const variant of getKeyVariants(key)) {
      out.add(variant);
    }
  }

  const knownCssProperties = Array.isArray(knownCssPropertiesModule)
    ? knownCssPropertiesModule
    : Array.isArray(knownCssPropertiesModule?.all)
      ? knownCssPropertiesModule.all
      : Array.isArray(knownCssPropertiesModule?.default)
        ? knownCssPropertiesModule.default
        : Array.isArray(knownCssPropertiesModule?.default?.all)
          ? knownCssPropertiesModule.default.all
          : [];

  for (const key of knownCssProperties) {
    const str = String(key || '').trim();
    if (!str) continue;
    for (const variant of getKeyVariants(str)) {
      out.add(variant);
    }
  }

  return Array.from(out).sort();
};

const escapeTsString = (value) =>
  String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const collectCompletionHints = (
  templateAst,
  isStyleKey,
  getTokenCandidates,
  options = {},
) => {
  const attrHints = [];
  const valueHints = [];
  const valueHintSeen = new Set();

  const pushAttrHint = (value, offset, length) => {
    if (!value || !length) return;
    attrHints.push({ value, offset, length });
  };

  const pushValueHint = (
    typedValue,
    mappedValue,
    offset,
    candidates,
    property,
  ) => {
    if (!Array.isArray(candidates)) return;
    if (typeof mappedValue !== 'string') return;
    const dedupeKey = `${offset}:${mappedValue.length}:${typedValue}`;
    if (valueHintSeen.has(dedupeKey)) return;
    valueHintSeen.add(dedupeKey);
    valueHints.push({
      typedValue,
      property,
      mappedValue,
      offset,
      candidates,
    });
  };

  for (const node of templateElements(templateAst)) {
    const tag = node.tag;
    const shouldProcessElement =
      canProcessNativeTag(tag) && !['template', 'slot'].includes(tag);
    const acceptsStyleName = (key) =>
      key === 'vb' ||
      core.getStyleBindingKey(key) !== null ||
      (isVBoxComponentTag(tag) && isStyleKey(tag, key));
    if (shouldProcessElement) {
      for (const prop of node.props) {
        if (prop.type === 6 /* ATTRIBUTE */) {
          if (!acceptsStyleName(prop.name)) continue;

          pushAttrHint(prop.name, prop.loc.start.offset, prop.name.length);

          if (!prop.value) continue;

          const { content, offset } = getAttrValueContentAndOffset(prop.value);
          const value = String(content || '');
          const fullValuePrefix = extractTokenPrefix(value);
          const candidates = getTokenCandidates(prop.name, fullValuePrefix);

          let match;
          TOKEN_IN_VALUE_REGEX.lastIndex = 0;
          while ((match = TOKEN_IN_VALUE_REGEX.exec(value)) != null) {
            const token = match[1];
            if (!token) continue;
            pushValueHint(
              token,
              token,
              offset + match.index,
              getTokenCandidates(prop.name, extractTokenPrefix(token)),
              prop.name,
            );
          }

          const partialToken = value.match(/\b([a-z]{1,3}-[\w-]*)$/);
          if (
            partialToken &&
            core.TokenCategories[extractTokenPrefix(partialToken[1])]
          ) {
            pushValueHint(
              partialToken[1],
              partialToken[1],
              offset + partialToken.index,
              getTokenCandidates(
                prop.name,
                extractTokenPrefix(partialToken[1]),
              ),
              prop.name,
            );
          }

          if (
            !/\s/.test(value) &&
            !value.includes('{') &&
            !value.includes('}')
          ) {
            if (value.length > 0) {
              pushValueHint(value, value, offset, candidates, prop.name);
            } else {
              // A zero-width insertion preserves the authored quote delimiters.
              pushValueHint(
                '',
                '',
                prop.value.loc.start.offset + 1,
                candidates,
                prop.name,
              );
            }
          }
          continue;
        }

        if (prop.type !== 7 /* DIRECTIVE */) continue;
        if (prop.name !== 'bind') continue;
        if (!prop.arg || prop.arg.type !== 4 || !prop.arg.isStatic) continue;

        const boundKey = prop.arg.content;
        if (!acceptsStyleName(boundKey)) continue;

        pushAttrHint(boundKey, prop.arg.loc.start.offset, boundKey.length);

        if (!prop.exp || prop.exp.type !== 4) continue;
        if (options.typescript) {
          const nested = collectExpressionCompletions(
            options.typescript,
            prop.exp,
            boundKey,
            getTokenCandidates,
          );
          attrHints.push(...nested.attributes);
          for (const hint of nested.values)
            pushValueHint(
              hint.typedValue,
              hint.mappedValue,
              hint.offset,
              hint.candidates,
              hint.property,
            );
          continue;
        }
        const exp = String(prop.exp.content || '');
        const candidates = getTokenCandidates(
          boundKey,
          extractTokenPrefix(exp),
        );

        let match;
        TOKEN_IN_VALUE_REGEX.lastIndex = 0;
        while ((match = TOKEN_IN_VALUE_REGEX.exec(exp)) != null) {
          const token = match[1];
          if (!token) continue;
          pushValueHint(
            token,
            token,
            prop.exp.loc.start.offset + match.index,
            getTokenCandidates(boundKey, extractTokenPrefix(token)),
            boundKey,
          );
        }
      }
    }
  }

  return {
    attrHints,
    valueHints,
  };
};

// Escape generated literal syntax without shifting the mapped authored characters.
const mappedCompletionString = (value, offset) => {
  if (!value.length) return [['', 'template', offset, COMPLETION_FEATURES]];
  const out = [];
  let start = 0;
  for (const match of value.matchAll(/[\\']/g)) {
    if (match.index > start)
      out.push([
        value.slice(start, match.index),
        'template',
        offset + start,
        COMPLETION_FEATURES,
      ]);
    out.push('\\');
    out.push([match[0], 'template', offset + match.index, COMPLETION_FEATURES]);
    start = match.index + 1;
  }
  if (start < value.length)
    out.push([
      value.slice(start),
      'template',
      offset + start,
      COMPLETION_FEATURES,
    ]);
  return out;
};

const buildCompletionCode = (
  attrHints,
  valueHints,
  attrCompletionKeys,
  options = {},
) => {
  const out = [];
  const attrUnionKeys = Array.isArray(attrCompletionKeys)
    ? attrCompletionKeys
    : [];
  const attrUnionType =
    attrUnionKeys.length > 0
      ? attrUnionKeys.map((key) => `'${escapeTsString(key)}'`).join(' | ')
      : 'string';

  const explicitKeys = [
    ...new Set(
      attrUnionKeys.flatMap((key) => {
        const camel = core.kebabToCamelCase(key);
        if (!camel) return [];
        if (key.startsWith('--')) return [`vb-${key}`];
        return [
          `vb-${core.toKebabCase(key)}`,
          `vb${camel[0].toUpperCase()}${camel.slice(1)}`,
        ];
      }),
    ),
  ];
  const explicitUnionType =
    explicitKeys.map((key) => `'${escapeTsString(key)}'`).join(' | ') ||
    'string';

  out.push(
    `type __vboxCompletionAttributes = ${attrUnionType}${options.tokenTypes ? ' | __vboxAliasKeys' : ''};\n`,
  );
  out.push(
    `type __vboxCompletionExplicitAttributes = ${explicitUnionType}${options.tokenTypes ? ' | __vboxExplicitAliasKeys' : ''};\n`,
  );
  const valueTypes = new Map();
  if (options.tokenTypes) out.push(...options.tokenTypes);
  out.push(
    `type __vboxRawValue<K> = K extends keyof import('@veebox/core').CssProperties ? import('@veebox/core').CssProperties[K] : never;\n`,
  );

  attrHints.forEach((hint, index) => {
    const type =
      !hint.objectKey &&
      (hint.value === 'vb' || core.getStyleBindingKey(hint.value) !== null)
        ? '__vboxCompletionExplicitAttributes'
        : '__vboxCompletionAttributes';
    if (hint.objectKey && !hint.quoted) {
      out.push(
        `const __vboxAttrCompletion${index}: Partial<Record<${type}, unknown>> = { `,
      );
      out.push([hint.value, 'template', hint.offset, COMPLETION_FEATURES]);
      out.push(hint.insertion ? ' };\n' : ': undefined };\n');
    } else {
      out.push(`const __vboxAttrCompletion${index}: ${type} = '`);
      out.push(...mappedCompletionString(hint.value, hint.offset));
      out.push(`';\n`);
    }
  });

  valueHints.forEach((hint, index) => {
    let type;
    if (options.tokenTypes) {
      const key =
        core.getStyleBindingKey(hint.property ?? '') ?? hint.property ?? '';
      const prefix = extractTokenPrefix(hint.typedValue);
      type = core.TokenCategories[prefix]
        ? `__vboxTokens[${JSON.stringify(prefix)}]`
        : `__vboxValue<${JSON.stringify(key)}>`;
    } else {
      const candidates = Array.from(new Set(hint.candidates));
      const signature = JSON.stringify(candidates);
      type = valueTypes.get(signature);
      if (!type) {
        type = `__vboxCompletionValues${valueTypes.size}`;
        valueTypes.set(signature, type);
        out.push(
          `type ${type} = ${candidates.map((token) => `'${escapeTsString(token)}'`).join(' | ') || 'string'};\n`,
        );
      }
    }
    const typed = hint.typedValue
      ? ` | '${escapeTsString(hint.typedValue)}'`
      : '';
    const property =
      options.resolveProperty?.(hint.property) ??
      core.kebabToCamelCase(hint.property ?? '');
    out.push(
      `const __vboxTokenCompletion${index}: ${type}${typed}${options.tokenTypes ? '' : ` | __vboxRawValue<${JSON.stringify(property)}>`} = '`,
    );
    out.push(...mappedCompletionString(hint.mappedValue, hint.offset));
    out.push(`';\n`);
  });

  return out;
};

const createPlugin = (ctx) => {
  const userConfig = ctx?.config ?? {};
  for (const key of [
    'parseAllComponents',
    'forceStyleAttrs',
    'forceSemanticAttrs',
  ]) {
    if (Object.prototype.hasOwnProperty.call(userConfig, key))
      throw new Error(
        `[VBox] ${key} was removed. Use explicit vb-* or :vb styling; semantic bindings retain ordinary Vue behavior.`,
      );
  }
  const rootDir = resolveRootDir(ctx, userConfig);
  const { ObjectStyleKeys } = core;
  let tokenMap = new Map();
  let isStyleKey;
  let tokenPrefixByProperty;
  let attrCompletionKeys;
  let fingerprint;
  let aliases;
  let config;
  const tokenCandidatesCache = new Map();
  const refreshVocabulary = () => {
    const vboxConfig = loadVBoxConfig(rootDir, userConfig);
    config = vboxConfig;
    const next = JSON.stringify(vboxConfig);
    if (next === fingerprint) return;
    tokenMap = buildTokenResolutionMap(vboxConfig, rootDir);
    aliases = core.resolveVBoxConfig(vboxConfig).aliases;
    isStyleKey = createStyleKeyMatcher(vboxConfig, userConfig);
    tokenPrefixByProperty = buildTokenPrefixByProperty(vboxConfig, userConfig);
    attrCompletionKeys = buildAttrCompletionKeys(
      { aliases: { strategy: 'replace' } },
      ObjectStyleKeys,
      { aliases: [] },
    );
    tokenCandidatesCache.clear();
    fingerprint = next;
  };
  refreshVocabulary();
  const getTokenCandidates = (key, typedPrefix = '') =>
    getTokenCandidatesForKey(
      key,
      tokenMap,
      tokenPrefixByProperty,
      tokenCandidatesCache,
      typedPrefix,
    ).flatMap((token) => {
      const dash = token.indexOf('-');
      const category = core.TokenCategories[token.slice(0, dash)];
      return category
        ? [
            token,
            `var(--${core.toKebabCase(category)}-${token.slice(dash + 1)})`,
          ]
        : [token];
    });

  const resolveTokenValue = (token) => tokenMap.get(token) ?? null;

  return {
    version: 2.2,
    name: 'veebox-token-hover',
    order: 1000,
    getEmbeddedCodes() {
      return [];
    },
    resolveEmbeddedCode(_fileName, sfc, embeddedFile) {
      if (!/^script_(js|jsx|ts|tsx)$/.test(embeddedFile.id)) return;
      if (!sfc.template?.ast) return;
      refreshVocabulary();

      const nameHints = collectNameAdvisories(sfc.template.ast, (key) =>
        isStyleKey(null, key),
      );
      const hints = collectTokenHints(sfc.template.ast, resolveTokenValue);
      const completionHints = collectCompletionHints(
        sfc.template.ast,
        isStyleKey,
        getTokenCandidates,
        {
          typescript,
        },
      );

      if (
        nameHints.length === 0 &&
        hints.length === 0 &&
        completionHints.attrHints.length === 0 &&
        completionHints.valueHints.length === 0
      ) {
        return;
      }

      if (hints.length > 0) {
        embeddedFile.content = prioritizeEditorMappings(
          embeddedFile.content,
          hints,
          'semantic',
        );
        embeddedFile.content.push('\n/* VBox token hovers */\n');
        embeddedFile.content.push(
          ...scopeCompletionCode(
            typescript,
            buildHoverCode(
              hints,
              configLoader.findVBoxConfig({
                rootDir,
                configPath: userConfig.configPath,
              }),
              config,
              ctx.compilerOptions ?? {},
            ),
            sfc.content,
          ),
        );
      }

      if (
        completionHints.attrHints.length > 0 ||
        completionHints.valueHints.length > 0
      ) {
        embeddedFile.content = prioritizeEditorMappings(embeddedFile.content, [
          ...completionHints.attrHints,
          ...completionHints.valueHints,
        ]);
        embeddedFile.content.push('\n/* VBox completions */\n');
        embeddedFile.content.push(
          ...scopeCompletionCode(
            typescript,
            buildCompletionCode(
              completionHints.attrHints,
              completionHints.valueHints,
              attrCompletionKeys,
              {
                tokenTypes: buildTokenTypes(
                  configLoader.findVBoxConfig({
                    rootDir,
                    configPath: userConfig.configPath,
                  }),
                  buildTokenResolutionMap({}, rootDir),
                  buildTokenPrefixByProperty(
                    { aliases: { strategy: 'replace', values: {} } },
                    { aliases: [] },
                  ),
                  userConfig.aliases,
                  config,
                ),
                resolveProperty: (key) => {
                  const property = core.kebabToCamelCase(
                    core.getStyleBindingKey(key ?? '') ?? key ?? '',
                  );
                  return aliases[property] ?? property;
                },
              },
            ),
            sfc.content,
          ),
        );
      }
      if (nameHints.length) {
        embeddedFile.content = prioritizeEditorMappings(
          embeddedFile.content,
          nameHints,
          'semantic',
        );
        embeddedFile.content.push(
          ...scopeCompletionCode(
            typescript,
            buildNameAdvisories(nameHints),
            sfc.content,
          ),
        );
      }
    },
  };
};

createPlugin._test = {
  buildTokenResolutionMap,
  collectTokenHints,
  collectCompletionHints,
  buildCompletionCode,
  buildTokenPrefixByProperty,
  buildAttrCompletionKeys,
  getTokenCandidatesForKey,
  createStyleKeyMatcher,
};

module.exports = createPlugin;
module.exports.default = createPlugin;
