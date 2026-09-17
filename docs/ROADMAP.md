# Bounded roadmap

Each row is a separate review gate, not permission to implement the complete product. Status is tracked in [STATUS.md](STATUS.md). Implementation acceptance criteria live in [ACCEPTANCE_TESTS.md](ACCEPTANCE_TESTS.md).

| Task | Bounded outcome | Dependencies | Explicit exclusion |
| --- | --- | --- | --- |
| DF-000 | This design/handoff, vectors, repository checks and PR | Starter repository | No application or deployment |
| DF-001 | Strict digest parser, labelled native HKDF and unbiased integer sampler | DF-000 baseline available | No faces, background, UI or new server |
| DF-002A | Numerical face/scene schema and constraint-table proposal with tests | DF-001 | No whole renderer rewrite |
| DF-002B | Deterministic constrained face geometry and reviewed contact sheet | DF-002A reviewed | No claim of naturalness until reviewed |
| DF-003A | Deterministic background grammar | DF-002 geometry contract | No independent RNG or image API |
| DF-003B | Face/background landmarks and crop coverage | DF-003A | No recording secret checkpoints |
| DF-004 | Canonical SVG and pinned reference raster environment | DF-003B | No universal browser pixel guarantee |
| DF-005A | Local browser overview plus raw hex/profile comparison | DF-004 | No authentication claim or runtime backend |
| DF-005B | Fixed clockwise scan, controls, accessibility and privacy tests | DF-005A | No auto-approval or secret-location selection UI |
| DF-006 | Avalanche corpus and attacker-selected lookalike screening | DF-005 | No extrapolated security bits |
| DF-007 | Consented comparative human study and report | DF-006 | No covert data collection |
| DF-008 | Frozen stable profile and separately reviewed protocol integration | Evidence from DF-006/007 | No production release without approval |

DF-002/003 may be split further to stay reviewable. The core's natural-looking portrait requirement must not be downgraded merely to finish a milestone. If a renderer approach cannot meet it, propose a small evidence-based ADR.

## Milestone exit record

Record branch/PR, exact tested commit, executed commands, test results, completed review, unresolved risks, and whether merged. Deployment is separately recorded; none is planned now. Preserve "not implemented", "proposed" and "verified" as different states.

## Deliberately deferred decisions

Numerical art tables belong to DF-002A; reference rasterizer selection to DF-004; browser/device support to DF-005A; human-study sample size and release thresholds to DF-007; real-key encoding/protocol binding to DF-008. A smaller model must not guess these in DF-001 or expand scope to solve them all.
