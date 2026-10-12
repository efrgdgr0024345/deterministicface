/** Experimental 3D assembly; preserves the existing adapter and labelled KDF. */
import {deriveBytes, digestInput, hex, parameter, publicKeyDigest} from '../../demo/core/core.js';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export const PROFILE = 'df-modular-cpu-exp-1';
export const assetDirectory = fileURLToPath(new URL('./assets/', import.meta.url));
export function verifyAssets(directory = assetDirectory) {
  const manifest = JSON.parse(readFileSync(directory + 'manifest.json'));
  for (const asset of manifest.assets) {
    if (!/^[A-Za-z0-9_.-]+$/.test(asset.file)) throw new Error('INVALID_ASSET_PATH');
    const bytes = readFileSync(directory + asset.file);
    if (bytes.length !== asset.bytes || createHash('sha256').update(bytes).digest('hex') !== asset.sha256)
      throw new Error('ASSET_INTEGRITY_FAILURE: ' + asset.file);
  }
  return createHash('sha256').update(readFileSync(directory + 'manifest.json')).digest('hex');
}
export async function sceneSpec(publicKey) {
  const raw = digestInput(publicKey), digest = await publicKeyDigest(raw);
  const ranges = {
    yaw: [-35, 35], pitch: [-8, 8], roll: [-3, 3], gaze: [-7, 7],
    head: [0, 2], width: [-35, 35], mouth: [-40, 40], lips: [0, 45],
    nose: [-35, 35], eyes: [-25, 25], skin: [0, 4], iris: [0, 100],
    hairStyle: [0, 2], hairColor: [0, 4], hairSweep: [-100, 100],
    light: [-25, 25], scene: [0, 2], bark: [0, 100], foliage: [0, 100],
  };
  const values = Object.fromEntries(await Promise.all(Object.entries(ranges).map(async ([name, [lo, hi]]) =>
    [name, await parameter(digest, 'face.modular.' + name.toLowerCase(), lo, hi)])));
  const hair = [];
  for (let index = 0; index < 8; index++) hair.push(hex(await deriveBytes(digest, 'hair.modular.strands', index, 8160)));
  return {schema: 1, profile: PROFILE, adapter: 'df-ed25519-raw-v1', publicKey: hex(raw), digest: hex(digest),
    assetManifest: verifyAssets(),
    rendererSource: createHash('sha256').update(readFileSync(new URL('./render.py', import.meta.url))).digest('hex'),
    values, hair,
    landscape: hex(await deriveBytes(digest, 'background.modular.geometry', 0, 2048)),
    render: {blender: '4.3.2', device: 'CPU', width: 512, height: 512, samples: 64, seed: 0,
      adaptiveSampling: false, denoising: false, dither: 0, bvh: 'BVH2', cpuKernel: 'GENERIC',
      color: 'Standard', look: 'None', threads: 1, constructionThreads: 1}};
}
