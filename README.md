# DeterministicFace — working test demo

**A public key becomes one reproducible illustrated face and background.**

This branch implements a password-free procedural prototype. No cPanel, GitHub-token form, image API, GPU, model download or database is needed to run it. It preserves the existing project documents and loader; the loader is not served or executed by this demo.

## Open the GitHub demo

**[Launch the prepared Codespace](https://github.com/codespaces/new?hide_repo_select=true&repo=1375010983&ref=feat%2Fdf-demo-github)**

Choose **Create codespace**. The environment installs the pinned compiler, runs the tests and starts port **8000**. Open the forwarded port from GitHub's notification or the **Ports** panel. Startup attempts to make **only port 8000** public, as requested for this test demo. If GitHub denies that operation, change that port's visibility in the Ports panel. There is no application password.

GitHub sign-in may be required to create a Codespace or open a still-private forwarded port; that is separate from the app. Codespaces usage is subject to the account's allowance/budget. Do not enable paid usage just to bypass a limit.

A Codespace must be created before its real `app.github.dev` URL exists. **No active hosted URL is claimed by this README.** The branch-launch link above is not itself a running server. Codespaces can stop when idle; resume the same Codespace to use it again.

## Try these controls

1. **New test key** creates a fresh public key locally and generates its complete portrait.
2. **Regenerate the same key** renders from scratch and compares all 1,048,576 RGBA bytes.
3. **Change one digest bit** compares both images. This is a digest experiment, not a claim that the modified input is another valid key.
4. **Actual-key verification** signs a message and derives the portrait from the same public-key object used in verification. Editing the message or selecting another verification key demonstrates failure correctly.
5. **Project & tests** runs browser self-tests and exports a credential-free report.
6. **Generate 12-key gallery** generates the first 12 public test identities of the fixed 100-key corpus. No portrait lookup is used.

The fixed corpus uses publicly derivable TEST seeds; never use those identities for real authentication. Private fixture material is not saved. The interactive signing test uses a fresh non-exportable private key in browser memory.

## Commands

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm test
npm start
```

Open the forwarded port 8000 (or `http://localhost:8000` for a local checkout).

```bash
node scripts/manage-demo.mjs status
node scripts/manage-demo.mjs stop
node scripts/manage-demo.mjs start
node scripts/manage-demo.mjs update
```

The update command refuses local changes and non-fast-forward pulls. It never resets or discards work. It rebuilds and tests before restarting. Failed updates do not pretend that a new build is running.

## What exists / what does not

Implemented: strict digest parsing, the unchanged labelled HKDF contract, native Ed25519 adapter and verification example, original procedural portrait geometry, a deterministic software RGBA renderer, canonical PNG encoding, a browser worker, gallery/comparison controls, a static read-only server, Codespaces startup and test workflow.

**Not implemented or proven:** trained photorealistic faces, the learned-renderer comparison, validated human recognisability, expensive lookalike resistance, a stable security release, or conformance on every possible platform. This illustrated candidate is not a claim that the naturalness goal has been met.

Exact pixel goldens are tested, not inferred from matching SVG. Rasterization uses fixed-coordinate polygons, explicit rounding, 2x supersampling and integer downsampling; no browser Canvas/SVG renderer, fonts, external assets or GPU defines the canonical pixels. Ordinary screen scaling is presentation only.

## Existing project

Start with [AGENTS.md](AGENTS.md), the [current demo decision](docs/adr/0003-github-test-demo.md), [demo implementation notes](docs/DEMO.md), [earlier approved comparison plan](docs/adr/0002-comparative-renderers-and-console.md) and [generator contract](docs/GENERATOR_CONTRACT.md).

The local application/display/cryptographic system is trusted by scope. The objective is recognising its actual working key, not proving system health from a picture. Same canonical key and profile must independently regenerate the same whole portrait. No private key enters portrait derivation.

The PHP console's existing embedded project JSON remains the source for historical scope/credits. The build parses it without evaluating PHP. Its old milestones are not silently marked complete by this prototype.

## Test artifacts

The **Working demo tests** workflow attaches `deterministicface-demo-and-tests`, containing the portable HTML demo and browser evidence. The single HTML is a generated, offline-capable copy using the same renderer; download it and open it in a browser with Web Crypto support. It is not a hosted live URL.

Prior work is credited in [the project references](docs/REFERENCES.md), the demo's Credits section and [CREDITS.txt](demo/CREDITS.txt). No third-party face artwork or model weights are bundled.
