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
await fs.cp(path.join(repository, 'skills/vbox-native'), destination, {
  recursive: true,
});
await fs.cp(
  path.join(repository, 'apps/acceptance/src/skill-examples'),
  path.join(destination, 'examples'),
  { recursive: true },
);
await fs.mkdir(path.join(destination, 'references'));
const sources = {};
for (const [source, name] of references) {
  const text = await fs.readFile(source, 'utf8');
  sources[path.relative(repository, source)] = createHash('sha256')
    .update(text)
    .digest('hex');
  let fenced = false;
  let liveScript = false;
  const portable = text
    .split('\n')
    .flatMap((line) => {
      if (/^```/.test(line)) {
        fenced = !fenced;
        return [line];
      }
      if (fenced) return [line];
      if (/^<script\s/.test(line)) liveScript = true;
      if (liveScript) {
        if (/^<\/script>/.test(line)) liveScript = false;
        return [];
      }
      if (/^<<<\s|^<[A-Z][\w]*\s*\/>/.test(line)) return [];
      return [
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
      ];
    })
    .join('\n');
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
await fs.writeFile(
  path.join(destination, 'compatibility.json'),
  JSON.stringify(
    {
      contract: 'explicit-native-v1',
      releaseStatus: 'unreleased',
      supportedPublishedRange: null,
      sourceRevision,
      sourceVersions,
      canonicalSources: sources,
      workingTreeDirty: Boolean(
        execFileSync(
          'git',
          [
            'status',
            '--porcelain',
            '--untracked-files=normal',
            '--',
            'skills',
            'scripts',
            'apps/acceptance/src/skill-examples',
            'apps/docs/docs',
            'packages',
          ],
          { cwd: repository, encoding: 'utf8' },
        ).trim(),
      ),
      note: 'Source versions identify this workspace only; existing published versions do not implement this native contract. Release ranges must be set and verified before distribution.',
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Prepared ${destination}; no installation or publication performed.`,
);
