# Acceptance gates

Status meanings: required = future gate; verified = backed by recorded execution. This bootstrap does not mark application gates verified.

## Gate 0 — handoff integrity (exists)

Run the three commands in [project start](../PROJECT_START.md). Validate required files, UTF-8/newlines, local Markdown file targets, non-empty task contract, derivation vectors and validator regression tests. No dependency downloads are needed for these checks. CI success means the handoff is internally consistent, not that an application exists.

## Gate 1 — parser and derivation (DF-001)

- DF-IN-001: accept exact 64-character lower/upper hex and documented surrounding ASCII whitespace. Preserve leading zero bytes. Reject malformed lengths, internal spaces, separators, prefixes, Unicode lookalikes, unsupported algorithms/profiles, extra fields, wrong types and private-key text.
- DF-KDF-001: match every full expected output in [derivation vectors](../tests/vectors/derivation.json). Match the RFC known answer at the oracle level. Test object index big-endian encoding, label separation, repeatability and output lengths 1 and 8160. Reject zero/8161, non-integers, booleans and missing crypto.
- DF-KDF-002: injected bytes test `n=1`, `n=2^32`, `n=10`, `x=limit-1`, `x=limit`, one rejection followed by acceptance, and complete exhaustion. Reject invalid ranges and non-word-aligned/empty buffers.
- Check input/output arrays are copied, input mutation after async invocation cannot alter results, call-order does not matter, and the core makes no network/DOM/filesystem calls.
- CI executes build/typecheck/tests on the exact PR head. Do not replace real assertions with the oracle's own code.

## Gate 2 — face construction (DF-002)

Review an explicit numerical parameter registry and constraints first. Then test geometry bounds, anatomical anchor ordering, occlusion limits, deterministic construction failure and stable serialization. Record a fixed 100-hash contact sheet showing geometric diversity with constant palette, and palette diversity with controlled geometry as diagnostics only.

A contact sheet review must explicitly assess natural-looking faces, repeated base silhouettes, eye/mouth placement, clipping, exaggerated distortions and visible variation. Report schematic output as a prototype, never a completed natural-face gate. Synthetic corpus only; no biometric collection.

## Gate 3 — background and landmarks (DF-003)

Same digest/profile reproduces full geometry. Background changes with the full input, not time or a separate random seed. Validate near-contour landmarks, distinguishable negative-space relationships, layer/occlusion rules and coverage across the canvas.

Generate a fixed corpus of at least 1000 hashes. Report invalid geometry, duplicate visible primitive sequences, blank/uninformative crop windows, and concentration in fallback/default motifs. Fail on invalid geometry or generic fallback. Human-recognisable checkpoint richness requires review; pixel variance alone is insufficient.

## Gate 4 — serialization/rendering (DF-004)

Same inputs must produce identical canonical SceneSpec and SVG across supported Node/browser executions and repeated processes. Assert order, integer formatting, no timestamps/random IDs and no external resources/scripts. Supply expected files/digests checked in under a frozen profile, with deliberate version-change tests.

Pin one rasterizer/environment and run repeatable raster tests there. Separately perform browser/display compatibility testing; do not label arbitrary-device pixels identical. Test cache keys include digest, algorithm and profile. Comparing metadata-only differences is not a visible-image test.

## Gate 5 — scan and verification UI (DF-005)

Assert clockwise spiral order, exactly 25 unique grid cells, complete canvas crop coverage, bounds, correct 2000 ms overview and 27-second total default schedule. Test all dwell/transition endpoints, final hold, deterministic restart, pause, hidden-tab time suspension and reduced-motion mode. No auto-accept on completion.

Network instrumentation confirms no render input, checkpoint, crop-stop timing or screenshots leave the local viewer. Storage inspection confirms no checkpoint exists. Zoom must use the original scene; no image synthesis, mutable filter or remote source. Show text and profile beside the image. Exact digest mismatch cannot be overridden by a "looks right" action.

## Gate 6 — avalanche and adversarial screening (DF-006)

For 100 fixed base hashes, flip each of 256 bits: 25,600 comparisons. Report face-only, background-only, whole-scene and tile-level differences. Compare against unrelated-hash pairs. Any exact duplicate visible content in this corpus is a blocker to investigate, not proof of a universal collision result.

Select nearest-neighbour and multi-objective attack candidates, including face-similar but background-different, background-similar but face-different, and jointly similar pairs. Publish tested search budgets, candidate counts, throughput, stop rules and metric versions. Do not use human-imperceptible output bits as success evidence.

Run valid-key experiments only with an explicit protocol/canonicalization contract. Arbitrary-digest search cannot be reported as a protocol impersonation result. Keep candidate experiments offline using synthetic identities.

## Gate 7 — human validation (DF-007)

Pre-register task design, thresholds and sample-size reasoning before asserting security. Compare text, face, face+scene, and full scan under matched reference/memory conditions. Include delayed recall, repeated daily-like use, distraction, rare substitutions, difficult attack-selected pairs and relevant accessibility differences.

Measure wrong-key acceptance, correct-key rejection, inspection time and incomplete checks. Report confidence intervals and per-condition results. Keep the normal mental checkpoint undisclosed; investigate selection locations only in a separately consented study. Zero failures in a limited experiment does not establish impossibility of attack. No numeric threshold is invented as validated by this design document.

## Gate 8 — stable integration/release (DF-008)

Require independent security review, evidence-supported claim wording, stable naturalness/distinctiveness assessment, frozen version/asset/raster manifests, supported-environment list, explicit key-rotation flow and a real trusted protocol binding. Document residual threats and update policy. Production authentication, public hosting and ecosystem integration require separate approval.
