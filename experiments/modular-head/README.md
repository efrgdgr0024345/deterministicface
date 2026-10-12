# Modular 3D head experiment

This is a separate, local CPU research candidate, `df-modular-cpu-exp-1`.
It implements the owner's shared-mesh/component proposal: compatible eyes and
mouth deformations, skin/materials, fixed hair strands, head pose, independent
gaze and a key-derived landscape. It does not replace the working illustrated
demo, collect a person's private intersection, train a model or use an image API.

The prototype is visibly computer-generated. **The photorealism gate is open.**
It establishes a runnable assembly and pose pipeline to develop further, rather
than a final realistic or security-validated renderer. Experimental portraits
must not be enrolled as stable identities. Preserve the original KDF vectors and
`df-procedural-pixels-1` mappings.

## Run

Use the existing isolated checkout; do not create a worktree unless requested.
From the repository root, build the existing core first:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run build
node --test experiments/modular-head/spec.test.mjs
node experiments/modular-head/run.mjs gallery artifacts/modular-head-confirmed
node experiments/modular-head/run.mjs verify artifacts/modular-head-confirmed-verification
```

The reference machine has Node 24.19.0, Blender **4.3.2**, Python 3.12 and Pillow
12.3.0. No new dependencies were installed for this experiment. The renderer
rejects another Blender version; using another numerical backend requires
explicit conformance work. The gallery uses the first six public synthetic test
keys, not selected best-looking results. The reference pins one global scene-
construction thread and one render thread. Independent processes may run
concurrently. Each produces 512×512 RGBA8 using 64 fixed samples, with adaptive
sampling, denoising and output dithering disabled. CPU AVX2/SSE42 paths are disabled
and the BVH2 acceleration structure is explicitly selected. These version-specific
controls are part of the candidate, not optional performance settings.

To render a supplied raw Ed25519 public key:

```bash
node experiments/modular-head/run.mjs single artifacts/modular-head-custom PUBLIC_KEY_HEX
```

The key must contain exactly 64 hexadecimal characters. Private-key material is
rejected. This command derives a portrait from a supplied public key; the existing
demo's separate verification tab demonstrates binding to an actual operation key.

Generated files stay in ignored `artifacts/` directories. Known output names for
the selected run are regenerated; logs are streamed per render. Each scene JSON
contains only public material and derived parameters. PNG metadata is removed by
the canonical encoder. `evidence.json` records pixel/file hashes, parameters,
renderer/asset fingerprints and time. Lossless EXR/float buffers and evaluated
geometry fingerprints help diagnose numerical differences. `contact-sheet.png`
is the review gallery.
No network is used while deriving or rendering portraits.

## Architecture and provenance

[spec.mjs](spec.mjs) calls the existing public-key adapter and labelled HKDF
implementation. Separate full-digest streams supply facial dimensions, pose,
materials, hair and background detail. A fixed path-tracing sampling seed belongs
to the renderer profile; the key's identity is not reduced to that seed.

[render.py](render.py) loads the common MakeHuman hm08 mesh, applies compatible
head/eye/nose/mouth morphs, and fits the separate eye mesh using its supplied
barycentric bindings. Gaze rotates each eye around the deformed eye-joint anchor.
UVs and a shared skin/lip surface avoid independent photographic patches and
baked lighting seams. The supplied eye atlas has a transparent cornea region;
the prototype handles this with transparency, without claiming realistic corneal
refraction. Hair consists of 3,200 surface-fitted fixed strands, with an additional
36 cheek-crossing strands for the long-lock family. No physics simulation runs.
The subject and landscape share the same camera and light.

All imported graphical data comes from MakeHuman commit
`a8bc2d54ff0ac92e78ff71431b1023eda42bf482`. The source explicitly releases these
bundled assets as CC0. [manifest.json](assets/manifest.json) records every original
URL, byte count and SHA-256. Both orchestration and rendering verify asset hashes.
The source includes credits to Manuel Bastioni, Data Collection AB, Joel Palmius
and Jonas Hauquier. Retain asset headers and [the CC0 licence](assets/LICENSE.ASSETS.md).
No MakeHuman application/program logic was copied; Blender is used as an external
renderer. Project-owned code parses the data formats and creates the scene.

## Evidence and limits

The existing typecheck, 28 core/server tests and derivation-vector oracle passed.
Four additional tests cover interleaved full-scene derivation, invalid/private
input rejection, the selected corpus's pose/component coverage and rejection of
same-length asset corruption.

The render verification command executes four new processes: key A, key B, key A,
and key A again. It compares every decoded RGBA byte, checks that key B changes
the output, and verifies identical canonical PNG bytes, linear float buffers and
evaluated geometry fingerprints for the repeats.
Use the current run's `evidence.json` for the actual outcome; an unexecuted command
is not a passing result. Identical pixels on this reference machine do not establish
cross-machine, GPU, browser or mobile conformance.

Earlier automatic/multithreaded CPU settings failed the exact-pixel gate, including
a one-channel one-level difference in a repeated render. Disabling dithering and
changing the acceleration/math path alone did not eliminate the variation. Those
runs remain rejected evidence, not approximately passing images. The conservative
single-thread candidate must independently pass its own checks. Geometry-only
diagnosis isolated varying shading normals to Blender's built-in UV-sphere
operator: the positions matched, but the computed normals did not. The renderer
now builds landscape spheres with explicit vertex/face order. Two fresh
geometry-only processes matched all 99 evaluated objects after this correction.
The complete-image checks remain mandatory; geometry alone is insufficient.

The six portraits vary in pose, gaze, head/mouth/nose/eyelid morphs, skin tone, hair,
iris and landscape. Visual limitations remain: a young neutral base face, similar
overall proportions, limited hairstyles, procedural skin without photographic
texture/displacement assets, simplistic landscape, and a rough garment neckline.
Sixty-four undenoised samples also leave visible grain. No human naturalness study,
100-portrait evaluation or alternative-valid-key attack study was performed.

The next realism work is a small reviewed bank of richer skin maps and hair grooms,
adult/age/shape variation and better eye/lash materials. Offline local AI-assisted
asset creation could contribute later, with assets frozen after review. Any such
change needs a new experimental revision and complete-pixel checks again.

The hidden face/background inspection relationship remains undisclosed to the
application. Whether it increases rejection of attack-selected different-key
portraits is a separate evaluation, never inferred from mesh density or pixel
differences alone.
