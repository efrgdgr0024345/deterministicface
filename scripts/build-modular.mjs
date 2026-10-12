/** Package frozen CPU review fixtures; this never substitutes for regeneration. */
import {readFileSync, mkdirSync, copyFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {sceneSpec, PROFILE} from '../experiments/modular-head/spec.mjs';
const source = new URL('../experiments/modular-head/review/', import.meta.url);
const output = new URL('../demo/modular/data/', import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export async function buildModular() {
  const catalogBytes = readFileSync(new URL('catalog.json', source));
  const catalog = JSON.parse(catalogBytes);
  if (catalog.schema !== 1 || catalog.profile !== PROFILE || catalog.renders.length !== 10)
    throw new Error('Invalid modular review catalog');
  mkdirSync(output, {recursive: true});
  for (const record of catalog.renders) {
    if (!/^(?:portrait-[0-5]|repeat-[0-3])\.png$/.test(record.image)) throw new Error('Invalid fixture path');
    const spec = await sceneSpec(record.publicKey);
    for (const name of ['profile', 'digest', 'assetManifest', 'rendererSource'])
      if (record[name] !== spec[name]) throw new Error('Stale modular fixture: ' + name);
    for (const name of ['yaw', 'pitch', 'gaze'])
      if (record[name] !== spec.values[name]) throw new Error('Mismatched pose: ' + name);
    if (JSON.stringify(record.settings) !== JSON.stringify(spec.render)) throw new Error('Mismatched renderer settings');
    const png = readFileSync(new URL(record.image, source));
    if (hash(png) !== record.pngSha256) throw new Error('Modular PNG integrity failure');
    // Frozen fixtures have one IDAT, no metadata, filter 0, fixed 512x512 RGBA8.
    if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || png.readUInt32BE(16) !== 512 || png.readUInt32BE(20) !== 512 ||
        png[24] !== 8 || png[25] !== 6 || png.subarray(37, 41).toString() !== 'IDAT') throw new Error('Noncanonical fixture PNG');
    const raw = inflateSync(png.subarray(41, 41 + png.readUInt32BE(33)));
    if (raw.length !== 512 * 2049) throw new Error('Noncanonical scanlines');
    const pixels = Buffer.alloc(1048576);
    for (let y = 0; y < 512; y++) {
      if (raw[y * 2049] !== 0) throw new Error('Noncanonical PNG filter');
      raw.copy(pixels, y * 2048, y * 2049 + 1, (y + 1) * 2049);
    }
    if (hash(pixels) !== record.rgbaSha256 || record.rgbaBytes !== pixels.length) throw new Error('Modular pixel integrity failure');
    copyFileSync(new URL(record.image, source), new URL(record.image, output));
  }
  copyFileSync(new URL('catalog.json', source), new URL('catalog.json', output));
  writeFileSync(new URL('build.json', output), JSON.stringify({catalogSha256: hash(catalogBytes)}, null, 2) + '\n');
  console.log('Packaged ten verified CPU review fixtures; no CPU rendering runs in the browser.');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await buildModular();
