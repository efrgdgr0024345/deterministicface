# DeterministicFace — system design

Status: proposed implementation baseline; experimental, not security-certified.

Profile reserved for the prototype: `df-exp-1`. Document revision: 1, 2026-09-18.

## 1. Owner's concept — do not reinterpret

The input is a hash. A predetermined mathematical rule system constructs a natural-looking synthetic face **and a deterministic background**, including their geometric relationships. There is no stochastic image-model call and no separate decorative background selected after the fingerprint is generated.

The human checks, in order:

1. The familiar face.
2. The familiar full background and composition.
3. A privately, randomly selected small landmark, potentially where background and face interact.

A repeatable clockwise magnified scan presents the same parts in the same order and timing on every visit. The person privately learns a checkpoint through repeated exposure. They do not disclose it to the service or other people. Random selection is an owner-intended human behaviour, not an assertion that unassisted human choices are statistically uniform. It occurs initially, not anew on each verification.

The intended contrast is a human-friendly visual fingerprint beside a long hexadecimal fingerprint. The face is a visual recognition trigger, not the key owner's real appearance and not a biometric authentication input.

## 2. Fixed requirements versus design choices

**Owner requirements:** deterministic mathematical construction of face, background and interactions; natural appearance; substantial visual change from a small hash change; three-layer recognition; private checkpoint; stable clockwise scan; a separate, manageable repository suitable for a smaller coding agent.

**Proposed technical choices:** accept SHA-256 digests first; derive labelled parameter streams with native HKDF-SHA-256; portable TypeScript core; integer/fixed-point geometry; versioned SceneSpec and canonical SVG; client-side viewer; staged realism work. These choices make the concept implementable but are not facts supplied by the owner.

**Unproven hypotheses:** people remember this better than text, daily scanning improves detection rather than habituation, private landmarks add measurable protection, and adversarially confusing alternative-key portraits are expensive to find. Tests must assess these rather than asserting them.

A procedural background adds visual information, **not additional entropy beyond the hash**. Domain-separated parameter streams are not independent authentication factors. All generator rules may be public.

## 3. Goals and non-goals

DF-DET-001: identical valid input and pinned profile produce byte-identical canonical scene and SVG.

DF-VIS-001: produce a natural-looking synthetic face with meaningful geometric variation, not just recoloured identical features. A visibly schematic development fixture does not satisfy this goal.

DF-BG-001: derive background topology, geometry, palette and texture from the same full input; build multiple recognisable local structures across the scene.

DF-INT-001: create visible face/background relationships such as a curved branch beside the jaw, a negative-space wedge by the shoulder, or a line near the hair boundary. Avoid obliterating the eyes or other recognition features.

DF-AVA-001: evaluate single-bit-change behaviour in both face and background, separately from unrelated-input and adversarial similarity. Broad change is an empirical release goal, not a promise that every two hashes are human-distinguishable.

DF-UX-001: implement the three-layer check without collecting the user's selected landmark. Preserve a raw text fingerprint alternative.

DF-TRUST-001: make the actual input and generator version explicit. Never present visual familiarity as proof of key ownership or silently approve a known key mismatch.

Not in scope: key generation, private-key storage, biometric recognition, identifying real people, a new signature/hash algorithm, training a neural image generator, building a complete login system, Matrix integration, public deployment, or commercial security claims.

## 4. Architecture and data flow

```text
trusted protocol/key adapter (future; separately reviewed)
                | canonical digest
                v
strict input parser -> labelled derivation -> constrained SceneSpec
                                            /       |       \
                                         face   background  landmarks
                                                        |
                                               canonical SVG renderer
                                                        |
                             full scene + text fingerprint + scan player
```

The initial viewer takes a manually supplied digest and is labelled **research/demo**. It is not the trusted protocol adapter in this diagram.

**Portable core:** input parser, derivation, parameter registry, geometry constraints, scene model, canonical serializer and SVG emitter. Native cryptographic primitives may be asynchronous; the complete operation remains deterministic for its explicit inputs.

**Browser adapter:** local user input, accessibility, side-by-side display and magnified scan. Use the same generated scene throughout; no second generative pass for zoom. No server request is needed for rendering after the application assets are available.

**CLI/test adapter:** Node invokes the same core for fixtures and corpus tests. A Python standard-library oracle in this bootstrap checks the derivation contract independently; it is test infrastructure, not a second application implementation.

**Optional later integration:** a protocol verifier supplies a canonical digest of the actual negotiated public key and maintains its trusted association. It must verify key possession itself. Remote parties cannot supply a replacement image that the verifier simply trusts.

## 5. Input and version boundary

The first supported input is exactly 32 bytes, represented in the UI/API as 64 ASCII hexadecimal characters plus a fixed algorithm identifier `sha256`. See [generator contract](GENERATOR_CONTRACT.md) for parsing and byte order. Do not silently hash a hex string again or accept arbitrary text as though it were a key fingerprint.

A future public-key adapter must specify protocol, algorithm identifier, canonical public-key encoding and fingerprint derivation in its own reviewed contract. Comments, whitespace in PEM, key labels and filenames must not accidentally become identity inputs. Do not invent a universal public-key encoding now.

A profile identifies derivation framing, parameter ranges, all geometry rules/constants, asset provenance, colour rules, canonical SVG grammar, scan policy and reference rendering environment. During development, show the build revision as well as `df-exp-1`; do not ask users to memorise a moving experimental mapping. A stable version is frozen only after its acceptance gates pass.

Unknown versions fail explicitly. An update cannot silently regenerate a familiar identity under changed rules. Keep old profiles available or require deliberate re-verification. A renderer/version change and a key change must be distinguishable in the UI.

## 6. Derivation — standard primitives, project-specific visual rules

Use the **whole** hash as input to HKDF-SHA-256, with fixed application/profile salt and labelled parameter information. Every face, background and landmark stream depends on the complete digest. Do not map one raw hash segment to the face and another to the background. The exact strings, counters, lengths and sampling procedure are fixed in [generator contract](GENERATOR_CONTRACT.md).

Labels separate parameter consumption: adding an optional hair-detail draw must not accidentally shift every later background draw. A shared composition specification controls positions/lighting, while separate labelled streams provide feature variation. Such separation avoids accidental coupling; it does not prove statistically independent perceptual features.

Complex mathematics belongs in geometry and constraints. Do not invent cryptography, secret generator rules, chaotic floating-point seeds, or undocumented PRNG algorithms. HKDF is used here as deterministic expansion of a **public** input, not to create a secret or claim a security strength for the image. See [references](REFERENCES.md).

## 7. Procedural face construction

Proposed first rendering approach: constrained 2.5-dimensional vector portrait geometry with layered Bézier shapes and controlled gradients. It offers explicit reproducible geometry without requiring a GPU, neural model, or finished-face image library. Natural-looking output remains a demanding artistic/engineering acceptance gate; do not assume vector output automatically achieves it.

Build relative anatomical anchors first: head outline, eye line, centre line, nose base, mouth line, jaw and neck/shoulder boundary. Sample proportions within a reviewed table, then derive feature positions from those anchors. Eyes, nose and mouth are not independently scattered across the canvas. Use bounded asymmetry only where specified.

Variation groups include head/jaw/cheek contours; eye spacing, shape and brows; nose geometry; lips and mouth width; ears; hairline, parting, volume and strand structure; skin reflectance; constrained head pose; and clothing silhouette. Do not attach race, personality, trustworthiness, health or other sensitive labels to these parameters. Natural variation is not a claim about the actual person behind a key.

Use a limited coherent lighting configuration so small geometric differences remain visible. Global composition must not hide most variation in hair, shadows or the crop. Review outputs in grayscale as well as colour. A tiny low-dimensional face family with enormous invisible texture variation does not meet the intent.

DF-002 must produce the numerical geometry/range table and contact sheet for review before it is frozen. Do not let a smaller agent invent and commit a complete portrait grammar in its first task. If this approach fails the naturalness gate, record evidence and propose a bounded geometry-renderer change; do not silently substitute cartoons or a diffusion API.

## 8. Background and interaction construction

Background generation is an equal part of the fingerprint pipeline. Derive multiple scales of structure: broad layout and negative space, mid-scale branches/curves/polygons, and local shape/texture details. Avoid blank regions, uniformly noisy wallpaper, or a tiny palette of reused complete scenes.

Build interaction landmarks against the **generated** head/hair/shoulder contour. Examples are gaps, near-tangencies, contour crossings behind the subject and angular relationships. A shared contour reference coordinates face and background; independently labelled draws choose the local structures. Global coherence does not require reusing the same few face parameters for all background variation.

Define deterministic bounds and construction order. Prefer constructive placement over repeatedly generating an entire scene until it looks attractive. Any rejection/resampling rule must have a fixed order, attempt limit and explicit error outcome. Never fall back to one generic face/background on failure.

The scene specification contains public landmark IDs and positions for inspection/coverage tests. These are possible checking locations, **not a record of which one a human selected**. The scan should include the whole scene so a user is not restricted to the developer's guessed favourite spots.

## 9. Three-layer verification and clockwise scan

Always show a full-scene overview with the text fingerprint and profile label. The intended user action is face recognition, whole-scene recognition, then the private detail check, even when the face looks familiar. Do not make the third layer conditional on already suspecting the face.

Prototype scan policy `scan-grid-cw-1` is a proposed presentation baseline, not a research finding:

- Canvas coordinates are 1024 by 1024.
- Use a 5 by 5 grid of crop centres at x/y values 128, 320, 512, 704, 896. Each crop is 256 by 256 canvas units. Overlap prevents a small landmark at one crop edge being permanently hidden.
- Visit grid cells in a clockwise inward spiral: begin top-left, move right across the outer top edge, down the right edge, left across the bottom, and up the left; repeat on inner rings, ending in the centre. Include each cell once.
- Start with a 2000 ms overview. Dwell at each of the 25 crops for 600 ms; interpolate linearly to the next centre over 400 ms, except after the last crop, which holds for 1000 ms and ends. This defines a 27-second default sequence. It is a testable UX choice, not a promised optimum.
- Adjacent centres are 192 units apart. The animated movement speed and schedule are fixed, independent of hash and checkpoint. The full image remains available as orientation context.
- Replay is explicit. Do not loop indefinitely, auto-approve on completion, or interpret elapsed viewing time as proof of inspection. Stop advancing when the page is hidden. Provide pause/restart and reduced-motion stepped views of the same crops.

The application never asks where the secret checkpoint is. No click-to-select, gaze tracking, checkpoint storage, checkpoint analytics, special final secret crop, or event describing which crop someone stopped on is transmitted. Timing observations by a local observer remain a threat; see [threat model](THREAT_MODEL.md).

The zoom is a viewport onto the same canonical scene, not generated extra detail. Display interpolation and magnification must be stable within the supported environment. A display unsuitable for reliable inspection should use a text/reference comparison alternative, not fabricated confidence.

## 10. Deterministic output and rendering limits

Scene geometry uses integers in 1/64-canvas-unit increments. Integer/rational computation, stable ordering and pinned constants avoid implementation-dependent parameter drift. The contract defines serialization and prohibits unordered maps, ambient randomness and unversioned assets.

Guarantee levels are different:

- **Canonical data:** identical scene bytes across supported implementations.
- **Canonical SVG:** identical SVG bytes from that scene.
- **Reference raster:** identical pixel/output bytes only under a pinned rasterizer, version, fonts/assets, dimensions, colour profile and execution environment.
- **Human appearance on arbitrary screens:** a compatibility/usability claim to test, not byte identity.

SVG implementations can differ in their rendering approximations; canonical SVG bytes alone do not prove identical browser pixels [references](REFERENCES.md). Avoid text/fonts and platform-native face assets inside the fingerprint. A rasterizer is selected and pinned at DF-004; until then there is no canonical PNG claim.

## 11. Trust, security and privacy boundary

The generator is public and reproducible. The attacker is assumed to know the image, hash, rules, scan and all possible landmarks, and can search alternative keys. Only the particular user's checkpoint is initially undisclosed.

A complete trusted verifier must derive the portrait from the actual key used by its cryptographic connection. A webpage controlled by an attacker can copy an old portrait and animation exactly. This prototype does not solve a compromised display, stolen original private key, first-contact trust or a malicious software update.

When a trusted prior digest exists, compare all digest bytes and algorithm metadata. A mismatch stays a mismatch regardless of human familiarity. A profile mismatch requires separate handling. Keep the previously trusted association unchanged until deliberate re-verification; do not silently replace the baseline.

The same globally reproducible portrait may link uses of the same hash across contexts. Do not advertise anonymity. No private keys, facial uploads, real-person datasets or stored checkpoint are required. Use synthetic corpus hashes for automated reports. Do not upload a person's fingerprints or screenshots to external analytics/model services by default.

## 12. Evaluation and release gates

The complete test plan is [acceptance tests](ACCEPTANCE_TESTS.md). Use separate results for determinism, visual quality, accidental similarity, adversarial similarity, usability and privacy. A passing code test is not a passing human experiment.

Compare equal-information text/reference verification, face only, face plus scene, and the full private-checkpoint scan. Use both trusted-side-by-side and remembered-reference conditions; do not give one group a reference image and force another group to memorise hex. Include delayed recall, rare unexpected substitutions, distractions and reduced-motion accessibility.

Measure wrong-key acceptance, correct-key rejection, verification time and scan completion without recording the secret location. Use a separate consented study when checkpoint-location distribution itself is being investigated. Record confidence intervals, study population, protocol and limits; zero observed failures is not proof of impossibility.

Evaluate lookalike search against the entire scene and local patches, not only face embeddings. Proxy image metrics help select difficult pairs but do not prove human distinguishability. Distinguish arbitrary-hash experiments from valid alternative-public-key searches.

No security release until a reviewed study and adversarial evaluation support a narrow claim. Naturalness, public-key protocol integration and perceptual attack resistance remain explicit gates after the initial implementation tasks.

## 13. Delivery and unresolved decisions

Use [roadmap](ROADMAP.md) and [first task](tasks/DF-001.md). Deliver one small PR at a time, with local checks, CI and review on the exact head. No new infrastructure is authorised. The current bootstrap is documentation and test scaffolding only.

Open decisions intentionally deferred: exact portrait geometry/range tables, canonical rasterizer/environment, supported browser/device matrix, human-study thresholds/sample size, and the first real public-key protocol adapter. Each has a named milestone owner/gate; none blocks DF-001. Do not fill these gaps with unstated defaults or claim the stable generator is already specified down to every artistic control point.
