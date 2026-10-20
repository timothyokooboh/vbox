const { getStyleBindingKey } = require('@veebox/core');
const { templateElements } = require('./templateElements.cjs');

// Vue removes v-pre from props. Inspect only gaps between AST attributes,
// never quoted values or descendant text, then skip the whole literal subtree.
function isLiteralElement(node) {
  const origin = node.loc.start.offset;
  let start = 1 + node.tag.length;
  for (const prop of [
    ...node.props,
    { loc: { start: node.loc.end, end: node.loc.end } },
  ]) {
    if (
      /^\s+v-pre(?=[\s=/>])/.test(
        node.loc.source.slice(start, prop.loc.start.offset - origin),
      )
    )
      return true;
    start = prop.loc.end.offset - origin;
  }
  return false;
}

function collectNameAdvisories(ast, isKnown) {
  const hints = [];
  for (const node of templateElements(ast, isLiteralElement)) {
    for (const prop of node.props) {
      const binding =
        prop.type === 7 &&
        prop.name === 'bind' &&
        prop.arg?.type === 4 &&
        prop.arg.isStatic;
      const name =
        prop.type === 6 ? prop.name : binding ? prop.arg.content : null;
      if (!name) continue;
      const key = getStyleBindingKey(name);
      let message;
      if (['vbox', 'vbox-ignore', 'vboxignore'].includes(name))
        message = `${name} is a retired marker with no styling effect. Remove it and use vb-* or :vb.`;
      else if (
        key !== null &&
        /^[\w\-\u0080-\uFFFF]+$/.test(key) &&
        !isKnown(key)
      )
        message = `Unrecognized style property "${key}". It remains styling; check the spelling or configure its alias. Future CSS properties are allowed.`;
      if (message)
        hints.push({
          name,
          message,
          offset: binding ? prop.arg.loc.start.offset : prop.loc.start.offset,
          length: name.length,
        });
    }
  }
  return hints;
}

function buildNameAdvisories(hints) {
  const out = [];
  for (const hint of hints) {
    out.push(
      `\n({} as {\n/** ${hint.message} */\n${JSON.stringify(hint.name)}: unknown })[`,
    );
    const boundary = Symbol('template');
    out.push([
      '',
      'template',
      hint.offset,
      {
        semantic: true,
        verification: false,
        completion: false,
        navigation: false,
        __combineToken: boundary,
      },
    ]);
    out.push('"');
    out.push([
      hint.name,
      'template',
      hint.offset,
      { __combineToken: boundary },
    ]);
    out.push('"');
    out.push([
      '',
      'template',
      hint.offset + hint.length,
      { __combineToken: boundary },
    ]);
    out.push('];\n');
  }
  return out;
}
module.exports = { collectNameAdvisories, buildNameAdvisories };
