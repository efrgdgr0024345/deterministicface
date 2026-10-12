# First modular-head experiment results

Local run: 12 October 2026. Profile: `df-modular-cpu-exp-1`.

The first six predetermined valid public test keys rendered successfully. Their
yaw angles are −14°, 5°, −34°, 27°, −10° and 30°; gaze is independently derived.
The common cropped mesh has 5,028 control vertices before subdivision. There are
3,200 fixed hair strands, plus 36 cheek-crossing strands for the loose-lock family.
All portraits and failures were retained during development; no best-looking-key
selection or hidden landmark collection was used.

## Exact-repeat evidence

Four fresh processes rendered key A, key B, key A and key A again. Every check
below passed on the pinned current CPU reference:

| Check | Outcome |
| --- | --- |
| Complete RGBA equality after a fresh process | Passed: all 1,048,576 bytes |
| Complete RGBA equality in fresh concurrent processes | Passed |
| Different valid key changes complete output | Passed |
| Canonical PNG bytes repeat | Passed |
| Lossless linear float buffers repeat | Passed |
| Evaluated geometry fingerprints repeat | Passed |

The independent gallery's A and B renders also match their verification renders.
The complete gallery uses one renderer source and one asset revision. The six
gallery render durations were 113.95, 82.64, 103.97, 88.52, 68.20 and 80.28 seconds
(mean 89.59 seconds), under concurrent load. This is not a general performance
estimate or a minimum hardware requirement.

Key A's reference SHA-256 values:

```text
RGBA:     414cf1e4da0ff557f33e337abf288327cf5046af3be21d0c0d7521d38d84fcbc
PNG:      d0a96b1e41f2023f1f1d4fb0301b8f1348ad1dbf54b5114caab7fe773322b365
Linear:   babbf4f4baf86b52ba57023c7ca91006b35aa2da6629c6923b492641bdf01980
Geometry: 9586de69bcc582f89f501e0f3461bc49a1ca68f61a363a2ee80ed66a6f03a624
Renderer: 6a8d5252c2338312322498d91c47d5018b6035eca6eb15bacff4f042909e3b86
Assets:   ba0622457b544f1293ca5dab10ed4864d1e81fa28dd33153932f5790e75eba07
```

The generated gallery is in `artifacts/modular-head-confirmed/`; raw verification
data is in `artifacts/modular-head-confirmed-verification/`. These ignored outputs
can be regenerated using the [documented commands](README.md).

The existing typecheck, all 28 core/server tests, RFC 5869/project-vector oracle,
four new scene/asset tests and repository contract passed locally. The new CI
workflow is configured; hosted CI is distinct from these local results.

## Diagnosed failure

Earlier settings failed pixel equality by as little as one channel value at one
pixel. Removing dithering and changing CPU math/acceleration alone did not fix the
variation. Even a single-thread run could preserve RGBA8 while its geometry and
linear buffers differed, so that run was rejected by the stricter diagnostics.

Per-object geometry comparison isolated the variation to the native UV-sphere
primitives used for landscape props. Vertex positions matched, shading normals
did not. Explicit ordered sphere topology replaced the primitive operator; two
fresh geometry-only processes then matched all 99 evaluated objects. Complete
image regeneration subsequently passed. No assertion was relaxed, pixel patched,
output coarsened or cached portrait substituted to obtain this result.

## Visual assessment and scope

The assembly is coherent and supports actual head turns, separate gaze and hair
crossing a cheek. The imported eye atlas's transparent cornea needed explicit
handling; otherwise the surface appeared as an opaque dark cover.

The result is still visibly computer-generated. Photorealism has **not** passed:
skin detail, adult/age variation, hair grooms, eye/lash anatomy, landscape quality,
garment neckline and sampling grain remain limitations. The current six-key
gallery is not the planned 100-key renderer comparison. No trained generator,
human recognition study or attack-selected valid-key study was performed.

This finite local run establishes reference-machine evidence, not mathematical
proof over every key or conformance on other machines, GPUs, browsers or phones.
The exact-pixel requirement remains a hard gate for further revisions.
