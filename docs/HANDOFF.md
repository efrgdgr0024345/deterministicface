# Agent handoff — start with DF-001

This is the entry point for a smaller coding agent. Do not reconstruct the design from the original chat.

## The non-negotiable idea

The **entire image** is built from a hash using fixed procedural mathematical rules: natural-looking face, deterministic background and their local geometric relationships. No runtime AI image generation, no random background, no lookup of finished portraits. Human checks are face, whole scene, then a privately/randomly selected initial checkpoint shown during a repeatable clockwise scan. The app must not know or collect the checkpoint.

## Start sequence

1. Read [AGENTS.md](../AGENTS.md), [status](STATUS.md), and [DF-001](tasks/DF-001.md).
2. Inspect live repository/PR state. If the bootstrap is still under review, do not assume it is merged. Work from the reviewed baseline once its gate clears, or keep a dependent draft branch explicit. Do not bypass the gate to start.
3. Read only sections 1–4 and 8 of [generator contract](GENERATOR_CONTRACT.md), plus Gate 1 of [acceptance tests](ACCEPTANCE_TESTS.md).
4. Implement DF-001 only. Do not begin the portrait, website, scan or cloud setup.

## Copyable task prompt

> Work only in `efrgdgr0024345/deterministicface`. Follow `AGENTS.md` and inspect current PR/branch state. Implement `docs/tasks/DF-001.md`: strict SHA-256 digest parsing, native Web Crypto HKDF parameter derivation and unbiased bounded integer sampling. Use the exact profile/byte framing and checked-in vectors. Add negative and mutation-isolation tests. Keep core independent of DOM/network/filesystem. Do not change the generator contract, weaken fixtures, build the renderer, add a backend, touch sibling repositories/droplets, or publish/deploy. Use one task branch and PR, execute real checks and request independent review of the exact passing head. Report actual evidence and blockers; do not self-approve or bypass missing protections. Stop after this bounded task's gate.

## Reporting

A useful completion report is: implementation files, requirement IDs, commands actually executed, exact head, CI state, review state, remaining blocker and next task. Do not say "the system is working" when only KDF tests exist. Do not promise background progress from this handoff alone.

## Important known gap

GitHub reports that rulesets for the private repository require an account-plan change or visibility change. Neither is authorised here. Protection and review-service availability must be verified before unattended merging is enabled. The documents can be reviewed and a dependent draft prepared without changing account settings.

## Reading budget

The first task does not require the entire system design or external research papers. Their links exist for resolving specific questions. Matrix/BIGHUB are governance references, not coding dependencies. Each later task must receive an equally bounded task card before implementation begins.
