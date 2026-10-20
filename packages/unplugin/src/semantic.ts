import { toKebabCase } from '@veebox/core';

const GlobalSemanticAttributes = new Set([
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

const SemanticAttributesByTag: Record<string, readonly string[]> = {
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
  // Common SVG tags.
  svg: ['viewBox', 'preserveAspectRatio', 'xmlns'],
  path: ['d', 'pathLength'],
  use: ['href', 'xlink:href'],
  image: ['href', 'x', 'y', 'preserveAspectRatio', 'xlink:href'],
  rect: ['x', 'y', 'rx', 'ry'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  line: ['x1', 'x2', 'y1', 'y2'],
  polyline: ['points'],
  polygon: ['points'],
  text: ['x', 'y', 'dx', 'dy', 'textLength', 'lengthAdjust'],
  linearGradient: [
    'x1',
    'x2',
    'y1',
    'y2',
    'gradientUnits',
    'gradientTransform',
    'href',
    'xlink:href',
  ],
  radialGradient: [
    'cx',
    'cy',
    'r',
    'fx',
    'fy',
    'fr',
    'gradientUnits',
    'gradientTransform',
    'href',
    'xlink:href',
  ],
  stop: ['offset', 'stop-color', 'stop-opacity'],
};

const normalizeName = (name: string) => name.trim();

const buildVariantSet = (name: string) => {
  const lower = name.toLowerCase();
  const kebab = toKebabCase(name);
  const camel = name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return new Set([name, lower, kebab, camel]);
};

const toVariantSet = (values: readonly string[]) => {
  const set = new Set<string>();
  for (const value of values) {
    for (const variant of buildVariantSet(value)) {
      set.add(variant);
    }
  }
  return set;
};

const GlobalSemanticSet = toVariantSet(Array.from(GlobalSemanticAttributes));
const TagSemanticSetMap = new Map<string, Set<string>>();

for (const [tag, attrs] of Object.entries(SemanticAttributesByTag)) {
  TagSemanticSetMap.set(tag.toLowerCase(), toVariantSet(attrs));
}

const hasSemanticVariant = (set: Set<string> | undefined, attrName: string) => {
  if (!set) return false;
  for (const variant of buildVariantSet(attrName)) {
    if (set.has(variant)) return true;
  }
  return false;
};

export const isSemanticAttributeForTag = (
  tagName: string,
  attrName: string,
) => {
  const normalizedTag = normalizeName(tagName).toLowerCase();
  const normalizedAttr = normalizeName(attrName);

  if (!normalizedTag || !normalizedAttr) return false;
  if (
    normalizedAttr.startsWith('aria-') ||
    normalizedAttr.startsWith('data-')
  ) {
    return true;
  }

  if (hasSemanticVariant(GlobalSemanticSet, normalizedAttr)) return true;
  return hasSemanticVariant(
    TagSemanticSetMap.get(normalizedTag),
    normalizedAttr,
  );
};
