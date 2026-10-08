# Evidence-led roadmap

The owner approved this direction on 2026-09-27. [ADR 0002](adr/0002-comparative-renderers-and-console.md) supersedes the mandatory procedural-only roadmap.

| Stage | Deliverable | Completion gate |
| --- | --- | --- |
| DF-000A | Reconciled foundation and combined loader/project console | Tests, exact-head CI and review; hosting separate |
| DF-001 | Existing digest parser, HKDF and sampling | Fixed vectors and all negative/runtime-isolation tests |
| DF-001B | Actual-key adapter and signed-file demo | Portrait material tied to actual operation key; stale/concurrent-result tests |
| DF-002A | Small procedural face/background candidate | Complete unfiltered sample set, exactness and resource evidence |
| DF-002B | Existing learned face/background candidate | Frozen weights/noise, licence/provenance review, exactness and resource evidence |
| DF-003 | 100-key matched comparison and renderer decision | Documented results; no cherry-picking or silent requirement relaxation |
| DF-004 | Human recognition and budgeted lookalike attacks | Held-out human evidence, valid keys, explicit search budgets and limitations |
| DF-005 | Portable frozen profile/integration | Exact reference pixels on supported targets, preserved old identities |

Later controlled experiments: private checkpoint/scan; CEAL-inspired coding; targeted fine-tuning. None is presumed beneficial. No new infrastructure or training allocation is assumed. Update the embedded milestones in loader.php when evidence changes; do not mark code as merged, deployed or secure because a local test passed.
