# ADR 0001 — procedural, local-first core

Status: proposed implementation baseline; accepted only through review of the bootstrap PR.

## Context

The owner requires mathematical construction from a hash of both a natural-looking face and its complete background, including interaction landmarks. The scene must be stable enough to recognise, with a private checkpoint and fixed scan. This is not Matrix's live camera/voice service. Keeping agent context and infrastructure small is a standing ecosystem requirement.

## Decision

Use a portable TypeScript library with native Web Crypto HKDF-SHA-256, integer/fixed-point procedural geometry, a versioned canonical SceneSpec and canonical SVG. Add a small local browser viewer only after the core gates. Keep the entire scene hash-derived. The first implementation task is parser/derivation/sampling only.

Native Web Crypto is available through browser and Node adapters [references](../REFERENCES.md). Python standard-library tooling in this bootstrap is solely a specification oracle and repository check, not another runtime backend.

## Alternatives not selected

An AI image API conflicts with the explicitly procedural construction requirement and adds a remote generation dependency. A catalogue of finished face images does not implement the intended construction. GPU/3D engines add a larger portability/rendering surface before the basic contract is proved. A cloud backend is unnecessary for the first pure generation prototype.

These are scope decisions, not claims that alternatives are intrinsically insecure. A procedural generator is not automatically more secure than a deterministic learned one.

## Consequences and risk

Local generation avoids requiring a service to receive hashes or secret checkpoints. SVG offers explicit geometry, but arbitrary browsers do not promise identical pixels. Canonical byte output and pinned-environment raster output are distinct guarantees.

Natural-looking faces from the proposed vector grammar are a real quality risk. DF-002 must provide a reviewed contact sheet and numerical rules. If the approach cannot meet naturalness and useful diversity, propose a focused ADR rather than silently relaxing the goal. No production security claim is authorised by this choice.
