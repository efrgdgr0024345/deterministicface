import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, sep} from 'node:path';
import {sceneSpec, verifyAssets, PROFILE, assetDirectory} from './spec.mjs';

const keys = JSON.parse(readFileSync(new URL('../../demo/data/test-keys.json', import.meta.url))).cases;
test('canonical public key and full scene reproduce after interleaved derivation', async () => {
  const [first, other, repeated] = await Promise.all([
    sceneSpec(keys[0].publicKey), sceneSpec(keys[1].publicKey), sceneSpec(keys[0].publicKey.toUpperCase()),
  ]);
  assert.deepEqual(first, repeated);
  assert.notEqual(first.digest, other.digest);
  assert.notDeepEqual(first.hair, other.hair);
  assert.notEqual(first.landscape, other.landscape);
  assert.notDeepEqual(first.values, other.values);
  assert.equal(first.profile, PROFILE);
  assert.equal(first.publicKey, keys[0].publicKey);
});
test('private-key text and malformed public input are rejected before rendering', async () => {
  for (const input of ['-----BEGIN PRIVATE KEY-----', '0'.repeat(63), 'x'.repeat(64), null])
    await assert.rejects(() => sceneSpec(input));
});
test('reference corpus covers turned heads, separate gaze and component families', async () => {
  const scenes = await Promise.all(keys.slice(0, 6).map(key => sceneSpec(key.publicKey)));
  assert.ok(scenes.some(s => s.values.yaw <= -25));
  assert.ok(scenes.some(s => s.values.yaw >= 25));
  assert.ok(scenes.some(s => Math.abs(s.values.yaw) <= 5));
  assert.ok(new Set(scenes.map(s => s.values.head)).size > 1);
  assert.ok(new Set(scenes.map(s => s.values.hairStyle)).size > 1);
  assert.ok(scenes.every(s => s.render.width === 512 && s.render.height === 512));
  assert.match(verifyAssets(), /^[a-f0-9]{64}$/);
});
test('same-length mesh corruption is rejected, not silently rendered', () => {
  const temp = mkdtempSync(join(tmpdir(), 'df-asset-test-'));
  try {
    copyFileSync(assetDirectory + 'manifest.json', join(temp, 'manifest.json'));
    const bytes = readFileSync(assetDirectory + 'base.obj');
    bytes[bytes.length - 2] ^= 1;
    writeFileSync(join(temp, 'base.obj'), bytes);
    assert.throws(() => verifyAssets(temp + sep), /ASSET_INTEGRITY_FAILURE: base\.obj/);
  } finally { rmSync(temp, {recursive: true, force: true}); }
});
