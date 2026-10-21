import { execFileSync } from 'node:child_process';
import { platform, arch, cpus } from 'node:os';
const results = {
  node: process.version,
  platform: `${platform()}-${arch()}`,
  cpu: cpus()[0]?.model,
  measurements: {},
};
for (const script of ['build', 'type-check', 'test:editor']) {
  const start = performance.now();
  execFileSync('pnpm', ['run', script], { stdio: 'inherit', timeout: 120_000 });
  results.measurements[script] = Math.round(performance.now() - start);
}
console.log(JSON.stringify(results, null, 2));
