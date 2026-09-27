# DeterministicFace — reconciled system design

Revision 2, 2026-09-27. Read [ADR 0002](adr/0002-comparative-renderers-and-console.md) for approved decisions and exact supersession of revision 1. This remains an experimental project, not a completed or security-certified generator.

## 1. Fixed purpose and assumptions

A trusted local app renders a human-recognisable synthetic face and background from the same canonical public key it actually uses in a cryptographic operation. The system, app, display and cryptographic implementation are trusted starting assumptions. Do not shift the project into attempting to authenticate a compromised display.

Same canonical key plus frozen specification must independently regenerate identical complete portrait pixels. Every key bit must feed the derivation for both face and background. One-bit changes should normally be visibly large; resistance to deliberately searched alternative-key lookalikes is an empirical objective. Public material only enters the portrait engine.

## 2. Boundaries and flow

```text
actual operation key -> canonical adapter -> complete-key digest
                                             |
                          existing labelled HKDF-SHA-256 derivation
                                             |
                       procedural OR frozen learned experimental renderer
                             face + deterministic background/composition
                                             |
                                canonical complete portrait pixels
                                             |
                        browser/research viewer or trusted app integration
```

The manually supplied digest viewer is a research input mode, not proof of key binding. A bounded signed-file verification demo moves key binding early: same operation key, same portrait; different operation key, different derived material. Exercise failed verification, key switching, mutable inputs and late render results. Test private keys remain within the synthetic signing/verification harness, never portrait inputs or analytics.

## 3. Reuse the existing foundation

Implement DF-001 from GENERATOR_CONTRACT sections 1–4 and 8 unchanged. Preserve strict 32-byte digest parsing, labelled HKDF framing, bounded integer rejection sampling and fixed known-answer vectors. A key adapter separately defines algorithm identifier, canonical representation and whole-representation hashing; it must not hash user labels/filenames or accidentally treat equivalent encodings as new keys.

Do not replace HKDF with SHAKE just because a later discussion named it. Both face and background derive from the full input using distinct labelled contexts. Expansion/extra detail does not manufacture entropy or prove human independence.

## 4. Renderer comparison

Build one interface with two small experimental adapters. Candidate A uses the existing constrained procedural geometry/background proposal. Candidate B adapts a reviewed existing data-to-face generator; pin weights, noise and conversion, and add the same controlled background rules where compatible. Do not require both candidates to produce the same face; each must reproduce its own full portrait exactly under its own declared rendering profile.

Start with 100 predetermined test keys, matched dimensions/framing where feasible, full contact sheets, failure reporting and time/memory measurements. Use the learned generator as a realism reference without assuming it wins. Do not silently accept cartoons as natural faces or approximate pixels as exactness. Modify/train a model only after a measured failure and bounded design decision.

The initial procedural geometry and clockwise scan remain available in historical [revision 1](https://github.com/efrgdgr0024345/deterministicface/blob/1a173b6b8ca7513d20465011eb7fbc82f937761c/docs/SYSTEM_DESIGN.md). They are experimental candidates, not an unchangeable product architecture.

## 5. Exactness, identity and versioning

Define the canonical pixel layout/dimensions/channel format and digest separately from file compression/metadata. Identical SceneSpec or SVG is necessary for some candidates but not sufficient for identical pixels. Specify arithmetic, assets, model/noise, geometry, masking, compositing, resampling and colour rules. A reference backend can establish development fixtures; supported release backends must match them.

No portrait lookup/cache as identity authority; regenerate after deleting every cached image. Test restart, call order, concurrency and supported environments. Preserve old released profiles. Experimental renderer profiles must not become memorised stable identities or silently alter fixed derivation vectors.

## 6. Human/security evaluation

Compare face-only, scene-only and combined images at equivalent exposure, reference availability, display size and decision time. Include immediate and delayed recognition, valid alternative-key searches, machine-selected nearest candidates and held-out human evaluation. Report false accepts/rejects, times, search budget, sampling, confidence intervals and limitations. Do not infer huge security-bit claims from zero failures or a representation's input capacity.

One-bit arbitrary-byte diagnostics are distinct from attacks using valid alternative key pairs. An exact stored mismatch remains a mismatch. Research optional checkpoint/scan effects separately after the base verifier, without collecting a production user's chosen location. Background geometry can supply useful cues but is not a second cryptographic factor. ECC/code distance is not automatically human distance; evaluate it against a no-coding baseline later.

## 7. Single-file delivery/research console

`loader.php` combines the supplied updater and project-viewer roles: embedded scope/milestone data, private GitHub check, exact-commit update, source/installed identity, backups/recovery/rollback, and a redacted report. See [console operation](CONSOLE.md).

One deployed PHP source does not mean secrets belong inside it. Credentials/configuration/state are automatically managed outside the public root. GitHub is checked explicitly; last snapshots are timestamped, and unavailable is never labelled live. The app engine remains independent of this console. No new droplet, external image API, sibling-project modification or live deployment is part of console implementation.

## 8. Delivery gates

Review reconciled foundation -> unchanged DF-001 -> early key demo -> two-renderer comparison -> justified renderer selection/hardening -> human/adversarial evaluation -> portable frozen profile. Each implementation receives a bounded task and tests. Preserve direct credit, licence evidence and exact source versions. CI, review, merge, hosting and milestone completion are different states.
