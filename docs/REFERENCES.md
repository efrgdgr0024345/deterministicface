# Sources and decision provenance

The owner's discussion is the source for the product concept. Numeric scan defaults, TypeScript/SVG architecture, input profile and derivation framing are **project design proposals**, not owner-supplied measurements or externally validated security results.

## Existing project conventions inspected

- [Matrix AGENTS.md](https://github.com/efrgdgr0024345/matrix/blob/main/AGENTS.md): bounded tasks, source authority, tests, review and small sibling context.
- [Matrix PROJECT_START.md](https://github.com/efrgdgr0024345/matrix/blob/main/PROJECT_START.md): separate project/runtime, no console-dependent deployment, GitHub source of truth, no shared host state.
- [Matrix AI_GOVERNANCE.md](https://github.com/efrgdgr0024345/matrix/blob/main/docs/AI_GOVERNANCE.md): local BIGHUB decision contract. This handoff adapts that contract rather than loading the BIGHUB repository.

These main-branch URLs can change. They were inspected for this bootstrap on 2026-09-18. This repository's reviewed local documents govern subsequent implementation.

## Primary technical references

- [RFC 5869](https://www.rfc-editor.org/rfc/rfc5869.html), sections 2 and Appendix A.1: HKDF and known-answer data. Used for standard deterministic expansion, not proof of visual security. Our salt/labels/sampling/scene rules are project-specific.
- [W3C Web Cryptography](https://www.w3.org/TR/webcrypto/#hkdf): native HKDF interface and deriveBits framing.
- [Node Web Crypto](https://nodejs.org/api/webcrypto.html): Node's native API for the portable core's test/CLI adapter.
- [Node release schedule](https://nodejs.org/en/about/previous-releases): runtime lifecycle reference. Resolve and pin exact tool versions at implementation time.
- [W3C SVG rendering model](https://www.w3.org/TR/SVG/render.html): mathematical rendering model and allowed implementation variation. This motivates distinguishing canonical SVG from device pixels.
- [Human Distinguishable Visual Key Fingerprints, USENIX Security 2020](https://www.usenix.org/conference/usenixsecurity20/presentation/azimpourkivi): related visual-fingerprint evaluation, including human perception and adversarial similarity. Its learned generator and measured results are not this project's procedural implementation; no security numbers are transferred.
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): PR/check/review enforcement and plan availability. The repository's actual 403 response is recorded in STATUS.md.

The bootstrap uses standard-library verification tooling and no third-party face artwork/model. No software licence is chosen for the owner in this handoff. Review licences/provenance before importing any later assets.
