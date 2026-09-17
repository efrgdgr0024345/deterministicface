# Project start and delivery contract

## Isolated project

Repository: `efrgdgr0024345/deterministicface`. Product: deterministic visual fingerprints. Matrix remains a separate conversational/perception product. BIGHUB is the shared governance reference; PTL remains separate. Do not import their repositories as routine context or share state, secrets, deployment paths, or networks.

## Initial architecture

The proposed application is a TypeScript library, usable in Node and the browser, followed by a small browser UI. Native Web Crypto supplies HKDF-SHA-256. Geometry, scene validation, canonical serialization and SVG emission are pure modules. There is **no required production backend**: rendering can occur locally, and the initial research viewer does not require accounts or a database.

This deliberately reuses the ecosystem's isolation, tests and PR discipline, not Matrix's sensor-oriented service stack. Adding FastAPI, a database, GPU inference or a cloud renderer needs a concrete requirement and ADR.

## What runs now

Only repository checks and a derivation-vector oracle exist. Python 3.12+ standard library is sufficient:

```bash
python3 tools/check_repository.py
python3 -m unittest discover -s tools -p 'test_*.py' -v
python3 tools/check_vectors.py
```

These commands are not application startup commands. DF-001 will introduce Node 24 LTS tooling, an exact pinned TypeScript development dependency, a lockfile, and real build/test commands. Record exact versions when that task executes; do not invent a lockfile or report a missing build as passed.

## GitHub setup

Use `main` as the integration branch. Changes follow `task branch -> PR -> checks -> review -> merge`. Use the included PR and task templates. CI uses read-only contents permission, a pinned checkout action, no secrets, and GitHub-hosted runners. Do not run PR code on any existing droplet or a privileged self-hosted runner.

Desired server-enforced settings, to be enabled by an authorised repository administrator when the account plan permits:

- PR required for `main`, required conversation resolution, and no force pushes/deletion or administrative bypass.
- Required bootstrap check `repository-contract`; add build/type/test jobs as the implementation introduces them. Require genuinely executed successful checks, not deliberately skipped jobs.
- Independent review of the latest substantive head. Do not configure an unavailable reviewer as a fictitious approval mechanism.

At bootstrap inspection, `main` was reported unprotected and the rulesets endpoint returned a plan restriction for this private repository. The connector exposes no branch-protection write operation. This package therefore does not claim those settings are enabled. Do not make the repository public or upgrade the account without owner approval. See [status](docs/STATUS.md) for the handoff gate.

## Development sandbox

Use a disposable local checkout or CI workspace. No host-global package installation. Development tooling stays project-local or in a dedicated container. Ignore generated portraits, downloaded corpora, `.env`, credentials and dependency directories. No secrets are needed for generation. Do not select a software licence for the owner; any later third-party artwork/geometry must have recorded compatible provenance.

## Hosting is deferred, not implicitly authorised

No new droplet is required now. Do not modify `matrix-dev-01`, `ptl-builder-01`, `blackcat-chatbot-01`, or any other existing machine.

If hosting is later approved, prefer serving the static viewer. Any dedicated Linux host must use an explicitly approved supported OS, its own deployment account/path and isolated Compose project, locked images, resource limits, health checks, and restart policies. Only the reverse proxy may publish public service ports. Do not mount the Docker socket into the application, use host networking, privileged containers or sibling volumes. Application dependencies belong inside the container.

A hosted service must survive logout and deliberate reboot without an open shell, `tmux`, `nohup`, or a development server. Ship from a tested immutable commit; verify health and rollback. Explain that containers still depend on the host kernel and Docker service: isolation is not literal independence from all operating-system services. No OS choice, machine creation, credentials or network changes are part of this document handoff.
