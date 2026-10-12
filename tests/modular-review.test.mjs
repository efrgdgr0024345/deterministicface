import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFixture, comparePixels, decodeCanonicalPng} from '../demo/modular/verify.js';
const root = new URL('../experiments/modular-head/review/', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('catalog.json', root)));
const decoded = [];
test('all CPU review fixtures retain their complete canonical bytes', async () => {
  for (const record of catalog.renders) decoded.push(await verifyFixture(new Uint8Array(readFileSync(new URL(record.image, root))), record));
  assert.equal(decoded.length, 10);
  for (const i of [6, 8, 9]) {
    assert.equal(catalog.renders[i].publicKey, catalog.renders[0].publicKey);
    assert.deepEqual(comparePixels(decoded[0], decoded[i]), {changedPixels: 0, changedBytes: 0, exact: true});
  }
  assert.deepEqual(decoded[1], decoded[7]);
  assert.ok(comparePixels(decoded[0], decoded[1]).changedPixels > 0);
});
test('corruption is rejected before the fixture becomes verified output', async () => {
  const record = catalog.renders[0], bytes = new Uint8Array(readFileSync(new URL(record.image, root)));
  const changed = bytes.slice(); changed[1000] ^= 1;
  await assert.rejects(verifyFixture(changed, record), /PNG checksum/);
  await assert.rejects(verifyFixture(bytes, {...record, rgbaSha256: '0'.repeat(64)}), /pixel checksum/);
  await assert.rejects(decodeCanonicalPng(bytes.slice(0, -1)), /Incomplete PNG|Truncated PNG/);
  const layout = bytes.slice(); layout[24] = 16;
  await assert.rejects(decodeCanonicalPng(layout), /Unsupported PNG layout/);
});
test('full-frame comparison includes background corners and every channel', () => {
  const a = new Uint8Array(1048576), b = a.slice();
  b[0] = 1; b[b.length - 1] = 1;
  assert.deepEqual(comparePixels(a, b), {changedPixels: 2, changedBytes: 2, exact: false});
  assert.throws(() => comparePixels(a.subarray(4), b), /Invalid complete/);
});
