type QueryGroup = 'mq' | 'cq';

/** Check at-rule boundaries without maintaining a second, browser-specific CSS grammar. */
export const normalizeQuery = (group: QueryGroup, input: string): string => {
  const rule = group === 'mq' ? '@media' : '@container';
  const invalid = () => {
    throw new TypeError(
      `[VBox] ${group} query ${JSON.stringify(input)} must be a complete ${rule} query with a nonempty, balanced header and no declaration/block delimiters.`,
    );
  };
  const match = /^(@media|@container)\s+([\s\S]+)$/i.exec(input.trim());
  if (!match || match[1].toLowerCase() !== rule) return invalid();
  const header = match[2].trim();
  const brackets: Array<{ char: string; start: number }> = [];
  let content = 0;
  let quote = '';
  let hasCondition = false;
  for (let index = 0; index < header.length; index++) {
    const char = header[index];
    if (char === '\\') {
      if (++index === header.length) return invalid();
      content++;
      continue;
    }
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      content++;
    } else if (char === '/' && header[index + 1] === '*') {
      const end = header.indexOf('*/', index + 2);
      if (end < 0) return invalid();
      index = end + 1;
    } else if (char === '(' || char === '[') {
      brackets.push({ char, start: content });
      if (char === '(') hasCondition = true;
    } else if (char === ')' || char === ']') {
      const open = brackets.pop();
      if (open?.char !== (char === ')' ? '(' : '[') || open.start === content)
        return invalid();
    } else if (/[;{}]/.test(char)) return invalid();
    else if (!/\s/.test(char)) content++;
  }
  if (quote || brackets.length || !content || (group === 'cq' && !hasCondition))
    return invalid();
  return `${rule} ${header}`;
};
