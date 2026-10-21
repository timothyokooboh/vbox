const core = require('@veebox/core');
const knownCssPropertiesModule = require('known-css-properties');
const TOKEN_PREFIX_TO_CATEGORY = core.TokenCategories;
const VBOX_DEFAULT_ALIAS_KEYS = new Set(Object.keys(core.DefaultAliases));

const normalizeCssPropertyKey = (name) =>
  name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`).toLowerCase();

const { kebabToCamelCase } = core;

const getKeyVariants = (name) => {
  const normalized = normalizeCssPropertyKey(name);
  const camel = kebabToCamelCase(name);
  const lower = name.toLowerCase();
  return new Set([name, normalized, camel, lower]);
};

const buildTokenResolutionMap = (vboxConfig) => {
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
  return known;
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

module.exports = {
  buildTokenResolutionMap,
  createStyleKeyMatcher,
  buildTokenPrefixByProperty,
  getTokenCandidatesForKey,
  buildAttrCompletionKeys,
  extractTokenPrefix,
};
