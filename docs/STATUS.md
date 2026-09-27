# Project status

Recorded 2026-09-27. Consult live GitHub for subsequent CI, reviews and merges.

- Repository remains private: efrgdgr0024345/deterministicface.
- Existing DF-000 design PR #1 was open/unmerged at inspection, head 1a173b6b8ca7513d20465011eb7fbc82f937761c. Main still held the starter README.
- The owner approved the revised comparative-renderer direction and combined loader/project console. ADR 0002 records this approval and supersedes the affected earlier design decisions.
- DF-000A is a dependent implementation/documentation change, not a main deployment. It includes loader.php and test tooling. See CONSOLE_TESTS.md for local evidence and limitations.
- DF-001 application primitives, actual-key adapter, both renderers, stable pixel profile and human/security evaluation are not implemented/completed.
- No live hosting, paid service, new droplet, account change, visibility change or sibling-project modification is performed by this task.
- Historic branch-protection/ruleset restrictions from the bootstrap are not silently treated as resolved. Verify current permissions before merge; owner approval of direction is not automatic code-review approval.

Next: complete review of the dependent console/reconciliation change, integrate it into the existing design proposal, and implement the unchanged bounded DF-001 task. Do not bypass review or claim the whole generator is working.
