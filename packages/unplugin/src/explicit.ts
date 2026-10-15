import {
  parse,
  babelParse,
  rewriteDefault,
  type SFCTemplateBlock,
} from '@vue/compiler-sfc';
import MagicString from 'magic-string';
import {
  getStyleBindingKey,
  kebabToCamelCase,
  ObjectStyleKeys,
  toKebabCase,
} from '@veebox/core';
import type { VBoxSfcTransformPayload } from './types.js';

type TemplateChildNode = NonNullable<
  SFCTemplateBlock['ast']
>['children'][number];

const objectKeys = new Set(
  ObjectStyleKeys.flatMap((key) => [
    toKebabCase(key),
    toKebabCase(key).replace(/^_/, ''),
  ]),
);

// Vue intentionally omits v-pre from the AST. Only inspect gaps between AST
// attribute locations: quoted values and nested content cannot be mistaken for it.
const isLiteralRegion = (
  node: Extract<TemplateChildNode, { type: 1 }>,
  source: string,
) => {
  let start = node.loc.start.offset + 1 + node.tag.length;
  for (const prop of [
    ...node.props,
    { loc: { start: node.loc.end, end: node.loc.end } },
  ]) {
    if (/^\s+v-pre(?=[\s=/>])/.test(source.slice(start, prop.loc.start.offset)))
      return true;
    start = prop.loc.end.offset;
  }
  return false;
};

const prefixedLiteral = (source: string, spread: boolean) => {
  try {
    const statement = babelParse(`(${source})`, {
      sourceType: 'module',
      plugins: ['typescript'],
    }).program.body[0];
    if (statement?.type !== 'ExpressionStatement') return false;
    const expression = statement.expression;
    if (!spread)
      return (
        expression.type === 'StringLiteral' &&
        getStyleBindingKey(expression.value) !== null
      );
    return (
      expression.type === 'ObjectExpression' &&
      expression.properties.some((property) => {
        if (property.type !== 'ObjectProperty' || property.computed)
          return false;
        const key =
          property.key.type === 'Identifier'
            ? property.key.name
            : property.key.type === 'StringLiteral'
              ? property.key.value
              : '';
        return getStyleBindingKey(key) !== null;
      })
    );
  } catch {
    return false;
  } // Vue owns expression syntax diagnostics.
};

const escapeAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');

/** The AST owns all boundaries; edits touch only explicit template bindings. */
export const transformExplicitStyles = (
  code: string,
  id: string,
): VBoxSfcTransformPayload | null => {
  const { descriptor } = parse(code, { filename: id });
  if (!descriptor.template?.ast) return null;
  const output = new MagicString(code);
  let changed = false;
  let literalRegion = false;
  let bindingName = '__vboxStyles';
  for (
    let suffix = 2;
    code.includes(bindingName) || code.includes(`${bindingName}Factory`);
    suffix++
  )
    bindingName = `__vboxStyles${suffix}`;
  const warnings: NonNullable<VBoxSfcTransformPayload['warnings']> = [];

  const visit = (node: TemplateChildNode) => {
    if (node.type !== 1) return;
    if (isLiteralRegion(node, code)) {
      literalRegion = true;
      return;
    }
    const declarations: string[] = [];
    let grouped: string | undefined;
    const seen = new Set<string>();
    for (const prop of node.props) {
      if (prop.type === 7 && prop.name === 'bind') {
        const spread = !prop.arg;
        const expression = spread
          ? prop.exp
          : prop.arg?.type === 4 && !prop.arg.isStatic
            ? prop.arg
            : null;
        if (
          expression?.type === 4 &&
          prefixedLiteral(expression.content, spread)
        ) {
          warnings.push({
            message: `[VBox] ${id}:${prop.loc.start.line} Ordinary v-bind and dynamic names stay semantic. Use :vb="styles" for grouped/dynamic styling.`,
            loc: prop.loc.start,
          });
        }
      }
      const name =
        prop.type === 6
          ? prop.name
          : prop.name === 'bind' && prop.arg?.type === 4 && prop.arg.isStatic
            ? prop.arg.content
            : null;
      const key =
        name === 'vb' ? 'vb' : name === null ? null : getStyleBindingKey(name);
      if (key === null) continue;
      if (
        [
          'template',
          'slot',
          'script',
          'style',
          'meta',
          'link',
          'base',
          'title',
        ].includes(node.tag)
      ) {
        throw new SyntaxError(
          `[VBox] ${name} needs a rendered element; put the binding on the intended HTML/SVG element or component, not <${node.tag}>.`,
        );
      }
      if (
        !/^(?:--[-\w\u0080-\uFFFF]+|-?[A-Za-z_0-9\u0080-\uFFFF][-\w\u0080-\uFFFF]*)$/.test(
          key,
        )
      ) {
        throw new SyntaxError(
          `[VBox] ${id}:${prop.loc.start.line}:${prop.loc.start.column} Invalid style property name ${JSON.stringify(name)}.`,
        );
      }
      const identity = name === 'vb' ? ':vb' : key;
      if (seen.has(identity))
        throw new SyntaxError(
          `[VBox] Duplicate style binding for ${key}; keep one spelling.`,
        );
      seen.add(identity);
      if (prop.type === 7 && prop.modifiers.length) {
        throw new SyntaxError(
          `[VBox] ${id}:${prop.loc.start.line}:${prop.loc.start.column} Style binding modifiers are not supported; remove the modifier from ${name}.`,
        );
      }
      if (prop.type === 6 && (name === 'vb' || objectKeys.has(key))) {
        throw new SyntaxError(
          `[VBox] ${id}:${prop.loc.start.line}:${prop.loc.start.column} ${name} requires an object binding; use :${name}="{ ... }".`,
        );
      }
      const value =
        prop.type === 6
          ? JSON.stringify(prop.value?.content ?? '')
          : prop.exp?.type === 4
            ? `(${prop.exp.content})`
            : `(${kebabToCamelCase(name!)})`;
      if (name === 'vb') grouped = value;
      else declarations.push(`${JSON.stringify(key)}: ${value}`);
      output.remove(prop.loc.start.offset, prop.loc.end.offset);
    }
    if (declarations.length || grouped !== undefined) {
      const spread = node.props.find(
        (prop) => prop.type === 7 && prop.name === 'bind' && !prop.arg,
      );
      const semanticExpression =
        spread?.type === 7 && spread.exp?.type === 4
          ? `, (${spread.exp.content})`
          : ', undefined';
      const binding = `v-bind="${escapeAttribute(`${bindingName}({ ${declarations.join(', ')} }${semanticExpression}, ${grouped ?? 'undefined'})`)}"`;
      if (spread)
        output.overwrite(
          spread.loc.start.offset,
          spread.loc.end.offset,
          binding,
        );
      else
        output.appendLeft(
          node.loc.start.offset + 1 + node.tag.length,
          ` ${binding}`,
        );
      changed = true;
    }
    for (const child of node.children) visit(child);
  };
  for (const node of descriptor.template.ast.children) visit(node);
  if (changed) {
    const statement = `import { useVBoxStyleBinding as ${bindingName}Factory } from '@veebox/vue';\nconst ${bindingName} = ${bindingName}Factory();\n`;
    if (descriptor.scriptSetup) {
      output.appendLeft(descriptor.scriptSetup.loc.start.offset, statement);
    } else {
      if (descriptor.script?.src)
        throw new SyntaxError(
          '[VBox] Explicit native styling currently requires an inline script; external script integration is not supported yet.',
        );
      const language = descriptor.script?.lang;
      if (descriptor.script) {
        const componentName = `${bindingName}Component`;
        const original = rewriteDefault(
          descriptor.script.content,
          componentName,
          language === 'ts' ? ['typescript'] : [],
        );
        output.overwrite(
          descriptor.script.loc.start.offset,
          descriptor.script.loc.end.offset,
          `import { withVBoxStyleBinding as ${bindingName}Factory } from '@veebox/vue';\n${original}\nexport default ${bindingName}Factory(${componentName}, '${bindingName}');\n`,
        );
      } else {
        output.append(`\n<script setup>\n${statement}</script>\n`);
      }
    }
  }
  return changed || warnings.length || literalRegion
    ? {
        warnings,
        code: output.toString(),
        map: output.generateMap({
          source: id,
          includeContent: true,
          hires: true,
        }),
      }
    : null;
};
