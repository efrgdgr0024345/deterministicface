# Shared AI governance — local boundary

BIGHUB is the ecosystem reference for AI-proposed consequential actions. Canonical reference carried by the existing Matrix project: https://github.com/bighub-io/bighub . This document adapts the existing local Matrix governance contract; it does not claim a newly verified BIGHUB API or deployed integration.

Keep DeterministicFace, Matrix, BIGHUB and PTL as separate repositories, runtimes and normal agent contexts. Do not import the whole BIGHUB implementation. A pure deterministic renderer does not need a governance service call for every image, a chatbot or an LLM.

For consequential **agent** actions use:

```text
owner-authorised objective -> proposed action -> bounded evidence
                         -> explicit decision -> execution or non-execution
```

The local decision vocabulary is `can_run`, `needs_review`, `needs_more_context`, `should_not_run`. These describe recorded authority/state, not fabricated service responses. An alternative action is recorded only when actually proposed and evaluated; do not invent a BIGHUB `better_action` result.

## Standing boundary for this handoff

The owner has authorised preparing project documents and uploading them to this repository following normal setup. Repository reads, a documentation/bootstrap branch, PR, ordinary CI checks, review requests and a bounded implementation task issue fit that scope. Creating this contract does not retrospectively claim external governance approval.

Not authorised by the handoff: spending, changing GitHub visibility or account plan, adding paid services, granting permissions, deploying, deleting/rebuilding droplets, publishing packages or modifying sibling projects. Ordinary local code/tests may proceed under a later authorised task without repeated clarification; higher-impact actions need their own authority.

Preserve uncertainty. Report missing permissions, missing reviewer integration and plan restrictions. Do not fabricate tests, approvals, review outcomes, deployment state or background progress. No missing governance dependency may silently become permission to execute an action that requires it.

The merge gate remains exact-head CI plus substantive review and no unresolved findings, subject to actual repository protections and owner authorisation. No self-approval, bypass, force merge, or treating an eyes reaction as approval. Inability to configure server-side protection is recorded distinctly from voluntary PR discipline.

Use synthetic hashes in tests. Do not send fingerprints, generated user portraits or behavioural inspection data to BIGHUB or any external AI service as default context. Never collect private keys or the human's checkpoint.
