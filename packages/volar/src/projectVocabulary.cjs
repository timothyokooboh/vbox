const path = require('node:path');
const core = require('@veebox/core');
const { createJiti } = require('jiti');
const { buildTokenTypes } = require('./completionTypes.cjs');
const {
  buildTokenResolutionMap,
  createStyleKeyMatcher,
  buildTokenPrefixByProperty,
  getTokenCandidatesForKey,
  buildAttrCompletionKeys,
} = require('./styleVocabulary.cjs');
const configLoader = createJiti(__filename, { interopDefault: true })(
  '@veebox/core/config',
);
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

// Each project owns its vocabulary and candidate cache; config paths remain live.
function createProjectVocabulary(ctx) {
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
  const loaderOptions = { rootDir, configPath: userConfig.configPath };
  let fingerprint;
  let state;
  const candidates = new Map();
  return {
    refresh() {
      const config = configLoader.loadVBoxConfig(loaderOptions).config;
      const next = JSON.stringify(config);
      if (next !== fingerprint) {
        candidates.clear();
        state = {
          tokenMap: buildTokenResolutionMap(config),
          aliases: core.resolveVBoxConfig(config).aliases,
          isStyleKey: createStyleKeyMatcher(config, userConfig),
          prefixes: buildTokenPrefixByProperty(config, userConfig),
          attrCompletionKeys: buildAttrCompletionKeys(
            { aliases: { strategy: 'replace' } },
            core.ObjectStyleKeys,
            { aliases: [] },
          ),
        };
        fingerprint = next;
      }
      const configFile = configLoader.findVBoxConfig(loaderOptions);
      return {
        config,
        configFile,
        isStyleKey: state.isStyleKey,
        attrCompletionKeys: state.attrCompletionKeys,
        resolveTokenValue: (token) => state.tokenMap.get(token) ?? null,
        getTokenCandidates: (key, prefix = '') =>
          getTokenCandidatesForKey(
            key,
            state.tokenMap,
            state.prefixes,
            candidates,
            prefix,
          ).flatMap((token) => {
            const dash = token.indexOf('-');
            const category = core.TokenCategories[token.slice(0, dash)];
            return category
              ? [
                  token,
                  `var(--${core.toKebabCase(category)}-${token.slice(dash + 1)})`,
                ]
              : [token];
          }),
        resolveProperty: (key) => {
          const property = core.kebabToCamelCase(
            core.getStyleBindingKey(key ?? '') ?? key ?? '',
          );
          return state.aliases[property] ?? property;
        },
        tokenTypes: () =>
          buildTokenTypes(
            configFile,
            buildTokenResolutionMap({}),
            buildTokenPrefixByProperty(
              { aliases: { strategy: 'replace', values: {} } },
              { aliases: [] },
            ),
            userConfig.aliases,
            config,
          ),
      };
    },
  };
}
module.exports = { createProjectVocabulary };
