const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { createJiti } = require('jiti');

const importWithJiti = createJiti(__filename, { interopDefault: true });
const requireFromHere = createRequire(__filename);

const loadCoreExports = (rootDir) => {
  const loadCoreModule = (specifier) => {
    const mod = importWithJiti(specifier);
    if (mod && (mod.DefaultTheme || mod.deepMerge || mod.normalizeTheme)) {
      return mod;
    }
    return null;
  };

  try {
    const core = loadCoreModule('@veebox/core');
    if (core) {
      return {
        DefaultTheme: core?.DefaultTheme ?? {},
        deepMerge:
          core?.deepMerge ?? ((base, extra) => ({ ...base, ...extra })),
        normalizeTheme:
          core?.normalizeTheme ??
          ((theme) => ({ normalized: theme ?? {}, colorDarkMap: {} })),
      };
    }
  } catch {
    // fallback below
  }

  const base = rootDir || process.cwd();
  const fallbacks = [];

  try {
    const resolved = requireFromHere.resolve('@veebox/core', {
      paths: [base, process.cwd(), __dirname],
    });
    fallbacks.push(resolved);
  } catch {
    // ignore
  }

  fallbacks.push(
    path.resolve(base, 'node_modules/@veebox/core/dist/index.es.js'),
    path.resolve(base, 'node_modules/@veebox/core/dist/index.umd.js'),
    path.resolve(base, '../../packages/core/dist/index.es.js'),
    path.resolve(base, '../../packages/core/dist/index.umd.js'),
  );

  for (const specifier of fallbacks) {
    if (!specifier) continue;
    if (specifier.startsWith('/') && !fs.existsSync(specifier)) continue;
    try {
      const core = loadCoreModule(specifier);
      if (!core) continue;
      return {
        DefaultTheme: core?.DefaultTheme ?? {},
        deepMerge:
          core?.deepMerge ?? ((baseValue, extra) => ({ ...baseValue, ...extra })),
        normalizeTheme:
          core?.normalizeTheme ??
          ((theme) => ({ normalized: theme ?? {}, colorDarkMap: {} })),
      };
    } catch {
      // continue
    }
  }

  return {
    DefaultTheme: {},
    deepMerge: (baseValue, extra) => ({ ...baseValue, ...extra }),
    normalizeTheme: (theme) => ({
      normalized: theme ?? {},
      colorDarkMap: {},
    }),
  };
};

const TOKEN_PREFIX_TO_CATEGORY = {
  cl: 'color',
  fs: 'fontSize',
  fw: 'fontWeight',
  ff: 'fontFamily',
  sp: 'spacing',
  lh: 'lineHeight',
  ls: 'letterSpacing',
  br: 'borderRadius',
  bs: 'boxShadow',
  z: 'zIndex',
};

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
  a: ['download', 'href', 'hreflang', 'ping', 'referrerpolicy', 'rel', 'target', 'type'],
  area: ['alt', 'coords', 'download', 'href', 'ping', 'referrerpolicy', 'rel', 'shape', 'target'],
  audio: ['autoplay', 'controls', 'crossorigin', 'loop', 'muted', 'preload', 'src'],
  base: ['href', 'target'],
  blockquote: ['cite'],
  button: ['disabled', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'name', 'popovertarget', 'popovertargetaction', 'type', 'value'],
  canvas: [],
  col: ['span'],
  colgroup: ['span'],
  data: ['value'],
  del: ['cite', 'datetime'],
  details: ['name', 'open'],
  embed: ['src', 'type'],
  fieldset: ['disabled', 'form', 'name'],
  form: ['accept-charset', 'action', 'autocomplete', 'enctype', 'method', 'name', 'novalidate', 'rel', 'target'],
  iframe: ['allow', 'allowfullscreen', 'loading', 'name', 'referrerpolicy', 'sandbox', 'src', 'srcdoc'],
  img: ['alt', 'crossorigin', 'decoding', 'fetchpriority', 'ismap', 'loading', 'referrerpolicy', 'sizes', 'src', 'srcset', 'usemap'],
  input: ['accept', 'alt', 'autocomplete', 'autofocus', 'capture', 'checked', 'dirname', 'disabled', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget', 'list', 'max', 'maxlength', 'min', 'minlength', 'multiple', 'name', 'pattern', 'placeholder', 'readonly', 'required', 'src', 'step', 'type', 'value'],
  ins: ['cite', 'datetime'],
  label: ['for', 'form'],
  li: ['value'],
  link: ['as', 'crossorigin', 'disabled', 'fetchpriority', 'href', 'hreflang', 'imagesizes', 'imagesrcset', 'integrity', 'media', 'referrerpolicy', 'rel', 'sizes', 'type'],
  map: ['name'],
  meter: ['form', 'high', 'low', 'max', 'min', 'optimum', 'value'],
  object: ['data', 'form', 'name', 'type', 'usemap'],
  ol: ['reversed', 'start', 'type'],
  optgroup: ['disabled', 'label'],
  option: ['disabled', 'label', 'selected', 'value'],
  output: ['for', 'form', 'name'],
  progress: ['max', 'value'],
  q: ['cite'],
  script: ['async', 'blocking', 'crossorigin', 'defer', 'fetchpriority', 'integrity', 'nomodule', 'nonce', 'referrerpolicy', 'src', 'type'],
  select: ['autocomplete', 'disabled', 'form', 'multiple', 'name', 'required'],
  slot: ['name'],
  source: ['media', 'src', 'srcset', 'type'],
  style: ['blocking', 'media', 'nonce', 'title'],
  td: ['colspan', 'headers', 'rowspan'],
  textarea: ['autocomplete', 'autocorrect', 'autofocus', 'cols', 'dirname', 'disabled', 'form', 'maxlength', 'minlength', 'name', 'placeholder', 'readonly', 'required', 'rows', 'wrap'],
  th: ['abbr', 'colspan', 'headers', 'rowspan', 'scope'],
  time: ['datetime'],
  track: ['default', 'kind', 'label', 'src', 'srclang'],
  video: ['autoplay', 'controls', 'crossorigin', 'loop', 'muted', 'playsinline', 'poster', 'preload', 'src'],
  svg: ['viewBox', 'preserveAspectRatio', 'xmlns'],
  path: ['d', 'pathLength'],
  use: ['href', 'xlink:href'],
  image: ['href', 'x', 'y', 'preserveAspectRatio', 'xlink:href'],
};

const HOVER_FEATURES = {
  verification: true,
  completion: false,
  semantic: true,
  navigation: true,
  structure: false,
  format: false,
};

const VBOX_DEFAULT_ALIAS_KEYS = new Set([
  'w',
  'maxW',
  'minW',
  'h',
  'maxH',
  'minH',
  'fs',
  'fw',
  'ff',
  'lh',
  'ls',
  'm',
  'mt',
  'mb',
  'ml',
  'mr',
  'mx',
  'my',
  'p',
  'pt',
  'pb',
  'pl',
  'pr',
  'px',
  'py',
  'bg',
  'bgColor',
  'bgSize',
  'bgPosition',
  'bgImage',
  'bgClip',
  'bgRepeat',
  'bgAttachment',
  'bgOrigin',
  'radius',
  'shadow',
]);

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

const GLOBAL_SEMANTIC_SET = toVariantSet(Array.from(GLOBAL_SEMANTIC_ATTRIBUTES));
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

const loadVBoxConfig = (rootDir, userConfig = {}) => {
  const explicitPath =
    typeof userConfig.configPath === 'string'
      ? path.resolve(rootDir, userConfig.configPath)
      : null;

  const candidates = explicitPath
    ? [explicitPath]
    : [
        path.join(rootDir, 'vbox.config.ts'),
        path.join(rootDir, 'vbox.config.js'),
        path.join(rootDir, 'vbox.config.cjs'),
        path.join(rootDir, 'vbox.config.mjs'),
      ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;

    try {
      const mod = importWithJiti(candidate);
      return mod?.default ?? mod;
    } catch {
      return null;
    }
  }

  return null;
};

const buildTokenResolutionMap = (vboxConfig, rootDir) => {
  const { DefaultTheme, deepMerge, normalizeTheme } = loadCoreExports(rootDir);
  const enableDefaultTheme = vboxConfig?.enableDefaultTheme !== false;
  const baseTheme = enableDefaultTheme ? DefaultTheme : {};
  const mergedTheme = deepMerge(baseTheme, vboxConfig?.theme ?? {});
  const { normalized, colorDarkMap } = normalizeTheme(mergedTheme);

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

const createStyleKeyMatcher = (vboxConfig = {}, pluginConfig = {}) => {
  const userAliases = new Set(Object.keys(vboxConfig?.aliases?.values ?? {}));
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

const collectTokenHints = (templateAst, resolveTokenValue, isStyleKey, options = {}) => {
  const hints = [];
  const pushTokensFromValue = (value, offset) => {
    let match;
    TOKEN_IN_VALUE_REGEX.lastIndex = 0;
    while ((match = TOKEN_IN_VALUE_REGEX.exec(value)) != null) {
      const token = match[1];
      if (!token) continue;

      const resolved = resolveTokenValue(token);
      if (!resolved) continue;

      hints.push({
        token,
        resolved,
        offset: offset + match.index,
        length: token.length,
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

    const tag = node.tag;
    let hasVBoxMarker = false;
    let hasIgnoreMarker = false;

    for (const prop of node.props) {
      if (prop.type === 6 /* ATTRIBUTE */) {
        if (prop.name === 'vbox') hasVBoxMarker = true;
        if (prop.name === 'vbox-ignore') hasIgnoreMarker = true;
      }
    }

    const nativeAutoEligible =
      !ignored &&
      isNativeHtmlTag(tag) &&
      canProcessNativeTag(tag);
    const isCustomComponent = !isNativeHtmlTag(tag) && !isVBoxComponentTag(tag);
    const frameworkLinkAutoEligible =
      !ignored &&
      isCustomComponent &&
      isFrameworkLinkTag(tag);
    const vboxComponentEligible = !ignored && isVBoxComponentTag(tag);
    const markedCustomComponentEligible =
      !ignored &&
      hasVBoxMarker &&
      isCustomComponent;
    const globalCustomComponentEligible =
      !ignored &&
      options.parseAllComponents === true &&
      isCustomComponent;

    const shouldProcessElement =
      !ignored &&
      !hasIgnoreMarker &&
      (
        nativeAutoEligible ||
        frameworkLinkAutoEligible ||
        markedCustomComponentEligible ||
        globalCustomComponentEligible ||
        vboxComponentEligible
      );

    if (shouldProcessElement) {
      for (const prop of node.props) {
        if (prop.type === 6 /* ATTRIBUTE */) {
          if (!prop.value) continue;
          if (prop.name === 'vbox' || prop.name === 'vbox-ignore') continue;
          if (!isStyleKey(tag, prop.name)) continue;

          const { content, offset } = getAttrValueContentAndOffset(prop.value);
          pushTokensFromValue(String(content || ''), offset);
          continue;
        }

        if (prop.type !== 7 /* DIRECTIVE */) continue;
        if (prop.name !== 'bind') continue;
        if (!prop.arg || prop.arg.type !== 4 || !prop.arg.isStatic) continue;
        if (!prop.exp || prop.exp.type !== 4) continue;

        const boundKey = prop.arg.content;
        if (!isStyleKey(tag, boundKey)) continue;

        pushTokensFromValue(String(prop.exp.content || ''), prop.exp.loc.start.offset);
      }
    }

    const nextIgnored = ignored || hasIgnoreMarker;

    for (const child of node.children || []) {
      walk(child, nextIgnored);
    }
  };

  for (const child of templateAst.children || []) {
    walk(child, false);
  }

  return hints;
};

const buildHoverCode = (hints) => {
  const out = [];

  hints.forEach((hint, index) => {
    const ident = makeMappedIdentifier(index, hint.length);
    const safeToken = hint.token.replace(/\*\//g, '*\\/');
    const safeResolved = hint.resolved.replace(/\*\//g, '*\\/');

    out.push(
      `/** VBox token preview:\n * ${safeToken} => ${safeResolved}\n */\n`,
    );
    out.push('const ');
    out.push([ident, 'template', hint.offset, HOVER_FEATURES]);
    out.push(' = 0;\n');
  });

  return out;
};

const createPlugin = (ctx) => {
  const userConfig = ctx?.config ?? {};
  const rootDir = resolveRootDir(ctx, userConfig);
  const vboxConfig = loadVBoxConfig(rootDir, userConfig) ?? {};
  const tokenMap = buildTokenResolutionMap(vboxConfig, rootDir);
  const isStyleKey = createStyleKeyMatcher(vboxConfig, userConfig);

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

      const hints = collectTokenHints(
        sfc.template.ast,
        resolveTokenValue,
        isStyleKey,
        { parseAllComponents: userConfig.parseAllComponents === true },
      );
      if (hints.length === 0) return;

      embeddedFile.content.push('\n/* VBox token hovers */\n');
      embeddedFile.content.push(...buildHoverCode(hints));
    },
  };
};

createPlugin._test = {
  loadCoreExports,
  buildTokenResolutionMap,
  collectTokenHints,
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
