# ADR 0004 — bounded modular head experiment

Date: 2026-10-12. Status: owner authorised a first implementation; no final renderer
selection, merge, deployment or security release is implied.

The owner clarified that exact full-pixel regeneration for the same public key is
a hard requirement. The desired next candidate assembles a realistic person from
a common detailed head mesh and compatible eye, mouth, skin and hair components.
Head orientation and eye gaze may vary between keys, but remain fixed for each key.
Offline AI-assisted component creation is a possible later asset-production route,
not a requirement to train new models for this first experiment.

Implement the candidate separately as `df-modular-cpu-exp-1`, retaining the existing
key adapter, labelled full-digest HKDF, fixed vectors and illustrated profile. Use
explicitly CC0 MakeHuman data at one recorded commit, compatible mesh morphs and
eye bindings, fixed hair curves and shared lighting. Verify asset integrity before
rendering. Use the already available Blender 4.3.2 CPU reference rather than adding
paid hardware or external inference. A small gallery covers near-frontal and
turned views. The earlier learned-renderer comparison remains future work.

The private face/background intersection is an undisclosed acceptance criterion
for rejecting different-key lookalikes. It is never an input to the generator and
is not requested, stored or instrumented by this experiment. Matching the same key
must remain pixel-exact; human tolerance concerns only the separate different-key
attack evaluation. No resistance is inferred from this implementation.

The [experiment instructions](../../experiments/modular-head/README.md) describe the
commands, provenance and validation. Complete-pixel checks cover fresh concurrent
processes and canonical PNG encoding on the current machine. The current candidate
locks both construction and rendering to one thread, explicitly selects BVH2 and
generic CPU math, and disables output dithering. Automatic/multithreaded CPU runs
showed numerical differences and were rejected rather than accepted approximately.
Geometry diagnosis subsequently found varying shading normals in the native
UV-sphere primitive; the candidate now builds those meshes in a fixed vertex/face
order and verifies complete evaluated geometry as well as image output.
They do not establish cross-machine, GPU, browser or mobile conformance. The new CI
workflow checks assembly derivation and asset integrity; it does not claim to run
the separately pinned CPU renderer.

Current portraits remain visibly computer-generated: skin maps, richer hair grooms,
adult/age variation, eye/lash materials, landscape and garment quality require more
work. Photorealism, all-100-portrait evaluation, human testing and budgeted valid-key
lookalike search remain separate gates. Do not enrol this experimental mapping as
a familiar stable identity or silently change existing released profiles.
