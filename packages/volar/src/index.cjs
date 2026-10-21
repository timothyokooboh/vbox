const {
  collectNameAdvisories,
  buildNameAdvisories,
} = require('./nameAdvisories.cjs');
const { collectTokenHints, buildHoverCode } = require('./tokenPreviews.cjs');
// vue-tsc supplies a tree-shaken facade; parsing needs the full public TS API.
const typescript = require('typescript');
const { collectCompletionHints } = require('./completionHints.cjs');
const { buildCompletionCode } = require('./completionCode.cjs');
const { createProjectVocabulary } = require('./projectVocabulary.cjs');
const { scopeCompletionCode } = require('./completionScope.cjs');
const { prioritizeEditorMappings } = require('./editorMappings.cjs');

const createPlugin = (ctx) => {
  const project = createProjectVocabulary(ctx);
  project.refresh();

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
      const vocabulary = project.refresh();

      const nameHints = collectNameAdvisories(
        sfc.template.ast,
        vocabulary.isStyleKey,
      );
      const hints = collectTokenHints(
        sfc.template.ast,
        vocabulary.resolveTokenValue,
      );
      const completionHints = collectCompletionHints(
        sfc.template.ast,
        vocabulary.isStyleKey,
        vocabulary.getTokenCandidates,
        typescript,
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
              vocabulary.configFile,
              vocabulary.config,
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
              vocabulary.attrCompletionKeys,
              {
                tokenTypes: vocabulary.tokenTypes(),
                resolveProperty: vocabulary.resolveProperty,
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

module.exports = createPlugin;
module.exports.default = createPlugin;
