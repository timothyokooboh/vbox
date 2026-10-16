const path = require('node:path');
// vue-tsc injects a tree-shaken TS facade; parsing uses the full public compiler API.
const typescript = require('typescript');
const { buildHoverTypes } = require('./hoverTypes.cjs');
const { staticAttributeText } = require('./attributeText.cjs');
const { collectLiteralValues } = require('./literalValues.cjs');
const { collectExpressionCompletions } = require('./styleExpressions.cjs');
const { buildTokenTypes } = require('./completionTypes.cjs');
const { scopeCompletionCode } = require('./completionScope.cjs');
const { prioritizeStyleCompletions } = require('./completionMappings.cjs');
const { createJiti } = require('jiti');
const knownCssPropertiesModule = require('known-css-properties');

const importWithJiti = createJiti(__filename, { interopDefault: true });
const core = require('@veebox/core');
const TOKEN_PREFIX_TO_CATEGORY = core.TokenCategories;

const GLOBAL_SEMANTIC_ATTRIBUTES = new Set([
  'id',
  'class',
  'style',
  'title',
  'lang',
  'dir',
  'hidden',
  'tabindex',
  'contenteditable',
  'draggable',
  'spellcheck',
  'translate',
  'role',
  'slot',
  'is',
  'part',
  'inert',
  'popover',
  'inputmode',
  'nonce',
  'accesskey',
  'autocapitalize',
  'autocorrect',
  'enterkeyhint',
  'exportparts',
  'itemid',
  'itemprop',
  'itemref',
  'itemscope',
  'itemtype',
  'virtualkeyboardpolicy',
]);

const SEMANTIC_ATTRIBUTES_BY_TAG = {
  a: [
    'download',
    'href',
    'hreflang',
    'ping',
    'referrerpolicy',
    'rel',
    'target',
    'type',
  ],
  area: [
    'alt',
    'coords',
    'download',
    'href',
    'ping',
    'referrerpolicy',
    'rel',
    'shape',
    'target',
  ],
  audio: [
    'autoplay',
    'controls',
    'crossorigin',
    'loop',
    'muted',
    'preload',
    'src',
  ],
  base: ['href', 'target'],
  blockquote: ['cite'],
  button: [
    'disabled',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'name',
    'popovertarget',
    'popovertargetaction',
    'type',
    'value',
  ],
  canvas: [],
  col: ['span'],
  colgroup: ['span'],
  data: ['value'],
  del: ['cite', 'datetime'],
  details: ['name', 'open'],
  embed: ['src', 'type'],
  fieldset: ['disabled', 'form', 'name'],
  form: [
    'accept-charset',
    'action',
    'autocomplete',
    'enctype',
    'method',
    'name',
    'novalidate',
    'rel',
    'target',
  ],
  iframe: [
    'allow',
    'allowfullscreen',
    'loading',
    'name',
    'referrerpolicy',
    'sandbox',
    'src',
    'srcdoc',
  ],
  img: [
    'alt',
    'crossorigin',
    'decoding',
    'fetchpriority',
    'ismap',
    'loading',
    'referrerpolicy',
    'sizes',
    'src',
    'srcset',
    'usemap',
  ],
  input: [
    'accept',
    'alt',
    'autocomplete',
    'autofocus',
    'capture',
    'checked',
    'dirname',
    'disabled',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'list',
    'max',
    'maxlength',
    'min',
    'minlength',
    'multiple',
    'name',
    'pattern',
    'placeholder',
    'readonly',
    'required',
    'src',
    'step',
    'type',
    'value',
  ],
  ins: ['cite', 'datetime'],
  label: ['for', 'form'],
  li: ['value'],
  link: [
    'as',
    'crossorigin',
    'disabled',
    'fetchpriority',
    'href',
    'hreflang',
    'imagesizes',
    'imagesrcset',
    'integrity',
    'media',
    'referrerpolicy',
    'rel',
    'sizes',
    'type',
  ],
  map: ['name'],
  meter: ['form', 'high', 'low', 'max', 'min', 'optimum', 'value'],
  object: ['data', 'form', 'name', 'type', 'usemap'],
  ol: ['reversed', 'start', 'type'],
  optgroup: ['disabled', 'label'],
  option: ['disabled', 'label', 'selected', 'value'],
  output: ['for', 'form', 'name'],
  progress: ['max', 'value'],
  q: ['cite'],
  script: [
    'async',
    'blocking',
    'crossorigin',
    'defer',
    'fetchpriority',
    'integrity',
    'nomodule',
    'nonce',
    'referrerpolicy',
    'src',
    'type',
  ],
  select: ['autocomplete', 'disabled', 'form', 'multiple', 'name', 'required'],
  slot: ['name'],
  source: ['media', 'src', 'srcset', 'type'],
  style: ['blocking', 'media', 'nonce', 'title'],
  td: ['colspan', 'headers', 'rowspan'],
  textarea: [
    'autocomplete',
    'autocorrect',
    'autofocus',
    'cols',
    'dirname',
    'disabled',
    'form',
    'maxlength',
    'minlength',
    'name',
    'placeholder',
    'readonly',
    'required',
    'rows',
    'wrap',
  ],
  th: ['abbr', 'colspan', 'headers', 'rowspan', 'scope'],
  time: ['datetime'],
  track: ['default', 'kind', 'label', 'src', 'srclang'],
  video: [
    'autoplay',
    'controls',
    'crossorigin',
    'loop',
    'muted',
    'playsinline',
    'poster',
    'preload',
    'src',
  ],
  svg: ['viewBox', 'preserveAspectRatio', 'xmlns'],
  path: ['d', 'pathLength'],
  use: ['href', 'xlink:href'],
  image: ['href', 'x', 'y', 'preserveAspectRatio', 'xlink:href'],
};

const HOVER_FEATURES = {
  verification: false,
  completion: false,
  semantic: true,
  navigation: true,
  structure: false,
  format: false,
};

const COMPLETION_FEATURES = {
  verification: true,
  completion: true,
  semantic: true,
  navigation: true,
  structure: false,
  format: false,
};

const VBOX_DEFAULT_ALIAS_KEYS = new Set(Object.keys(core.DefaultAliases));

const isNativeHtmlTag = (tag) => /^[a-z][a-z0-9]*$/.test(tag);
const isVBoxComponentTag = (tag) => tag === 'v-box' || tag === 'VBox';
const isFrameworkLinkTag = (tag) => {
  const normalized = String(tag)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/^[-_]+/, '')
    .toLowerCase();
  return normalized === 'router-link' || normalized === 'nuxt-link';
};
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

const setHasAnyVariant = (set, name) => {
  for (const variant of getKeyVariants(name)) {
    if (set.has(variant)) return true;
  }
  return false;
};

const toVariantSet = (list) => {
  const set = new Set();
  for (const item of list) {
    for (const variant of getKeyVariants(item)) {
      set.add(variant);
    }
  }
  return set;
};

const GLOBAL_SEMANTIC_SET = toVariantSet(
  Array.from(GLOBAL_SEMANTIC_ATTRIBUTES),
);
const TAG_SEMANTIC_SET_MAP = new Map(
  Object.entries(SEMANTIC_ATTRIBUTES_BY_TAG).map(([tag, attrs]) => [
    String(tag).toLowerCase(),
    toVariantSet(attrs),
  ]),
);

const isSemanticAttributeForTag = (tag, key) => {
  if (!tag || !key) return false;
  if (key.startsWith('aria-') || key.startsWith('data-')) return true;
  if (setHasAnyVariant(GLOBAL_SEMANTIC_SET, key)) return true;
  const perTag = TAG_SEMANTIC_SET_MAP.get(String(tag).toLowerCase());
  return perTag ? setHasAnyVariant(perTag, key) : false;
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
  const userAliases = new Set(resolveAliasKeys(vboxConfig, pluginConfig));
  const forceStyleAttrs = new Set([
    ...(vboxConfig?.compiler?.forceStyleAttrs ?? []),
    ...(pluginConfig?.forceStyleAttrs ?? []),
  ]);
  const forceSemanticAttrs = new Set([
    ...(vboxConfig?.compiler?.forceSemanticAttrs ?? []),
    ...(pluginConfig?.forceSemanticAttrs ?? []),
  ]);

  return (tag, key) => {
    if (!key) return false;
    if (setHasAnyVariant(forceSemanticAttrs, key)) return false;
    if (setHasAnyVariant(forceStyleAttrs, key)) return true;
    if (isSemanticAttributeForTag(tag, key)) return false;
    if (key.startsWith('aria-') || key.startsWith('data-')) return false;
    if (key.includes(':')) return false;
    if (setHasAnyVariant(VBOX_DEFAULT_ALIAS_KEYS, key)) return true;
    if (setHasAnyVariant(userAliases, key)) return true;

    // Keep this permissive for plain CSS keys.
    return /^[A-Za-z_][A-Za-z0-9_-]*$/.test(key) || key.startsWith('--');
  };
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

const collectTokenHints = (
  templateAst,
  resolveTokenValue,
  isStyleKey,
  options = {},
) => {
  const hints = [];
  const pushTokensFromValue = ({ content: value, startAt, endAt }) => {
    let match;
    TOKEN_IN_VALUE_REGEX.lastIndex = 0;
    while ((match = TOKEN_IN_VALUE_REGEX.exec(value)) != null) {
      const token = match[1];
      if (!token) continue;

      const resolved = resolveTokenValue(token);
      if (!resolved && !core.TokenCategories[token.split('-')[0]]) continue;

      hints.push({
        token,
        resolved,
        offset: startAt(match.index),
        length: endAt(match.index + token.length) - startAt(match.index),
      });
    }
  };

  const walk = (node, ignored) => {
    if (!node) return;

    if (node.type === 0 /* ROOT */) {
      for (const child of node.children || []) {
        walk(child, ignored);
      }
      return;
    }

    if (node.type === 9 /* IF */) {
      for (const branch of node.branches || []) {
        walk(branch, ignored);
      }
      return;
    }

    if (node.type === 10 /* IF_BRANCH */) {
      for (const child of node.children || []) {
        walk(child, ignored);
      }
      return;
    }

    if (node.type === 11 /* FOR */) {
      for (const child of node.children || []) {
        walk(child, ignored);
      }
      return;
    }

    if (node.type !== 1 /* ELEMENT */) return;

    // Previews explain token values, not whether a binding is compiled as styling.
    const shouldProcessElement = canProcessNativeTag(node.tag);

    if (shouldProcessElement) {
      for (const prop of node.props) {
        if (prop.type === 6 /* ATTRIBUTE */) {
          if (!prop.value) continue;
          if (prop.name === 'vbox' || prop.name === 'vbox-ignore') continue;

          pushTokensFromValue(staticAttributeText(prop.value));
          continue;
        }

        if (prop.type !== 7 /* DIRECTIVE */) continue;
        if (prop.name !== 'bind') continue;
        if (!prop.exp || prop.exp.type !== 4) continue;
        for (const value of collectLiteralValues(prop.exp)) {
          pushTokensFromValue(value);
        }
      }
    }

    const nextIgnored = false;

    for (const child of node.children || []) {
      walk(child, nextIgnored);
    }
  };

  for (const child of templateAst.children || []) {
    walk(child, false);
  }

  return hints;
};

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

  const walk = (node, ignored) => {
    if (!node) return;

    if (node.type === 0 /* ROOT */) {
      for (const child of node.children || []) {
        walk(child, ignored);
      }
      return;
    }

    if (node.type === 9 /* IF */) {
      for (const branch of node.branches || []) {
        walk(branch, ignored);
      }
      return;
    }

    if (node.type === 10 /* IF_BRANCH */) {
      for (const child of node.children || []) {
        walk(child, ignored);
      }
      return;
    }

    if (node.type === 11 /* FOR */) {
      for (const child of node.children || []) {
        walk(child, ignored);
      }
      return;
    }

    if (node.type !== 1 /* ELEMENT */) return;

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
          if (prop.name === 'vbox' || prop.name === 'vbox-ignore') continue;
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

    const nextIgnored = false;
    for (const child of node.children || []) {
      walk(child, nextIgnored);
    }
  };

  for (const child of templateAst.children || []) {
    walk(child, false);
  }

  return {
    attrHints,
    valueHints,
  };
};

const buildHoverCode = (hints, configFile, config, compilerOptions) => {
  const { code: out, snapshot } = buildHoverTypes(
    configFile,
    config,
    compilerOptions,
  );
  for (const hint of hints) {
    const dash = hint.token.indexOf('-');
    const category = core.TokenCategories[hint.token.slice(0, dash)];
    const key = hint.token.slice(dash + 1);
    out.push(
      `({} as __vboxHoverProperty<${JSON.stringify(category)}, ${JSON.stringify(key)}, ${JSON.stringify(hint.resolved)}, {\n/** VBox token preview: ${snapshot ? 'configured snapshot (untyped config imports); refreshes on template edits' : 'configured value'}, not browser-computed. */\n${JSON.stringify(hint.token)}: __vboxHoverValue<${JSON.stringify(category)}, ${JSON.stringify(key)}, ${JSON.stringify(hint.resolved)}> } >)[`,
    );
    // Match Vue's string-key boundary protocol so quotes do not extend the source span.
    const boundary = Symbol('template');
    out.push([
      '',
      'template',
      hint.offset,
      { ...HOVER_FEATURES, __combineToken: boundary },
    ]);
    out.push("'");
    out.push([
      hint.token,
      'template',
      hint.offset,
      { __combineToken: boundary },
    ]);
    out.push("'");
    out.push([
      '',
      'template',
      hint.offset + hint.length,
      { __combineToken: boundary },
    ]);
    out.push('];\n');
  }
  return out;
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

      const hints = collectTokenHints(
        sfc.template.ast,
        resolveTokenValue,
        isStyleKey,
        { parseAllComponents: userConfig.parseAllComponents !== false },
      );
      const completionHints = collectCompletionHints(
        sfc.template.ast,
        isStyleKey,
        getTokenCandidates,
        {
          parseAllComponents: userConfig.parseAllComponents !== false,
          typescript,
        },
      );

      if (
        hints.length === 0 &&
        completionHints.attrHints.length === 0 &&
        completionHints.valueHints.length === 0
      ) {
        return;
      }

      if (hints.length > 0) {
        embeddedFile.content = prioritizeStyleCompletions(
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
        embeddedFile.content = prioritizeStyleCompletions(
          embeddedFile.content,
          [...completionHints.attrHints, ...completionHints.valueHints],
        );
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
const makeMappedIdentifier = (index, length) => {
  if (length <= 1) return 'v';

  const seed = index.toString(36);
  const head = `v${seed}`;

  if (head.length === length) return head;
  if (head.length < length) return `${head}${'_'.repeat(length - head.length)}`;

  return `v${seed.slice(0, Math.max(1, length - 1))}`;
};
