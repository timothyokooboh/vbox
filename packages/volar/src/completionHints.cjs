const core = require('@veebox/core');
const { templateElements } = require('./templateElements.cjs');
const { collectExpressionCompletions } = require('./styleExpressions.cjs');
const { extractTokenPrefix } = require('./styleVocabulary.cjs');
const isVBoxComponentTag = (tag) => tag === 'v-box' || tag === 'VBox';
const excludedTargets = new Set(core.NonStylingTargetTags);
const TOKEN_IN_VALUE_REGEX = /\b([a-z]{1,3}-[A-Za-z0-9_-]+)\b/g;

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

const collectCompletionHints = (
  templateAst,
  isStyleKey,
  getTokenCandidates,
  typescript,
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
    const shouldProcessElement = !excludedTargets.has(tag);
    const acceptsStyleName = (key) =>
      key === 'vb' ||
      core.getStyleBindingKey(key) !== null ||
      (isVBoxComponentTag(tag) && isStyleKey(key));
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
        const nested = collectExpressionCompletions(
          typescript,
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
      }
    }
  }

  return {
    attrHints,
    valueHints,
  };
};

module.exports = { collectCompletionHints };
