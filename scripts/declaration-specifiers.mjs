import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

// Bundler resolution accepts extensionless declarations; NodeNext does not.
// Rewrite only module specifiers, never string literal values or documentation.
const root = process.argv[2];
if (!root) throw new Error('Provide the generated declaration directory.');
async function visitDirectory(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visitDirectory(file);
      continue;
    }
    if (!entry.isFile() || !file.endsWith('.d.ts')) continue;
    let content = await fs.readFile(file, 'utf8');
    const source = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true,
    );
    const edits = [];
    function visit(node) {
      const specifier =
        ts.isImportDeclaration(node) || ts.isExportDeclaration(node)
          ? node.moduleSpecifier
          : ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)
            ? node.argument.literal
            : undefined;
      if (
        specifier &&
        ts.isStringLiteral(specifier) &&
        specifier.text.startsWith('.') &&
        !/\.(?:[cm]?js|json)$/.test(specifier.text)
      ) {
        const base = path.resolve(path.dirname(file), specifier.text);
        edits.push({
          start: specifier.getStart(source) + 1,
          end: specifier.end - 1,
          value: specifier.text + '.js',
          base,
        });
      }
      ts.forEachChild(node, visit);
    }
    // Existence is checked after traversal so traversal remains synchronous.
    visit(source);
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      try {
        await fs.access(`${edit.base}.d.ts`);
      } catch {
        await fs.access(path.join(edit.base, 'index.d.ts'));
        edit.value = edit.value.slice(0, -3) + '/index.js';
      }
      content =
        content.slice(0, edit.start) + edit.value + content.slice(edit.end);
    }
    if (edits.length) await fs.writeFile(file, content);
  }
}
await visitDirectory(path.resolve(root));
