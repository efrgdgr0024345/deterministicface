# DeterministicFace agent instructions

## Mission and authority

Build the owner's deterministic **whole-scene** visual fingerprint, not a different face-generation product. Natural-looking synthetic face, deterministic background, face/background interaction landmarks, and a repeatable clockwise inspection scan are all required.

Authority: current explicit owner instruction; this file and [AI governance](docs/AI_GOVERNANCE.md); [system design](docs/SYSTEM_DESIGN.md); [generator contract](docs/GENERATOR_CONTRACT.md); [acceptance tests](docs/ACCEPTANCE_TESTS.md); accepted ADRs; current task; roadmap. A later ADR changes a contract only when it explicitly identifies and updates the superseded sections. Stop and record a real conflict rather than silently selecting the easier interpretation.

## Context budget

First read this file, [handoff](docs/HANDOFF.md), [status](docs/STATUS.md), and the current task. Then read only the contract sections and files that task names. Do not routinely load Matrix or BIGHUB. Their local boundary is sufficient. Do not copy sibling implementations.

## Invariants

- Every visible scene component is derived from the complete hash and a pinned profile. No independent runtime randomness, timestamps, environment-dependent seeds, external image fetching, or AI image generation.
- Never partition raw hash bits into isolated face/background controls. Use labelled derivation from the entire input. Shared composition geometry is permitted and required for interaction landmarks.
- Deterministic does not mean collision-free, perceptually unique, or secure against lookalike search. Do not claim security bits from parameter count or image complexity.
- A checkpoint is a private human checking rule, not an application password, a second cryptographic factor, or a key derivation input. No checkpoint telemetry or special secret-location highlight.
- The portrait is a synthetic fingerprint, not the actual appearance, name, demographic profile, or biography of the key owner. No real-person photographs or biometric enrolment.
- Never override an exact key mismatch with a familiar-looking portrait. Never claim a pasted hash proves possession of a private key.
- Never change released profile output silently. Golden fixture updates need explained contract changes, not snapshot regeneration to hide failures.
- Keep core generation independently testable without DOM, network, LLM, camera, microphone, or server.

## Work loop

1. Inspect live branch/PR/task state before editing. Preserve unrelated work.
2. Implement one bounded task on its own branch, with negative tests and traceable requirement IDs.
3. Run the documented local commands. Record actual results, not intended results.
4. Audit adjacent invariants and all related edge cases together before requesting review. Avoid repeated one-finding patches when a consolidated fix is possible.
5. Open/update the PR. Obtain CI on the exact head and a substantive review of that head. A requested review, an eyes reaction, silence, or old approval is not a completed clean review.
6. Resolve a finding only with evidence: fix plus relevant test, or an explicit reasoned reviewer agreement that it is not applicable. Do not dismiss findings to get a green badge.
7. Do not self-approve, force-push, bypass protections, merge failing checks, or weaken tests. Missing review access/protection is an operational gap to report, not permission to fabricate approval.
8. Update status/handoff at task completion, identifying code merged versus deployed versus only proposed.

Suggested task budget: at most six hand-written implementation files and about 350 changed implementation lines, excluding lockfiles, test fixtures, and generated output. Split larger work into separately reviewed tasks instead of omitting tests.

## Autonomy and scope

Within an authorised task, make ordinary implementation choices and fix straightforward failures without repeated user prompts. Report meaningful actions or blockers briefly. Stop at the task's completion gate; do not implement the entire roadmap in one run. Never imply unattended background work unless an actual authorised automation exists.

No authority is granted to provision infrastructure, spend money, change repository visibility, modify account permissions, deploy, publish a package, or touch existing droplets. No runtime BIGHUB integration is required for this pure generator; consequential external actions follow the local governance contract.

## Review emphasis

Review encoding ambiguity, version drift, cross-platform determinism, ignored fields, uniform sampling boundaries, face/background independence mistakes, checkpoint disclosure, and tests that validate fixtures rather than implementation. Check claim wording as carefully as code.
