# Agent handoff — working GitHub test demo

## Latest modular review work

On 13 October 2026 (Australia/Perth), the owner requested a working GitHub URL for
the modular proposal. Branch `feat/modular-head-experiment` adds the separate CPU
candidate and a finite interactive review gallery at `modular/`. Read
[ADR 0004](adr/0004-modular-head-experiment.md), [ADR 0005](adr/0005-modular-github-review.md)
and [web review notes](MODULAR_WEB.md). Six predetermined CPU images and four
independent repeat images are bundled with exact PNG/RGBA checksums. The viewer
never claims those saved images are live key-to-3D regeneration. The existing
illustrated generator remains live and its fixed vectors/pixel goldens are preserved.

Local checks passed: typecheck, 31 core/server/review tests, four scene/asset tests,
nine modular browser checks and the existing browser/portable self-tests. Photorealism
and different-valid-key lookalike resistance remain unestablished. No checkpoint,
click marker, storage or telemetry is added. The existing Pages hostname responds,
but its `github-pages` environment currently permits deployments from `main` only.
Feature-branch publication therefore requires an explicit permission decision;
do not merge, weaken the policy or claim the new URL is live merely from green CI.

Start with AGENTS.md, [ADR 0003](adr/0003-github-test-demo.md), [status](STATUS.md), [demo notes](DEMO.md) and the current PR head. The latest owner instruction authorises a multi-file, password-free working demo hosted through GitHub. Do not restart cPanel/token/setup-code work.

## Fixed requirements

The system/application/display/cryptography are trusted. The portrait represents the actual working public key. The same canonical key and frozen profile independently regenerate identical face AND background pixels. Cache is not identity authority; the full digest enters every labelled HKDF derivation. Do not reopen copied-picture objections or modify the existing derivation vectors.

## Current implementation

The `feat/df-demo-github` branch and PR #4 add a native Web Crypto core, Ed25519 working-key adapter, original procedural face/background, software RGBA rasterizer, canonical PNG, browser worker, password-free demonstration and read-only static server. Tests include original vectors, 100 public key/signature fixtures, pixel goldens/fresh-process regeneration, server isolation and real browser controls.

The face is illustrative, not photorealistic. No learned-generator winner, human-recognition result or lookalike-security claim is established. This is the first test candidate in the approved comparison, not abandonment of the learned candidate.

## Continue from evidence

Read live CI and substantive review on the exact head. The initial browser run exposed a CSP-incompatible test wait; it was corrected without relaxing the page CSP. Review identified stale portraits after input edits; the fix clears old output/download/repeat controls and adds a regression test. Verify both on the latest head instead of assuming a new commit inherits old checks.

Create/resume the specified Codespace using an available authorised action; otherwise give the owner the README's branch-specific creation link. Never invent an active app.github.dev URL. The app itself has no password. Share only port 8000, not repository files or the legacy loader.

Do not merge automatically. Preserve local changes and existing branches. Keep the legacy loader review finding distinct from demo readiness. Read-only test execution and approved implementation can proceed without requesting the owner to repeat settled requirements.

## Next research work after user testing

Collect feedback on real portraits and controls. Then separately evaluate naturalness, all 100 rendered portraits, the frozen learned candidate, runtime conformance, budgeted valid-key lookalikes and human studies. The optional landmark/scan remains later research. Do not inflate this demonstration into a completed security product.
