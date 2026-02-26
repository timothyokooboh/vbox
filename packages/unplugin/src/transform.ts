import * as knownCssPropertiesModule from 'known-css-properties';
import { kebabToCamelCase, toKebabCase } from '@veebox/core';
import { ExplicitStyleKeys, ObjectStyleKeys } from './constants.js';
import { isSemanticAttributeForTag } from './semantic.js';
import type {
  VBoxNativePluginOptions,
  VBoxSfcTransformResult,
} from './types.js';

const resolveKnownCssProperties = () => {
  const moduleAsRecord = knownCssPropertiesModule as Record<string, unknown>;
  const candidates = [
    knownCssPropertiesModule as unknown,
    moduleAsRecord.default,
    (moduleAsRecord.default as { all?: unknown } | undefined)?.all,
    moduleAsRecord.all,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
};

const KnownCssPropertySet = new Set(
  resolveKnownCssProperties()
    .map((item) => String(item).toLowerCase())
    .filter(Boolean),
);

const isWhitespace = (ch) => /\s/.test(ch);

const isObjectLiteralString = (value) => {
  const trimmed = value.trim();
  return trimmed.startsWith('{') && trimmed.endsWith('}');
};

const getBindingKey = (name) => {
  if (name.startsWith(':')) return name.slice(1);
  if (name.startsWith('v-bind:')) return name.slice('v-bind:'.length);
  return null;
};

const isVBoxMarker = (attr) => attr.name === 'vbox';
const isVBoxIgnoreMarker = (attr) => attr.name === 'vbox-ignore';
const isVBoxComponentTag = (tagName) => tagName === 'v-box' || tagName === 'VBox';
const isFrameworkLinkTag = (tagName) => {
  const normalized = toKebabCase(String(tagName));
  return normalized === 'router-link' || normalized === 'nuxt-link';
};
const NonTransformNativeTags = new Set([
  'script',
  'style',
  'meta',
  'link',
  'base',
  'title',
]);

const isNativeHtmlTag = (tagName) => /^[a-z][a-z0-9]*$/.test(tagName);
const canTransformNativeTag = (tagName) =>
  !NonTransformNativeTags.has(String(tagName).toLowerCase());

const normalizeCssPropertyKey = (name) => toKebabCase(name);

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

const isLikelyCssProperty = (name) => {
  if (name.startsWith('--')) return true;
  if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(name)) return false;
  if (name.startsWith('aria-') || name.startsWith('data-')) return false;
  if (name.includes(':')) return false;

  const normalized = normalizeCssPropertyKey(name);
  return KnownCssPropertySet.has(normalized);
};

const createStyleKeyMatcher = (options: VBoxNativePluginOptions = {}) => {
  const userAliases = new Set(
    Array.isArray(options.aliases) ? options.aliases : [],
  );
  const forceStyleAttrs = new Set(
    Array.isArray(options.forceStyleAttrs) ? options.forceStyleAttrs : [],
  );
  const forceSemanticAttrs = new Set(
    Array.isArray(options.forceSemanticAttrs) ? options.forceSemanticAttrs : [],
  );

  return (tagName, name) => {
    if (setHasAnyVariant(forceSemanticAttrs, name)) return false;
    if (setHasAnyVariant(forceStyleAttrs, name)) return true;
    if (isSemanticAttributeForTag(tagName, name)) return false;
    if (setHasAnyVariant(ExplicitStyleKeys, name)) return true;
    if (setHasAnyVariant(userAliases, name)) return true;
    return isLikelyCssProperty(name);
  };
};

const parseOpeningTag = (source, index) => {
  if (source[index] !== '<') return null;
  if (source.startsWith('</', index)) return null;
  if (source.startsWith('<!--', index)) return null;
  if (source.startsWith('<!', index) || source.startsWith('<?', index)) {
    return null;
  }

  let cursor = index + 1;
  while (cursor < source.length && /[A-Za-z0-9:_-]/.test(source[cursor])) {
    cursor += 1;
  }

  const tagName = source.slice(index + 1, cursor);
  if (!tagName) return null;

  const attrs = [];
  let selfClosing = false;

  while (cursor < source.length) {
    while (cursor < source.length && isWhitespace(source[cursor])) cursor += 1;

    if (source[cursor] === '>') {
      cursor += 1;
      break;
    }

    if (source[cursor] === '/' && source[cursor + 1] === '>') {
      selfClosing = true;
      cursor += 2;
      break;
    }

    const attrStart = cursor;
    while (
      cursor < source.length &&
      !isWhitespace(source[cursor]) &&
      source[cursor] !== '=' &&
      source[cursor] !== '>' &&
      !(source[cursor] === '/' && source[cursor + 1] === '>')
    ) {
      cursor += 1;
    }

    const attrName = source.slice(attrStart, cursor);
    if (!attrName) {
      cursor += 1;
      continue;
    }

    while (cursor < source.length && isWhitespace(source[cursor])) cursor += 1;

    let value = null;
    if (source[cursor] === '=') {
      cursor += 1;
      while (cursor < source.length && isWhitespace(source[cursor])) {
        cursor += 1;
      }

      const quote = source[cursor];
      if (quote === '"' || quote === "'") {
        cursor += 1;
        const valueStart = cursor;
        while (cursor < source.length && source[cursor] !== quote) cursor += 1;
        value = source.slice(valueStart, cursor);
        if (source[cursor] === quote) cursor += 1;
      } else {
        const valueStart = cursor;
        while (
          cursor < source.length &&
          !isWhitespace(source[cursor]) &&
          source[cursor] !== '>'
        ) {
          cursor += 1;
        }
        value = source.slice(valueStart, cursor);
      }
    }

    const attrEnd = cursor;
    attrs.push({
      name: attrName,
      value,
      raw: source.slice(attrStart, attrEnd),
      start: attrStart,
      end: attrEnd,
    });
  }

  return {
    type: 'open',
    name: tagName,
    attrs,
    start: index,
    end: cursor,
    selfClosing,
    raw: source.slice(index, cursor),
  };
};

const parseClosingTag = (source, index) => {
  if (!source.startsWith('</', index)) return null;

  let cursor = index + 2;
  while (cursor < source.length && /[A-Za-z0-9:_-]/.test(source[cursor])) {
    cursor += 1;
  }

  const tagName = source.slice(index + 2, cursor);
  if (!tagName) return null;

  while (cursor < source.length && source[cursor] !== '>') cursor += 1;
  if (source[cursor] === '>') cursor += 1;

  return {
    type: 'close',
    name: tagName,
    start: index,
    end: cursor,
    raw: source.slice(index, cursor),
  };
};

const quoteJsString = (value) => {
  const source = String(value ?? '');
  return `'${source
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')}'`;
};

const buildRuntimeStyleObject = (tagName, attrs, id, code, isStyleKey) => {
  const keptAttrs = [];
  const fragments = [];

  for (const attr of attrs) {
    if (isVBoxMarker(attr) || isVBoxIgnoreMarker(attr)) continue;

    if (attr.name === 'v-bind') {
      keptAttrs.push(attr);
      const expr = (attr.value ?? '').trim();
      if (expr) {
        fragments.push(`...(${expr})`);
      }
      continue;
    }

    const bindingKey = getBindingKey(attr.name);
    const isBound = bindingKey != null;

    if (!isBound && (attr.name.startsWith('v-') || attr.name.startsWith('@'))) {
      keptAttrs.push(attr);
      continue;
    }

    const key = bindingKey ?? attr.name;

    if (!isStyleKey(tagName, key)) {
      keptAttrs.push(attr);
      continue;
    }

    if (setHasAnyVariant(ObjectStyleKeys, key)) {
      if (!isBound) {
        const line = code.slice(0, attr.start).split('\n').length;
        throw new Error(
          `[vbox-transform] ${id}:${line} \`${key}\` must use a bound expression, e.g. :${key}="{...}".`,
        );
      }

      const expr = attr.value ?? '';
      if (expr.trim() === '' || /^['\"]/.test(expr.trim())) {
        const line = code.slice(0, attr.start).split('\n').length;
        throw new Error(
          `[vbox-transform] ${id}:${line} \`${key}\` must be a non-string bound object expression.`,
        );
      }

      fragments.push(`${quoteJsString(key)}: (${expr})`);
      continue;
    }

    if (!isBound) {
      if (attr.value && isObjectLiteralString(attr.value)) {
        const line = code.slice(0, attr.start).split('\n').length;
        throw new Error(
          `[vbox-transform] ${id}:${line} String object literals are not supported. Use bound syntax like :${key}="{...}".`,
        );
      }

      fragments.push(`${quoteJsString(key)}: ${quoteJsString(attr.value)}`);
      continue;
    }

    const expr = attr.value ?? '';
    fragments.push(`${quoteJsString(key)}: (${expr})`);
  }

  if (fragments.length === 0) return { keptAttrs, styleExpression: null };

  return {
    keptAttrs,
    styleExpression: `{ ${fragments.join(', ')} }`,
  };
};

const stringifyStartTag = (tagName, attrs, styleExpression, selfClosing) => {
  const renderedAttrs = attrs.map((attr) => attr.raw);

  if (styleExpression) {
    renderedAttrs.push(`v-vbox-runtime="${styleExpression}"`);
  }

  const attrsPart =
    renderedAttrs.length > 0 ? ` ${renderedAttrs.join(' ')}` : '';
  return `<${tagName}${attrsPart}${selfClosing ? ' /' : ''}>`;
};

const transformTemplateContent = (
  templateSource,
  id,
  fullCode,
  isStyleKey,
  options,
) => {
  let cursor = 0;
  let transformed = '';
  let ignoreDepth = 0;

  const stack = [];

  while (cursor < templateSource.length) {
    const ltIndex = templateSource.indexOf('<', cursor);
    if (ltIndex === -1) {
      transformed += templateSource.slice(cursor);
      break;
    }

    transformed += templateSource.slice(cursor, ltIndex);

    if (templateSource.startsWith('<!--', ltIndex)) {
      const end = templateSource.indexOf('-->', ltIndex + 4);
      const commentEnd = end === -1 ? templateSource.length : end + 3;
      transformed += templateSource.slice(ltIndex, commentEnd);
      cursor = commentEnd;
      continue;
    }

    const closing = parseClosingTag(templateSource, ltIndex);
    if (closing) {
      transformed += closing.raw;
      cursor = closing.end;

      const top = stack[stack.length - 1];
      if (top && top.name === closing.name) {
        stack.pop();
        if (top.opensIgnore) ignoreDepth -= 1;
      }
      continue;
    }

    const opening = parseOpeningTag(templateSource, ltIndex);
    if (!opening) {
      transformed += '<';
      cursor = ltIndex + 1;
      continue;
    }

    const hasExplicitMarker = opening.attrs.some(isVBoxMarker);
    const hasIgnoreMarker = opening.attrs.some(isVBoxIgnoreMarker);

    const isNativeTag = isNativeHtmlTag(opening.name);
    const isCustomComponent =
      !isNativeTag && !isVBoxComponentTag(opening.name);
    const shouldAutoTransformNativeTag =
      ignoreDepth === 0 &&
      isNativeTag &&
      canTransformNativeTag(opening.name);
    const shouldAutoTransformFrameworkLink =
      ignoreDepth === 0 &&
      isCustomComponent &&
      isFrameworkLinkTag(opening.name);

    // Custom components stay opt-in by default, except framework link components.
    const shouldTransformMarkedCustomComponent =
      hasExplicitMarker &&
      !hasIgnoreMarker &&
      ignoreDepth === 0 &&
      isCustomComponent;

    const shouldTransformAllCustomComponents =
      !hasIgnoreMarker &&
      ignoreDepth === 0 &&
      options?.parseAllComponents === true &&
      isCustomComponent;

    const shouldTransform =
      shouldTransformMarkedCustomComponent ||
      shouldTransformAllCustomComponents ||
      (!hasIgnoreMarker &&
        (shouldAutoTransformNativeTag || shouldAutoTransformFrameworkLink));

    let rewritten;
    if (shouldTransform) {
      const { keptAttrs, styleExpression } = buildRuntimeStyleObject(
        opening.name,
        opening.attrs,
        id,
        fullCode,
        isStyleKey,
      );
      rewritten = stringifyStartTag(
        opening.name,
        keptAttrs,
        styleExpression,
        opening.selfClosing,
      );
    } else {
      const attrsWithoutScopeMarkers = opening.attrs.filter(
        (attr) => !isVBoxMarker(attr) && !isVBoxIgnoreMarker(attr),
      );
      rewritten = stringifyStartTag(
        opening.name,
        attrsWithoutScopeMarkers,
        null,
        opening.selfClosing,
      );
    }

    transformed += rewritten;
    cursor = opening.end;

    if (!opening.selfClosing) {
      const opensIgnore = hasIgnoreMarker || ignoreDepth > 0;
      stack.push({ name: opening.name, opensIgnore });
      if (opensIgnore) ignoreDepth += 1;
    }
  }

  return transformed;
};

const TemplateRegex = /<template\b[^>]*>([\s\S]*?)<\/template>/i;

export const transformVueSfc = (
  code: string,
  id: string,
  options: VBoxNativePluginOptions = {},
): VBoxSfcTransformResult => {
  // only run on .vue files
  if (!id.endsWith('.vue')) return null;

  // extract template and its content
  const match = code.match(TemplateRegex);
  if (!match || match.index == null) return null;

  const isStyleKey = createStyleKeyMatcher(options);
  const originalTemplate = match[1];
  const transformedTemplate = transformTemplateContent(
    originalTemplate,
    id,
    code,
    isStyleKey,
    options,
  );

  if (transformedTemplate === originalTemplate) return null;

  const updated =
    code.slice(0, match.index) +
    match[0].replace(originalTemplate, transformedTemplate) +
    code.slice(match.index + match[0].length);

  return {
    code: updated,
    map: null,
  };
};
