/** Read canonical fixture pixels without browser colour conversion or Canvas. */
export const WIDTH = 512, HEIGHT = 512, RGBA_BYTES = WIDTH * HEIGHT * 4;
export async function sha256(bytes) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function decodeCanonicalPng(bytes) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!(bytes instanceof Uint8Array) || !signature.every((n, i) => bytes[i] === n)) throw new Error('Invalid PNG signature');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let at = 8, data, header = false, ended = false;
  while (at + 12 <= bytes.length) {
    const length = view.getUint32(at), name = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    if (at + length + 12 > bytes.length) throw new Error('Truncated PNG');
    if (name === 'IHDR' && at === 8 && length === 13) {
      if (view.getUint32(at + 8) !== WIDTH || view.getUint32(at + 12) !== HEIGHT ||
          ![8, 6, 0, 0, 0].every((n, i) => bytes[at + 16 + i] === n)) throw new Error('Unsupported PNG layout');
      header = true;
    } else if (name === 'IDAT' && header && !data) data = bytes.slice(at + 8, at + 8 + length);
    else if (name === 'IEND' && length === 0 && data) { ended = true; at += 12; break; }
    else throw new Error('Noncanonical PNG chunk');
    at += length + 12;
  }
  if (!ended || at !== bytes.length) throw new Error('Incomplete PNG');
  const scanlines = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer());
  const stride = WIDTH * 4;
  if (scanlines.length !== (stride + 1) * HEIGHT) throw new Error('Invalid scanline length');
  const pixels = new Uint8Array(RGBA_BYTES);
  for (let y = 0; y < HEIGHT; y++) {
    if (scanlines[y * (stride + 1)] !== 0) throw new Error('Unsupported PNG filter');
    pixels.set(scanlines.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), y * stride);
  }
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 255) throw new Error('Noncanonical alpha');
  return pixels;
}
export async function verifyFixture(bytes, record) {
  if (await sha256(bytes) !== record.pngSha256) throw new Error('PNG checksum mismatch');
  const pixels = await decodeCanonicalPng(bytes);
  if (record.rgbaBytes !== RGBA_BYTES || await sha256(pixels) !== record.rgbaSha256) throw new Error('Complete pixel checksum mismatch');
  return pixels;
}
export function comparePixels(a, b) {
  if (a.length !== RGBA_BYTES || b.length !== RGBA_BYTES) throw new Error('Invalid complete pixel buffers');
  let changedPixels = 0, changedBytes = 0;
  for (let i = 0; i < a.length; i += 4) {
    let changed = false;
    for (let c = 0; c < 4; c++) if (a[i + c] !== b[i + c]) { changed = true; changedBytes++; }
    if (changed) changedPixels++;
  }
  return {changedPixels, changedBytes, exact: changedBytes === 0};
}
