# ADR 0005 — interactive modular review on GitHub Pages

Date: 2026-10-13 (Australia/Perth). Status: owner explicitly requested a working
GitHub URL to test the proposal; feature-branch publication authorised. This does
not authorise merging the experiment or changing account permissions.

Publish an interactive static review interface at `modular/` beside the existing
illustrated browser generator. Bundle the first six predetermined public-key CPU
portraits and four saved independent verification renders from the pinned reference.
Validate their key derivation, renderer/asset revisions, PNG hashes and complete
RGBA hashes on every build. Browser checks also validate the complete PNG and raw
RGBA scanlines before showing a labelled main portrait or making it downloadable.
Compare every pixel, including the background, with no display/Canvas rounding.

Selecting a new key invalidates prior comparison results and labelled output while
asynchronous verification is pending. Generation tokens prevent delayed loads from
displaying an earlier selection. Generic zoom and scrolling are ephemeral view
operations: no landmark input, image-click marker, view-position storage or telemetry
is added. Tests cover corruption, full-frame comparisons, selection races and mobile
layout as well as the preserved existing generator checks.

GitHub Pages serves static files. The modular interface therefore labels its finite
saved CPU gallery and comparisons explicitly. It does not claim to regenerate a 3D
portrait, verify independent rerendering in the visitor's browser or accept arbitrary
public keys for Blender rendering. The existing live key generator remains available
for independently repeated illustrated portraits. CPU rendering instructions remain
in the separate [experiment](../../experiments/modular-head/README.md).

The Pages workflow may publish the owner-authorised experimental branch after its
tests pass, without merging main. A green build is distinct from a successful Pages
deployment, an observed endpoint, external review and a final renderer decision.
Photorealism and different-valid-key lookalike resistance remain unestablished.
