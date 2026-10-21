import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const output = process.argv[2];
if (!output)
  throw new Error(
    'Provide a new output directory: node scripts/build-native-skill.mjs /tmp/vbox-native',
  );
const destination = path.resolve(output);
const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: repository,
  encoding: 'utf8',
}).trim();
const documents = [
  'guide/essentials/native-syntax.md',
  'guide/migration.md',
  'guide/essentials/reusing-styles.md',
  'guide/essentials/style-priority.md',
  'guide/essentials/component-targets.md',
  'guide/installation.md',
  'up-next/ssr-support.md',
];
const docsRoot = path.join(repository, 'apps/docs/docs');
const references = new Map(
  documents.map((file) => [path.resolve(docsRoot, file), path.basename(file)]),
);

// A fresh destination prevents accidental overwrites of an installed/user-edited skill.
await fs.mkdir(destination);
await fs.copyFile(
  path.join(repository, 'skills/vbox-native/SKILL.md'),
  path.join(destination, 'SKILL.md'),
);
const examples = path.join(repository, 'apps/acceptance/src/skill-examples');
await fs.mkdir(path.join(destination, 'examples'));
for (const entry of await fs.readdir(examples, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.vue')) continue;
  await fs.copyFile(
    path.join(examples, entry.name),
    path.join(destination, 'examples', entry.name),
  );
}
await fs.mkdir(path.join(destination, 'references'));
const sources = {};
const includedSources = {};
for (const [source, name] of references) {
  const text = await fs.readFile(source, 'utf8');
  sources[path.relative(repository, source)] = createHash('sha256')
    .update(text)
    .digest('hex');
  let fenced = false;
  let liveScript = false;
  const lines = [];
  for (const line of text.split('\n')) {
    if (/^```/.test(line)) {
      fenced = !fenced;
      lines.push(line);
      continue;
    }
    if (fenced) {
      lines.push(line);
      continue;
    }
    if (/^<script\s/.test(line)) liveScript = true;
    if (liveScript) {
      if (/^<\/script>/.test(line)) liveScript = false;
      continue;
    }
    if (/^<<<\s/.test(line)) {
      const inclusion = line.match(/^<<<\s+@\/(.+)$/);
      if (!inclusion)
        throw new Error(`Unsupported source inclusion in ${source}: ${line}`);
      const included = await fs.realpath(path.resolve(docsRoot, inclusion[1]));
      const relative = path.relative(repository, included);
      if (
        relative === '..' ||
        relative.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relative)
      )
        throw new Error(
          `Skill source inclusion must stay inside the repository: ${line}`,
        );
      const content = await fs.readFile(included, 'utf8');
      includedSources[relative] = createHash('sha256')
        .update(content)
        .digest('hex');
      const extension = path.extname(included).slice(1);
      const language = ['mjs', 'cjs'].includes(extension) ? 'js' : extension;
      const fence = '`'.repeat(
        Math.max(
          3,
          ...[...content.matchAll(/^`+/gm)].map((match) => match[0].length + 1),
        ),
      );
      lines.push(
        `Source: \`${relative}\``,
        '',
        `${fence}${language}`,
        content.trimEnd(),
        fence,
      );
      continue;
    }
    if (/^<[A-Z][\w]*\s*\/>/.test(line)) continue;
    lines.push(
      line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, target) => {
        if (/^(?:https?:|#)/.test(target)) return match;
        const [file, fragment] = target.split('#');
        const resolved = path.resolve(path.dirname(source), file);
        const local = references.get(resolved);
        const relative = path
          .relative(repository, resolved)
          .split(path.sep)
          .join('/');
        const url =
          local ??
          `https://github.com/timothyokooboh/vbox/blob/${sourceRevision}/${relative}`;
        return `[${label}](${url}${fragment ? `#${fragment}` : ''})`;
      }),
    );
  }
  const portable = lines.join('\n');
  await fs.writeFile(
    path.join(destination, 'references', name),
    `<!-- Generated from ${path.relative(repository, source)}; edit the canonical document. -->\n\n${portable}`,
  );
}
const sourceVersions = {};
for (const name of [
  'core',
  'vue',
  'unplugin',
  'volar',
  'property-variance-authority',
]) {
  const pkg = JSON.parse(
    await fs.readFile(
      path.join(repository, 'packages', name, 'package.json'),
      'utf8',
    ),
  );
  sourceVersions[pkg.name] = pkg.version;
}
const release = JSON.parse(
  await fs.readFile(path.join(repository, 'release/native-beta.json'), 'utf8'),
);
for (const [name, version] of Object.entries(release.packages)) {
  if (sourceVersions[name] !== version)
    throw new Error(`Skill/package release mismatch: ${name}`);
}
await fs.writeFile(
  path.join(destination, 'compatibility.json'),
  JSON.stringify(
    {
      contract: 'explicit-native-v1',
      releaseStatus: 'unreleased',
      supportedPublishedRange: null,
      sourceRevision,
      sourceVersions,
      candidatePackageVersions: release.packages,
      canonicalSources: sources,
      includedSources,
      workingTreeDirty: Boolean(
        execFileSync(
          'git',
          [
            'status',
            '--porcelain',
            '--untracked-files=normal',
            '--',
            'skills',
            'release',
            'scripts',
            'apps/acceptance/src/skill-examples',
            'apps/docs/docs',
            'packages',
            'apps/vboxssr',
            'pnpm-lock.yaml',
            'package.json',
            'pnpm-workspace.yaml',
          ],
          { cwd: repository, encoding: 'utf8' },
        ).trim(),
      ),
      note: 'Source versions identify this workspace only; candidatePackageVersions are tested prerelease targets, not a claim of publication. Distribute only alongside the matching verified release.',
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Prepared ${destination}; no installation or publication performed.`,
);
