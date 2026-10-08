# ADR 0003 — password-free GitHub test demo

Date: 2026-10-06. Status: owner authorised implementation of a working test demo; this does not imply review approval or a merge.

The owner's latest instruction explicitly authorises proceeding through the bounded steps until there is a working demo, with as many files as needed and no application password. GitHub-only development/testing/demo hosting supersedes the cPanel loader route for this stage. Existing servers and private repositories stay unchanged.

This branch implements the first procedural candidate, not the final renderer decision. A self-contained TypeScript software rasterizer constructs canonical RGBA pixels without browser SVG/Canvas rendering differences. This replaces the provisional WASM-renderer implementation idea for this first candidate; it does not weaken the pixel requirement. Fixed test vectors and the HKDF contract remain unchanged. The illustrated face does not claim photorealism or satisfaction of the naturalness/user-recognition gate. The separately approved learned candidate remains future work.

The demo has no login, API-key field, session cookie, database, update endpoint or secret dependency. Its static server does not inherit GitHub tokens and serves an explicit demo allowlist only. The existing PHP loader is not served. Its previously reported HTTP credential-form review finding remains an unresolved legacy issue, not an excuse to expose that loader through this demo.

A Codespace uses the normal GitHub account context to fetch/build the repository. Startup attempts public forwarding of port 8000, consistent with the owner's password-free demo request; it must report failure truthfully. No account-plan, repository-visibility or unrelated-port change is authorised. No attempt is made to keep Codespaces awake or run Actions as permanent hosting.

The new work is a dependent PR based on the unmerged console branch. Tests, review, merge, runtime startup and user testing remain separate states. A Codespace-launch link is not a live demo URL. The user may need to click Create codespace because the current connector has no Codespaces creation action.
