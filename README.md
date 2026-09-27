# DeterministicFace

A recognisable synthetic face **and background** derived from the actual public key a trusted application uses. The same canonical key and frozen specification must independently regenerate identical complete portrait pixels.

## Current authority

The owner approved the comparative-renderer recommendations and a combined project console on 2026-09-27. Read [ADR 0002](docs/adr/0002-comparative-renderers-and-console.md) before older procedural-only documents. It explicitly supersedes the affected earlier decisions; the HKDF contract and vectors remain unchanged.

## What exists

- Design, exact derivation contract/vectors and repository validation scaffolding.
- `loader.php`: a single PHP source combining update controls, embedded scope, milestones, decisions, source credits, deployment identity, logs and rollback.
- Console regression tests and local HTTPS integration tests. See [test evidence](docs/CONSOLE_TESTS.md).

**The portrait generator, actual-key adapter and application are not implemented. No stable portrait profile or perceptual security claim exists.** The console is delivery tooling, not those features.

## Use the console

Read [installation and operation](docs/CONSOLE.md). Upload only `loader.php` to a dedicated project folder. Runtime credentials, configuration, backups and state stay outside the public document root. There is no separate `project.php` or `project_content.json` to maintain.

The normal update channel is `main`. Until the console changes are reviewed and merged, `feat/df-000a-project-console` is an explicitly acknowledged experimental channel. Checking a branch resolves an exact commit; installation downloads that commit, rechecks required CI, and never substitutes a newer moving snapshot.

## Development sequence

1. Review this reconciled foundation and console work.
2. Implement [DF-001](docs/tasks/DF-001.md) unchanged: parser, labelled HKDF derivation and sampling.
3. Add a bounded real-public-key adapter and signed-file demonstration.
4. Compare procedural and existing learned generators on 100 predetermined test keys.
5. Select and harden the renderer using exactness, visual quality, recognition and lookalike evidence.

[System design](docs/SYSTEM_DESIGN.md) · [Roadmap](docs/ROADMAP.md) · [Agent handoff](docs/HANDOFF.md) · [Status](docs/STATUS.md) · [References](docs/REFERENCES.md)

```sh
python3 tools/check_repository.py
python3 -m unittest discover -s tools -p 'test_*.py' -v
python3 tools/check_vectors.py
php -l loader.php
DF_REQUIRE_EXT=1 php tools/test_loader.php
python3 tools/test_loader_http.py
```

The PHP ZIP extension is required for all archive tests; absent-extension skips must not be reported as a full pass. The HTTPS tests use a local ephemeral certificate and fixture credentials only. The production client does not disable TLS certificate verification.
