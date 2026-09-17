# DeterministicFace

**A hash becomes one reproducible, procedurally constructed portrait scene.**

The face, background, and relationships between them all come from fixed mathematical rules applied to the same complete hash. This is not a prompt-to-image service, a face-recognition system, or a lookup table of finished avatars.

## Product contract

```text
32-byte hash + pinned generator profile
                |
         deterministic derivation
                |
       constrained scene construction
          /           |           \
       face       background     interaction landmarks
          \           |           /
            canonical scene + SVG
                       |
           familiar full-scene display
                       |
          fixed clockwise magnified scan
```

The intended human check has three layers: recognise the natural-looking synthetic face, recognise the entire background/composition, and inspect a privately and randomly selected local landmark. The checkpoint is selected once and remembered, not re-randomised on every visit. The normal application does not ask the person to click, disclose, or store it.

Same hash and profile must reproduce the same canonical output. Even a one-bit input change is intended to produce a markedly different face **and** background. Perceptual distinctiveness and resistance to adversarial lookalikes remain evaluation goals, not established security guarantees. Extra deterministic detail does not create extra cryptographic entropy.

## Start here

- [Agent instructions](AGENTS.md) and [handoff](docs/HANDOFF.md).
- [System design](docs/SYSTEM_DESIGN.md): product, architecture, verification flow and boundaries.
- [Generator contract](docs/GENERATOR_CONTRACT.md): precise first implementation interface.
- [First task: DF-001](docs/tasks/DF-001.md): hash parsing and parameter derivation only.
- [Acceptance tests](docs/ACCEPTANCE_TESTS.md), [threat model](docs/THREAT_MODEL.md), and [roadmap](docs/ROADMAP.md).
- [Project setup](PROJECT_START.md), [AI governance](docs/AI_GOVERNANCE.md), and [status](docs/STATUS.md).

## What exists now

This bootstrap contains design, task contracts, deterministic derivation vectors, repository validation tools, and a CI workflow. **The application, portrait renderer, website and scan player are not implemented.** Passing bootstrap CI validates this handoff package; it does not validate a portrait or its security.

Run the existing checks from the repository root with Python 3.12 or newer:

```bash
python3 tools/check_repository.py
python3 -m unittest discover -s tools -p 'test_*.py' -v
python3 tools/check_vectors.py
```

The proposed application uses a portable TypeScript core with native Web Crypto, then a small browser interface. No runtime backend, AI model, database, paid service, or new droplet is required for the first prototype. See [ADR 0001](docs/adr/0001-procedural-client-side-core.md).

## Delivery boundary

One bounded task per branch and PR. Validate the exact PR head, inspect substantive review findings, and merge only through the documented gate. Keep Matrix, BIGHUB, PTL, and all existing droplets untouched. BIGHUB is the ecosystem governance reference, not a generation dependency.

The repository remains private. GitHub currently reports a plan restriction on rulesets; see [status](docs/STATUS.md). Repository documents are not a substitute for server-enforced branch protection.
