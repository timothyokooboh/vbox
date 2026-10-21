import { parse } from '@vue/compiler-sfc';
import type { TemplateChildNode } from '@vue/compiler-dom';
import { collectStyleBindings } from './styleBindings.js';
import MagicString, { type Bundle } from 'magic-string';
import {
  hasRuntimeImport,
  wrapOptionsScript,
  wrapExternalScript,
} from './scriptBinding.js';
import { createStyleError } from './diagnostics.js';
import { createExpressionMapper } from './expressionMap.js';
import type { VBoxSfcTransformPayload } from './types.js';

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

const escapeAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;');

/** The AST owns all boundaries; edits touch only explicit template bindings. */
export const transformExplicitStyles = (
  code: string,
  id: string,
  isKnownStyleKey: (key: string) => boolean,
): VBoxSfcTransformPayload | null => {
  const { descriptor, errors } = parse(code, { filename: id });
  if (descriptor.template?.lang && descriptor.template.lang !== 'html') {
    const template = descriptor.template;
    // Preprocessors own their syntax. This advisory detects likely explicit
    // styling only; never parse or rewrite their source as HTML.
    const hasExplicitStyle = /\bvb(?:-[\w-]+|[A-Z]\w*)\s*=|:vb\s*=/.test(
      template.content,
    );
    return {
      code,
      map: null,
      warnings: hasExplicitStyle
        ? [
            {
              message: `[VBox] ${id}:${template.loc.start.line} Native styling requires an HTML template; ${template.lang} preprocessing is not supported. This block was left unchanged.`,
              loc: template.loc.start,
            },
          ]
        : [],
    };
  }
  if (!descriptor.template?.ast) return null;
  const output = new MagicString(code);
  let mappedOutput: MagicString | Bundle = output;
  let changed = false;
  let literalRegion = false;
  let bindingName = '__vboxStyles';
  for (
    let suffix = 2;
    code.includes(bindingName) || code.includes(`${bindingName}Factory`);
    suffix++
  )
    bindingName = `__vboxStyles${suffix}`;
  const mapper = createExpressionMapper(code);
  const warnings: NonNullable<VBoxSfcTransformPayload['warnings']> = [];

  const visit = (node: TemplateChildNode) => {
    if (node.type !== 1) return;
    if (isLiteralRegion(node, code)) {
      literalRegion = true;
      return;
    }
    const collected = collectStyleBindings(node, {
      id,
      isKnownStyleKey,
      expression: mapper.expression,
    });
    const { declarations, grouped } = collected;
    warnings.push(...collected.warnings);
    for (const location of collected.removals)
      output.remove(location.start.offset, location.end.offset);
    if (declarations.length || grouped !== undefined) {
      const spread = node.props.find(
        (prop) => prop.type === 7 && prop.name === 'bind' && !prop.arg,
      );
      const semanticExpression =
        spread?.type === 7 && spread.exp?.type === 4
          ? `, (${mapper.expression(spread.exp.loc)})`
          : ', undefined';
      const binding = mapper.binding(
        `v-bind="${escapeAttribute(`${bindingName}({ ${declarations.join(', ')} }${semanticExpression}, ${grouped ?? 'undefined'})`)}"`,
      );
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
    const error = errors[0];
    if (error) {
      const start = 'loc' in error ? error.loc?.start : undefined;
      throw createStyleError(
        id,
        start ?? descriptor.template.loc.start,
        error.message,
      );
    }
    const statement = `import { useVBoxStyleBinding as ${bindingName}Factory } from '@veebox/vue';\nconst ${bindingName} = ${bindingName}Factory();\n`;
    if (descriptor.scriptSetup) {
      output.appendLeft(descriptor.scriptSetup.loc.start.offset, statement);
    } else {
      if (descriptor.script?.src) {
        wrapExternalScript(output, descriptor.script, bindingName);
      } else if (descriptor.script) {
        mappedOutput = wrapOptionsScript(
          output,
          descriptor.script,
          id,
          bindingName,
        );
      } else {
        output.append(`\n<script setup>\n${statement}</script>\n`);
      }
    }
  }
  return changed ||
    warnings.length ||
    literalRegion ||
    hasRuntimeImport(descriptor.script) ||
    hasRuntimeImport(descriptor.scriptSetup)
    ? {
        warnings,
        code: mappedOutput.toString(),
        map: mapper.generateMap(mappedOutput, id),
      }
    : null;
};
