import {
  babelParse,
  rewriteDefaultAST,
  type SFCScriptBlock,
} from '@vue/compiler-sfc';
import MagicString, { Bundle } from 'magic-string';
import { parse as parseSfcStructure } from '@vue/compiler-dom';

const scriptPlugins = (language?: string) => {
  const plugins: ('typescript' | 'jsx')[] = [];
  if (language?.startsWith('ts')) plugins.push('typescript');
  if (language?.endsWith('x')) plugins.push('jsx');
  return plugins;
};

// Transitional guard: generated spreads must not re-enter the old inference path.
export const hasRuntimeImport = (script: SFCScriptBlock | null) => {
  if (!script?.content.includes('@veebox/vue')) return false;
  try {
    return babelParse(script.content, {
      sourceType: 'module',
      plugins: scriptPlugins(script.lang),
    }).program.body.some(
      (node) =>
        node.type === 'ImportDeclaration' &&
        node.source.value === '@veebox/vue' &&
        node.specifiers.some(
          (specifier) =>
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.type === 'Identifier' &&
            ['useVBoxStyleBinding', 'withVBoxStyleBinding'].includes(
              specifier.imported.name,
            ),
        ),
    );
  } catch {
    return false;
  } // Vue owns script syntax errors.
};

/** Edit the default export without flattening away authored script mappings. */
export const wrapOptionsScript = (
  output: MagicString,
  script: SFCScriptBlock,
  id: string,
  bindingName: string,
) => {
  const start = script.loc.start.offset;
  const end = script.loc.end.offset;
  const content = output.snip(start, end);
  const ast = babelParse(script.content, {
    sourceType: 'module',
    plugins: scriptPlugins(script.lang),
    startIndex: start,
    startLine: script.loc.start.line,
    startColumn: script.loc.start.column - 1,
  });
  const componentName = `${bindingName}Component`;
  rewriteDefaultAST(ast.program.body, content, componentName);
  content.prepend(
    `import { withVBoxStyleBinding as ${bindingName}Factory } from '@veebox/vue';\n`,
  );
  content.append(
    `\nexport default ${bindingName}Factory(${componentName}, '${bindingName}');\n`,
  );
  return new Bundle({ separator: '' })
    .addSource({ filename: id, content: output.snip(0, start) })
    .addSource({ filename: id, content })
    .addSource({
      filename: id,
      content: output.snip(end, output.original.length),
    });
};

/** Preserve the external module, wrapping its export in a local script binding. */
export const wrapExternalScript = (
  output: MagicString,
  script: SFCScriptBlock,
  bindingName: string,
) => {
  const ast = parseSfcStructure(output.original, { parseMode: 'sfc' });
  const element = ast.children.find(
    (node) =>
      node.type === 1 &&
      node.tag === 'script' &&
      node.loc.start.offset < script.loc.start.offset &&
      node.loc.end.offset >= script.loc.end.offset,
  );
  if (element?.type !== 1)
    throw new Error('[VBox] Cannot locate external script block.');
  const src = element.props.find(
    (prop) => prop.type === 6 && prop.name === 'src',
  );
  if (!src) throw new Error('[VBox] Cannot locate external script source.');
  output.remove(src.loc.start.offset, src.loc.end.offset);
  const moduleName = JSON.stringify(script.src);
  const content = `
import { withVBoxStyleBinding as ${bindingName}Factory } from '@veebox/vue';
import ${bindingName}Component from ${moduleName};
export * from ${moduleName};
export default ${bindingName}Factory(${bindingName}Component, '${bindingName}');
`;
  if (element.isSelfClosing) {
    output.overwrite(
      element.loc.end.offset - 2,
      element.loc.end.offset,
      `>${content}</script>`,
    );
    return;
  }
  const { start, end } = script.loc;
  if (start.offset === end.offset) output.appendLeft(start.offset, content);
  else output.overwrite(start.offset, end.offset, content);
};
