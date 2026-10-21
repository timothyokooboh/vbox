const core = require('@veebox/core');
const { extractTokenPrefix } = require('./styleVocabulary.cjs');
const COMPLETION_FEATURES = {
  verification: true,
  completion: true,
  semantic: true,
  navigation: true,
  structure: false,
  format: false,
};

const escapeTsString = (value) =>
  String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

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

module.exports = { buildCompletionCode };
