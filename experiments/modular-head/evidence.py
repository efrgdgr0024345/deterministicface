"""Canonicalize complete RGBA output, check fresh renders and create a review sheet."""
import hashlib
import json
import struct
import sys
import zlib
from pathlib import Path

from PIL import Image, ImageDraw

root, command = Path(sys.argv[1]), sys.argv[2]
records, pixels, images = [], [], []
count = {'single': 1, 'gallery': 6, 'verify': 4}[command]
for index in range(count):
    file = root / f'portrait-{index}.result.json'
    if not file.exists():
        raise ValueError('Missing completed render: ' + str(file))
    input_spec = json.loads((root / f'portrait-{index}.json').read_text())
    source = root / file.name.replace('.result.json', '.png')
    with Image.open(source) as image:
        image = image.convert('RGBA')
        if image.size != (512, 512):
            raise ValueError('Noncanonical dimensions')
        raw = image.tobytes()
        if raw[3::4] != b'\xff' * (512 * 512):
            raise ValueError('Noncanonical transparent output')
        images.append(image.copy())
    # Canonical PNG: fixed dimensions, filter zero, stored DEFLATE, no metadata.
    def chunk(name, data):
        body = name + data
        return struct.pack('>I', len(data)) + body + struct.pack('>I', zlib.crc32(body))
    scanlines = b''.join(b'\x00' + raw[y * 2048:(y + 1) * 2048] for y in range(512))
    encoded = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', 512, 512, 8, 6, 0, 0, 0))
    encoded += chunk(b'IDAT', zlib.compress(scanlines, level=0)) + chunk(b'IEND', b'')
    source.write_bytes(encoded)
    result = json.loads(file.read_text())
    for name in ['profile', 'publicKey', 'digest', 'assetManifest', 'rendererSource']:
        if result[name] != input_spec[name]:
            raise ValueError('Stale or mismatched render result: ' + name)
    result.update(image=source.name, rgbaBytes=len(raw), rgbaSha256=hashlib.sha256(raw).hexdigest(),
                  pngSha256=hashlib.sha256(encoded).hexdigest())
    file.write_text(json.dumps(result, indent=2) + '\n')
    records.append(result)
    pixels.append(raw)
if not records:
    raise ValueError('No completed renders')
if any(r['rendererSource'] != records[0]['rendererSource'] or r['assetManifest'] != records[0]['assetManifest'] for r in records):
    raise ValueError('Mixed renderer or asset revisions in one run')
checks = {}
if command == 'verify':
    if len(pixels) != 4:
        raise ValueError('Expected four current verification renders')
    checks = {'freshProcessExactRgba': pixels[0] == pixels[2],
              'concurrentFreshProcessesExactRgba': pixels[0] == pixels[3],
              'differentValidKeyChangesPixels': pixels[0] != pixels[1],
              'canonicalPngBytesRepeat': records[0]['pngSha256'] == records[2]['pngSha256'] == records[3]['pngSha256']}
    checks['linearFloatBuffersRepeat'] = (root / 'portrait-0.f32').read_bytes() == (root / 'portrait-2.f32').read_bytes() == (root / 'portrait-3.f32').read_bytes()
    checks['evaluatedGeometryRepeat'] = records[0]['geometrySha256'] == records[2]['geometrySha256'] == records[3]['geometrySha256']
    if not all(checks.values()):
        (root / 'evidence.json').write_text(json.dumps({'checks': checks, 'renders': records}, indent=2) + '\n')
        raise ValueError('Exact-pixel conformance failure: ' + str(checks))
summary = {'profile': records[0]['profile'], 'checks': checks, 'renders': records,
           'scope': 'Current-machine CPU evidence. No photorealism, security or cross-platform claim.'}
(root / 'evidence.json').write_text(json.dumps(summary, indent=2) + '\n')
sheet = Image.new('RGB', (3 * 512, ((len(images) + 2) // 3) * 552), '#eeeeee')
draw = ImageDraw.Draw(sheet)
for i, (image, record) in enumerate(zip(images, records)):
    x, y = i % 3 * 512, i // 3 * 552
    sheet.paste(image.convert('RGB'), (x, y))
    draw.text((x + 10, y + 520), f"{i + 1}: yaw {record['yaw']} / pitch {record['pitch']} / gaze {record['gaze']}", fill='black')
sheet.save(root / 'contact-sheet.png')
print(json.dumps({'completedRenders': len(records), 'checks': checks, 'contactSheet': str(root / 'contact-sheet.png')}))
