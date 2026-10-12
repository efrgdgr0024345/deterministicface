# Frozen CPU review fixtures

These ten canonical PNGs are review artifacts, not an image lookup generator.
`catalog.json` contains six gallery results and the four fresh-process A, B, A, A
verification results from the pinned reference described in [RESULTS](../RESULTS.md).
The filenames preserve the distinction between gallery and verification runs even
when their complete bytes are identical. Key numbers refer to the first six public
test identities in the existing 100-key corpus.

`scripts/build-modular.mjs` checks PNG and decoded full-RGBA hashes, the current
renderer and asset revisions, the original public-key derivation and pose/settings
before copying the files into the ignored static build directory. Source fixtures
are never replaced by a build. To make a new research revision, independently render
and validate it using the [experiment commands](../README.md) before replacing and
reviewing the catalog and PNGs together. Preserve experimental profile boundaries.

The [web interface](../../../demo/modular/index.html) compares saved CPU outputs
without using Canvas colour conversion for its pixel checks. Its fit and zoom
controls affect presentation only. It does not run Blender or establish repeatability
on a second machine. It records no private intersection, scroll position or analytics.
Blender, a database, credentials or a paid hosting service are not needed to serve
this finite gallery. The live arbitrary-key illustrated renderer remains separate.
