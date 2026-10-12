import {verifyFixture, sha256, comparePixels} from './verify.js';
const $ = id => document.getElementById(id);
let catalog, selected = 0, generation = 0, current, urls = [];
const cache = new Map();
const number = value => value.toLocaleString('en-US');
const pose = record => `Head turn ${record.yaw}° · tilt ${record.pitch}° · eye gaze ${record.gaze}°`;
const origin = record => record.run === 'gallery' ? `Test key ${record.keyNumber} · gallery render` : `Test key ${record.keyNumber} · independent CPU run ${record.runNumber}`;
function showError(error) {
  $('status').textContent = `Cannot verify this review fixture: ${error.message}`;
  $('check').disabled = true;
}
async function load(record) {
  if (!cache.has(record.image)) cache.set(record.image, (async () => {
    const response = await fetch('./data/' + record.image);
    if (!response.ok) throw new Error('Image could not be loaded');
    const bytes = new Uint8Array(await response.arrayBuffer());
    return {bytes, pixels: await verifyFixture(bytes, record), record};
  })().catch(error => { cache.delete(record.image); throw error; }));
  return cache.get(record.image);
}
function updateZoom() {
  const value = $('zoom').value, size = {fit: 'fit', 1: 'actual', 2: 'double', 4: 'quad'}[value];
  for (const side of ['left', 'right']) $(side + '-image').className = size;
}
function show(side, loaded) {
  const {record, bytes} = loaded;
  const url = URL.createObjectURL(new Blob([bytes], {type: 'image/png'}));
  urls.push(url);
  $(side + '-image').src = url;
  $(side + '-image').hidden = false;
  $(side + '-title').textContent = origin(record);
  $(side + '-pose').textContent = pose(record);
  $(side + '-key').textContent = record.publicKey;
  $(side + '-hash').textContent = record.rgbaSha256;
  if (side === 'left') {
    $('download').href = url;
    $('download').hidden = false;
  }
}
async function showPair() {
  const token = ++generation;
  current = null;
  for (const url of urls) URL.revokeObjectURL(url);
  urls = [];
  $('check').disabled = true;
  $('download').hidden = true;
  $('download').removeAttribute('href');
  for (const side of ['left', 'right']) {
    $(side + '-image').hidden = true;
    $(side + '-title').textContent = 'Loading verified portrait…';
    $(side + '-key').textContent = '—';
    $(side + '-hash').textContent = '—';
    $(side + '-pose').textContent = '';
  }
  $('comparison-origin').textContent = '';
  $('result').className = 'result';
  $('result').textContent = 'Select a comparison, then check every pixel.';
  $('status').textContent = 'Checking PNG and complete RGBA checksums…';
  try {
    const left = catalog.renders[selected], right = catalog.renders[Number($('comparison').value)];
    const pair = await Promise.all([load(left), load(right)]);
    if (token !== generation) return;
    current = pair;
    show('left', pair[0]); show('right', pair[1]); updateZoom();
    $('comparison-origin').textContent = right.run === 'repeat' ? 'Saved output from a separate, fresh Blender process on the CPU reference.' : 'Different public key; both portraits use the same frozen experimental profile.';
    $('status').textContent = 'Both saved renders verified. Ready to compare every pixel.';
    $('check').disabled = false;
  } catch (error) { if (token === generation) showError(error); }
}
function selectKey(index) {
  selected = index;
  const record = catalog.renders[index];
  for (const button of $('gallery').children) button.setAttribute('aria-pressed', String(Number(button.dataset.index) === index));
  $('comparison').replaceChildren();
  const repeats = catalog.renders.map((render, i) => ({render, i})).filter(({render}) => render.run === 'repeat' && render.publicKey === record.publicKey);
  const alternatives = catalog.renders.slice(0, 6).map((render, i) => ({render, i})).filter(({i}) => i !== index);
  for (const {render, i} of [...repeats, ...alternatives]) {
    const option = document.createElement('option'); option.value = String(i);
    option.textContent = render.run === 'repeat' ? `Same key · independent CPU run ${render.runNumber}` : `Different key ${render.keyNumber} · head turn ${render.yaw}°`;
    $('comparison').append(option);
  }
  $('comparison').disabled = false;
  $('same-key').disabled = !repeats.length;
  $('same-key').title = repeats.length ? '' : 'Independent repeat fixtures are available for test keys 1 and 2.';
  showPair();
}
$('comparison').addEventListener('change', showPair);
$('zoom').addEventListener('change', updateZoom);
$('same-key').addEventListener('click', () => {
  const index = catalog.renders.findIndex(record => record.run === 'repeat' && record.publicKey === catalog.renders[selected].publicKey);
  if (index >= 0) { $('comparison').value = String(index); showPair(); }
});
$('check').addEventListener('click', () => {
  if (!current) return;
  const [left, right] = current, stats = comparePixels(left.pixels, right.pixels);
  const sameKey = left.record.publicKey === right.record.publicKey;
  $('result').className = 'result' + (stats.exact ? ' pass' : sameKey ? ' fail' : '');
  $('result').textContent = stats.exact ? 'Exact match: all 1,048,576 RGBA bytes are identical. 0 / 262,144 pixels differ, across the complete face and background. This compares saved independent CPU renders.' :
    `${sameKey ? 'FAILED same-key equality' : 'Different public keys'}: ${number(stats.changedPixels)} / 262,144 pixels differ (${number(stats.changedBytes)} channel bytes). Whole-image difference is not a measure of lookalike resistance.`;
});
try {
  const [catalogResponse, buildResponse, siteResponse] = await Promise.all([fetch('./data/catalog.json'), fetch('./data/build.json'), fetch('../data/build.json')]);
  if (!catalogResponse.ok || !buildResponse.ok || !siteResponse.ok) throw new Error('Review metadata could not be loaded');
  const bytes = new Uint8Array(await catalogResponse.arrayBuffer()), build = await buildResponse.json(), site = await siteResponse.json();
  if (await sha256(bytes) !== build.catalogSha256) throw new Error('Review catalog checksum mismatch');
  catalog = JSON.parse(new TextDecoder().decode(bytes));
  if (catalog.schema !== 1 || catalog.profile !== 'df-modular-cpu-exp-1' || catalog.renders.length !== 10 ||
      catalog.renders.some(record => !/^(?:portrait-[0-5]|repeat-[0-3])\.png$/.test(record.image) || record.profile !== catalog.profile)) throw new Error('Unsupported review catalog');
  if (/^[a-f0-9]{40}$/.test(site.sha)) {
    $('build-id').textContent = `Site source: ${site.sha.slice(0, 12)}${site.dirty ? ' (local changes)' : ''}`;
    $('source-link').href = `https://github.com/efrgdgr0024345/deterministicface/tree/${site.sha}/experiments/modular-head`;
  }
  catalog.renders.slice(0, 6).forEach((record, index) => {
    const button = document.createElement('button'); button.className = 'sample'; button.dataset.index = String(index); button.setAttribute('aria-pressed', 'false');
    const img = document.createElement('img'); img.src = './data/' + record.image; img.alt = `Test key ${record.keyNumber}, head turn ${record.yaw} degrees`;
    const caption = document.createElement('span'), title = document.createElement('b'); title.textContent = `Test key ${record.keyNumber}`;
    caption.append(title, `Turn ${record.yaw}° · gaze ${record.gaze}°`); button.append(img, caption);
    button.addEventListener('click', () => selectKey(index)); $('gallery').append(button);
  });
  selectKey(0);
} catch (error) { showError(error); }
