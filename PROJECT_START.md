# Project start

Use this existing repository. Read AGENTS.md, docs/adr/0002-comparative-renderers-and-console.md and docs/HANDOFF.md first. The owner approved the comparative-renderer plan and single-file loader on 2026-09-27; earlier procedural-only wording is superseded as specified in ADR 0002.

The generator purpose is human recognition of the actual working public key on an already trusted local system. Same key/profile must regenerate identical full face-and-background pixels. Preserve the existing HKDF vectors. Implement small reviewed tasks, starting with DF-001, then an early real-key adapter/demo and two renderer experiments.

For the owner-facing update/progress page, see docs/CONSOLE.md. The only web source to upload initially is loader.php. Its private configuration and setup code are outside the public document root. No deployed app, renderer or security validation is implied by a functioning console.
