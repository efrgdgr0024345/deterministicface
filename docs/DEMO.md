# Demo implementation and reproducibility

## Pipeline

Actual Ed25519 verification CryptoKey -> raw public key -> SHA-256(adapter framing) -> existing HKDF-SHA-256 labels -> constrained procedural scene -> software rasterization -> canonical RGBA -> canonical PNG.

Adapter profile: `df-ed25519-raw-v1`.

```
digest = SHA256(UTF8("deterministicface/ed25519/raw-v1") || 0x00 || U32BE(32) || raw_public_key)
```

The core's existing `df-exp-1` derivation framing and known-answer vectors are unchanged. Raw hex digest mode is an explicitly separate laboratory input.

Rendering profile: `df-procedural-pixels-1`. Canonical output: 512x512 opaque RGBA8. The pixel checksum hashes ASCII `df-rgba8-opaque-srgb-v1`, a NUL byte, U32BE width, U32BE height and row-major RGBA bytes. The transfer interpretation is sRGB; physical monitors are not claimed identical.

Polygon coordinates are quantized to 1/16 supersampled pixels, cubic curves have 20 explicitly rounded segments, circle geometry uses a checked-in constant table, and the 1024x1024 intermediate is downsampled by a specified integer 2x2 average. No trigonometric library, platform fonts, stochastic noise source, timestamp or request ID affects pixels. Canonical PNG uses filter 0, stored DEFLATE blocks and no timestamps/metadata.

The same TypeScript core compiles once for Node and the browser worker. Four pixel goldens, a fresh-process test, PNG round-trip, fixed HKDF tests and browser checks are provided. Finite tests are conformance evidence, not proof over all runtimes. Changes to this profile require explicit review and a new rendering-profile ID after release; do not rewrite goldens to conceal drift.

## Source map

- `src/core.ts`: strict input, derivation, sampling, key adapter, actual-key verification and async presentation gate.
- `src/raster.ts`: pixel construction and canonical PNG.
- `src/portrait.ts`: versioned face/background parameter ranges and procedural construction.
- `demo/`: password-free UI. Workers return public portraits; private signing keys remain in the UI module's memory and are never exported.
- `scripts/build.mjs`: compiler, public fixture generation, static scope extraction and build manifest.
- `scripts/corpus.mjs`: 100 deterministic PUBLIC TEST identities. Seeds are derivable from published labels, so these are not secure identities. Only public keys/messages/signatures are saved.
- `scripts/server.mjs`: read-only explicit web allowlist, no PHP/admin/filesystem endpoint.
- `scripts/manage-demo.mjs`: owner-only Codespaces lifecycle. Not web-accessible.
- `tests/demo.test.mjs`: foundation, fixtures, signature, canonical pixels and HTTP isolation.
- `scripts/browser-test.py`: actual application interactions under Playwright, desktop/mobile screenshots and browser self-tests.

## Current result boundaries

The first candidate has illustrative rather than photorealistic output. Facial naturalness, human recognisability and lookalike-search resistance are unmeasured. The learned renderer, 100-portrait comparison, longitudinal study and optional private-landmark scan remain pending. The 100 public keys are not 100 evaluated portraits.

The user sees build identity and explicit remaining work. Earlier PHP milestone JSON is parsed as data and not executed or duplicated as an independently maintained scope file.

## GitHub demo hosting

Create a Codespace from `feat/df-demo-github`. The devcontainer runs `npm ci` and tests, then `manage-demo.mjs start`. Open port 8000. The app needs no password. GitHub itself may require sign-in to create the Codespace or access a still-private port. Public forwarding can be unavailable under account policy; the startup script reports that instead of leaking a token or claiming an unverified public URL.

The runtime stops when GitHub stops the Codespace. No fake live link, raw stable IP promise, keep-alive workaround, third-party host, paid GPU or cPanel step is part of this demo.
