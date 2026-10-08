# Project status — GitHub test demo

Updated 6 October 2026 for PR #4, branch `feat/df-demo-github`.

The owner authorised continuing to a working password-free demo with multiple files. This supersedes the old cPanel-first route for this stage. The old design, loader and vectors remain preserved; loader.php is not executed or served by the new demo.

| Area | State |
| --- | --- |
| Derivation foundation | Implemented against the unchanged HKDF/vector contract; negative, mutation-isolation and sampling tests included |
| Actual-key adapter | Ed25519 verification uses the same public CryptoKey that is exported for portrait derivation |
| First renderer | Implemented procedural illustrated face and background; canonical software RGBA and PNG |
| Browser demo | Implemented new-key, regeneration, one-bit digest comparison, gallery, signature demonstration and self-tests |
| GitHub runtime | Devcontainer and start/update controls provided; actual Codespace creation requires an available authorised tool or owner click |
| Running public endpoint | Not claimed until a real Codespace has been started and its forwarded URL observed |
| Testing | 28 core/server tests passed locally and in the initial GitHub run. Consult exact-head PR checks/comments for browser and subsequent test evidence |
| Review | PR #4 review identified stale input/portrait labelling; the follow-up clears old output and adds a browser regression test. Re-review of the latest head is required |
| Main / dependent PRs | Work remains a dependent PR on the console branch; no merge claimed |
| Learned renderer / human study | Not implemented/performed; the illustrated candidate is not a final renderer decision |
| Legacy loader | Preserved, unserved. PR #3's HTTP credential-form finding remains a separate unresolved issue |

The setup-code/token/password discussion applies to the historical cPanel loader, not this GitHub-only demo. Do not ask the owner to repeat it.

No security certification, platform-wide proof, photorealism, accepted human-recognition result or live user test is implied. See the [demo notes](DEMO.md), [ADR 0003](adr/0003-github-test-demo.md), and [handoff](HANDOFF.md).
