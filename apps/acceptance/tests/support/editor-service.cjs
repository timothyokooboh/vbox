const path = require('node:path');
const ts = require('typescript');
const {
  createLanguage,
  createVueLanguagePlugin,
  createParsedCommandLine,
} = require('@vue/language-core');
const {
  decorateLanguageServiceHost,
  createProxyLanguageService,
} = require('@volar/typescript');

// Exercise the same TypeScript service adapter used by Vue's editor plugin.
function createEditor(source, root = path.resolve(__dirname, '../..')) {
  const file = path.join(root, 'src/EditorConsumer.vue');
  const config = createParsedCommandLine(
    ts,
    ts.sys,
    path.join(root, 'tsconfig.json'),
  );
  config.options.allowNonTsExtensions = true;
  // Vue's options-only parser intentionally omits directory enumeration.
  const project = ts.parseJsonConfigFileContent(
    ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile).config,
    ts.sys,
    root,
  );
  let version = 0;
  const snapshots = new Map();
  const snapshot = (id) => {
    const text = id === file ? source : ts.sys.readFile(id);
    if (text === undefined) return undefined;
    const previous = snapshots.get(id);
    if (previous?.text === text) return previous.snapshot;
    const snapshot = ts.ScriptSnapshot.fromString(text);
    snapshots.set(id, { text, snapshot });
    return snapshot;
  };
  const host = {
    ...ts.sys,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    fileExists: (id) => id === file || ts.sys.fileExists(id),
    getCompilationSettings: () => config.options,
    getScriptFileNames: () => [
      file,
      ...project.fileNames.filter((name) => name.endsWith('.d.ts')),
    ],
    getScriptVersion: () => String(version),
    getScriptSnapshot: snapshot,
    getScriptKind: (id) =>
      id.endsWith('.vue') ? ts.ScriptKind.Deferred : ts.ScriptKind.TS,
    getCurrentDirectory: () => root,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  };
  const language = createLanguage(
    [
      createVueLanguagePlugin(
        ts,
        config.options,
        config.vueOptions,
        (id) => id,
      ),
      {
        getLanguageId: (id) =>
          /\.[cm]?tsx?$/.test(id) ? 'typescript' : 'javascript',
      },
    ],
    new Map(),
    (id) => {
      const value = snapshot(id);
      if (value) language.scripts.set(id, value);
      else language.scripts.delete(id);
    },
  );
  decorateLanguageServiceHost(ts, language, host);
  const service = ts.createLanguageService(host);
  const { proxy, initialize } = createProxyLanguageService(service);
  initialize(language);
  return {
    completionInfoAt: (offset) =>
      proxy.getCompletionsAtPosition(file, offset, {}),
    completeAt: (offset) =>
      proxy
        .getCompletionsAtPosition(file, offset, {})
        ?.entries.map((entry) => entry.name.replace(/^["']|["']$/g, '')) ?? [],
    hoverAt: (offset) => proxy.getQuickInfoAtPosition(file, offset),
    hover: (token) =>
      proxy.getQuickInfoAtPosition(file, source.indexOf(token) + 1),
    suggestions: () =>
      proxy
        .getSuggestionDiagnostics(file)
        .map(({ code, messageText }) => ({
          code,
          messageText: ts.flattenDiagnosticMessageText(messageText, '\n'),
        })),
    diagnostics: () =>
      proxy
        .getSemanticDiagnostics(file)
        .map(({ code, start, length, messageText }) => ({
          code,
          start,
          length,
          messageText: ts.flattenDiagnosticMessageText(messageText, '\n'),
        })),
    update: (next) => {
      source = next;
      version++;
    },
    projectChanged: () => {
      version++;
    },
    dispose: () => service.dispose(),
  };
}

const previewText = (info) =>
  ts.displayPartsToString(info?.displayParts) +
  '\n' +
  ts.displayPartsToString(info?.documentation);

module.exports = { createEditor, previewText };
