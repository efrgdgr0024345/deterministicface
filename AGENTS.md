# DeterministicFace agent instructions

## Mission and authority

Help a human recognise the **actual working public key** in a trusted application through an exactly reproducible face and background. The local system, app, display and cryptographic implementation are accepted trusted assumptions. Do not repeatedly challenge them or raise copied pictures/public keys as an objection to this scoped project.

Authority order: current explicit owner instruction; this file; [ADR 0002](docs/adr/0002-comparative-renderers-and-console.md); [system design](docs/SYSTEM_DESIGN.md); relevant unchanged [generator contract](docs/GENERATOR_CONTRACT.md) sections; acceptance tests; current task. ADR 0002 identifies which older procedural-only sections it supersedes. Preserve the exact DF-001 derivation framing and expected vectors.

## Invariants

- Same canonical working key plus frozen profile must independently reproduce identical full portrait pixels, including face and background. Cache is an optimisation, not identity authority.
- Derive all face/background material from the complete digest through the existing labelled HKDF construction. Do not split raw input bits into isolated feature families or reduce the result to a tiny seed.
- A deterministic procedural candidate and a frozen local learned candidate are both authorised experiments. Do not use an external image API, train a new model or select the winner without evidence and an explicit design decision.
- Identical SVG/scene bytes do not meet the final pixel requirement by themselves. Exact pixel conformance on supported targets is an early gate.
- The portrait engine accepts public material, never private keys. A separate small demo may use synthetic test key pairs for signing/verification, without putting a private key into portrait derivation.
- The key adapter must use the actual operation key, including stale/concurrent job tests. Never use an unrelated display key.
- No security bits inferred from parameter count, backgrounds, ECC or pixel diversity. Perceptual improvement and targeted lookalike resistance must be tested.
- Preserve the optional private-landmark/scan research as a separate later experiment, not a prerequisite for the first verifier. No production checkpoint collection.
- Freeze released profiles; do not silently regenerate familiar keys using new mappings. Label experimental revisions clearly.
- Keep the generator independent of UI/network/camera/microphone. The PHP console is separate delivery/research tooling.

## Work loop

Read this file, [handoff](docs/HANDOFF.md), [status](docs/STATUS.md) and the current task; then only relevant sections. Inspect live branch/PR state. Preserve unrelated work and fixed vectors. Use one bounded branch/PR; execute local tests and CI on the exact head. Review the substantive changes, not merely green badges. Never self-approve, force-push, bypass protection or treat a review request as approval. Record merge, deployment, CI and review state separately.

The console task is an owner-authorised exception to the earlier suggested implementation-line budget because the owner explicitly requested one self-contained PHP file combining two supplied examples. Do not expand it into generator implementation. Later coding tasks remain small and individually reviewed.

## Autonomy and boundaries

The owner authorised the approved plan and creation of this console/tests/documentation in the existing repository. Ordinary local implementation and tests fit this task. No authority to spend, create droplets, change visibility/account plans/permissions, merge without review, publish a package or deploy to the live host is inferred. Keep Matrix, BIGHUB, PTL, LearnPiano and their servers unchanged. Use the supplied examples as credited source material, not live sibling-project edit targets.

Never hard-code real credentials or commit generated setup codes. Console mutations require authenticated POST + CSRF; configuration/token/backups/state stay outside the public web root. Never claim a dashboard milestone is complete merely because the loader installed successfully.

Report actual evidence and remaining blockers. Do not promise unattended future/background work. Stop at the bounded task gate.
