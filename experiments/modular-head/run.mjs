import {readFileSync, writeFileSync, mkdirSync, openSync, closeSync, rmSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync, spawn} from 'node:child_process';
import {sceneSpec} from './spec.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const directory = fileURLToPath(new URL('./', import.meta.url));
const [command = 'gallery', supplied = 'artifacts/modular-head'] = process.argv.slice(2);
if (!['gallery', 'verify', 'single'].includes(command)) throw new Error('Use gallery, verify or single');
const out = resolve(root, supplied);
mkdirSync(out, {recursive: true});
mkdirSync(resolve(out, 'blender-config'), {recursive: true});
mkdirSync(resolve(out, 'blender-extensions'), {recursive: true});
const keys = JSON.parse(readFileSync(resolve(root, 'demo/data/test-keys.json'))).cases;
const selected = command === 'single' ? [{id: 'custom', publicKey: process.argv[4] || keys[0].publicKey}]
  : command === 'gallery' ? keys.slice(0, 6) : [keys[0], keys[1], keys[0], keys[0]];
async function renderOne(i) {
  const spec = await sceneSpec(selected[i].publicKey);
  const file = resolve(out, 'portrait-' + i + '.json');
  for (const suffix of ['.png', '.result.json']) rmSync(file.replace(/\.json$/, suffix), {force: true});
  writeFileSync(file, JSON.stringify(spec, null, 2) + '\n');
  console.log('Rendering', i + 1, '/', selected.length, 'yaw', spec.values.yaw, 'pitch', spec.values.pitch);
  const log = openSync(resolve(out, 'portrait-' + i + '.log'), 'w');
  const execution = spawn('blender', ['--background', '--factory-startup', '--threads', '1', '--python-exit-code', '1',
    '--python', directory + 'render.py', '--', file], {cwd: root, stdio: ['ignore', log, log],
    env: {...process.env, BLENDER_USER_CONFIG: resolve(out, 'blender-config'),
      BLENDER_USER_EXTENSIONS: resolve(out, 'blender-extensions'),
      CYCLES_CPU_NO_AVX2: '1', CYCLES_CPU_NO_SSE42: '1'}});
  await new Promise((resolve, reject) => {
    execution.once('error', reject);
    execution.once('close', code => code === 0 ? resolve() : reject(new Error('Renderer failed; inspect portrait-' + i + '.log')));
  }).finally(() => closeSync(log));
}
// Independent single-thread renderers avoid numerical changes from scene
// construction parallelism. Wait for the
// entire batch on failure so no child processes are abandoned.
for (let start = 0; start < selected.length; start += 2) {
  const batch = await Promise.allSettled(selected.slice(start, start + 2).map((_, offset) => renderOne(start + offset)));
  const failure = batch.find(item => item.status === 'rejected');
  if (failure) throw failure.reason;
}
const checks = spawnSync('python3', [directory + 'evidence.py', out, command], {stdio: 'inherit'});
if (checks.status !== 0) process.exit(checks.status || 1);
