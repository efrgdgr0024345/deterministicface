# ADR 0002 — evidence-led renderer choice and single-file console

Status: **direction approved by the owner in chat on 2026-09-27**. Code review, CI, merge and live deployment remain separate gates.

## Decision and explicit supersession

The trusted local system/app/display/cryptography assumption is fixed. The goal is human recognition of the actual public key the app is using, not proof of system health from an image.

This ADR supersedes the procedural-only selection in ADR 0001; the former mandatory procedural-only wording in AGENTS, HANDOFF and PROJECT_START; SYSTEM_DESIGN sections 1–4, 7, 9 and 13 insofar as they selected one renderer, deferred key integration or made scanning mandatory; and GENERATOR_CONTRACT sections 5–7 insofar as they fixed a future scene/renderer/scan implementation rather than a comparison candidate. Earlier geometry and scan definitions remain experimental design material, not discarded intellectual work.

GENERATOR_CONTRACT sections 1–4 and 8, the labelled HKDF-SHA-256 framing and the checked-in derivation vectors remain unchanged. DF-001 remains its bounded implementation task.

## Approved approach

Keep one existing repository. Implement the derivation foundation; bring forward a small canonical public-key adapter and signed-file verification demonstration. Bind portrait jobs to the actual verification key, including out-of-order/concurrent tests.

Compare two small renderers, not two complete applications: the procedural proposal and a reviewed existing FaceHash/StyleGAN-style baseline. Use 100 predetermined test keys, comparable framing/resolution/background rules where feasible, and publish all outputs and failures. The learned candidate is a realism reference, not an automatic winner. Do not train from scratch before evidence identifies a reason.

Define canonical complete pixels early. Fix weights/assets/noise/arithmetic/masking/compositing and rendering rules as applicable. A controlled reference environment is a development starting point; the released portable profile must match reference pixels on supported targets. Neither caching nor identical SVG replaces this requirement. Use different explicit experimental rendering-profile identifiers; do not mutate the existing KDF vectors to fit a renderer.

Separate the adapter, derivation core, renderer and interface. Browser/PHP tooling is permitted without requiring the portrait engine to fit inside PHP. Final local regeneration must not depend on an image lookup or external image API. Use existing available compute before proposing paid infrastructure.

Test face-only, background-only and combined images with equal familiarisation; measure wrong-key acceptance, correct-key rejection, time, delayed recall and attacker-selected valid-key alternatives under stated budgets. Keep the private remembered checkpoint and scan as a subsequent controlled experiment. Defer custom training and CEAL-inspired distance coding until baselines justify them. Record provenance and licence compatibility for code, weights and data before a deployment selection.

## Console scope

The owner supplied LearnPiano loader and Black Cat/PTL project-viewer source and requested a standard updater plus consolidated scope/progress. Implement a single `loader.php` containing the project JSON in a delimited comment and all PHP/HTML/CSS logic. Remote scope refresh parses that data at a pinned commit; it never evaluates remote PHP merely to display the plan. No separate maintained project_content.json or second project.php implementation.

Private credentials and automatically generated runtime state/backups are not source-code dependencies and are not stored publicly. Setup needs an owner-provisioned random code. Updates require authenticated HTTPS POST, CSRF, a checked exact commit and required CI; non-main installation needs an explicit experimental acknowledgement. The console never merges branches or grants itself approval. Only loader.php and a reviewed web/ bundle are deployable; do not copy the entire private repository under the website.

Maintain installed commit, checked source commit, snapshot timestamp, CI, review, merged/deployed state and milestone completion separately. Unknown/offline is not live/up-to-date. Preserve unmanaged files, block local-edit collisions, stage validated files, retain private backups and a recovery journal, and offer rollback. Multi-file activation is recoverable, not globally atomic or zero-downtime. Do not modify the supplied sibling projects.

## Outcome gate

Select the simplest renderer that satisfies exact reproduction and demonstrates useful human recognition against deliberately selected substitutes, rather than selecting solely for small size, realism or ease of coding. Improvement and novelty remain outcomes to establish.
