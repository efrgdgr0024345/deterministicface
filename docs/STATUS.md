# Project status

Bootstrap inspection: 2026-09-18. This file records the baseline; consult live GitHub for later CI, reviews and merges.

| Item | Observed / delivered state |
| --- | --- |
| Repository | Private `efrgdgr0024345/deterministicface` |
| Initial main | `7bcbf23d8e7b4a87f04b57d179312c436f479a6c`; starter README only |
| DF-000 | Design/handoff, vector fixture and repository CI proposed in the bootstrap PR |
| Application / renderer / viewer | Not implemented |
| DF-001 | Bounded next task, starts after bootstrap review |
| Runtime / droplet | None provisioned or changed by this handoff |
| Existing droplets / Matrix | Out of scope and untouched |
| Branch protection | `main` reported unprotected at inspection |
| Rulesets | GitHub returned 403: upgrade to Pro or make repository public to enable feature |
| Protection writes | Not exposed by the connected GitHub actions |
| Automated review | Must verify the new repository's integration; not assumed from Matrix |
| Stable profile / security study | Not completed |

## Operational gate

Keep the repository private. Do not upgrade the plan, modify permissions or change visibility without owner approval. Branch/PR discipline and CI can operate, but are not equivalent to enforced branch protection. Before enabling unattended merges, an authorised administrator must resolve the enforcement gap and verify the reviewer integration. Until then, leave merge decisions explicit and do not self-approve.

## First next action

Review the DF-000 bootstrap. Then assign [DF-001](tasks/DF-001.md) using [handoff](HANDOFF.md). No face generation, new server, authentication claim or background automation is implied by this package.
