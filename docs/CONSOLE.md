# Single-file project console: installation and operation

## What was combined

The owner's LearnPiano loader supplied the update-log/preserved-local-files pattern. The owner's Black Cat/PTL project viewer supplied scope, milestones, decisions, history and source-identity presentation. Their existing projects are unchanged.

This implementation combines those roles in **loader.php**, including scope/progress JSON in a delimited source comment. There is no second project.php or separately maintained project_content.json. Server-created secrets, state and backups live outside the public root; they are not extra web source files.

## One-time cPanel setup

1. Upload loader.php into a dedicated project website folder. A suggested location is `/home/learning/easyai.com.au/deterministicface/loader.php`; this is a proposed location, not a claimed live deployment.
2. In cPanel File Manager create `/home/learning/.deterministicface` with permissions `0700`. It must be outside the public document root. The path is the `DF_PRIVATE_ROOT` constant near the top of the PHP file.
3. Create `/home/learning/.deterministicface/setup_code` with permissions `0600`, containing a unique random code of at least 32 characters. A setup code supplied in a separate installation kit must go here, never beside loader.php and never in GitHub. It is consumed after successful setup.
4. Open loader.php over HTTPS. Enter that code, choose an admin password of at least 14 characters, and provide a GitHub fine-grained token restricted to this repository: Contents read, Checks read, Metadata read. The token and password hash are saved privately. No OpenAI key is needed. Do not paste a token into chat or source code.
5. Enable PHP cURL and ZipArchive in cPanel if missing. Source targets PHP 8.1 syntax; actual hosting PHP and extensions require validation on the chosen host.

There is no open first-visitor registration: without the separately provisioned owner code, setup cannot complete. Normal sign-in expires after 30 minutes of inactivity. Failed authentication is rate-limited. Only HTTPS submissions are accepted; proxy headers are not trusted to assert HTTPS. A reverse-proxy host must expose its genuine HTTPS state to PHP.

## Routine updates

Open loader.php, sign in and press **Check GitHub and refresh project status**. Main is the normal branch. Until the dependent console changes reach main, the explicit preview branch is `feat/df-000a-project-console`.

The check resolves one commit and reads the project data from loader.php at that exact commit. The displayed snapshot has its timestamp. It is not silently called live on later visits. The selection expires after ten minutes. On install, required CI checks are checked again for that commit; failed/missing/pending checks prevent installation. Non-main installation additionally needs the experimental acknowledgement. Neither a passing check nor installing a branch means human review or release approval.

The archive download is by **commit SHA**, not a moving branch URL. The loader inside the archive must match the file checked at that commit. Download limits are 32 MiB ZIP, 64 MiB total declared expanded content, 8 MiB per entry, 3,000 entries and 500 deployable files. Links/special files, traversal, ambiguous paths, duplicate destinations and unsupported web files are rejected. PHP payloads receive a parsing check before activation.

## What is installed

- Repository `loader.php` replaces the local loader.
- Repository `web/` is an explicit deployable bundle mapped to local `app/`.
- All other repository contents, including private documentation, workflow files and tests, stay off the public website.

A later browser build must put ready-to-serve assets in web/. This loader does not build TypeScript, install packages, download models or execute shell hooks. Console delivery is distinct from generator delivery.

Unmanaged files are never adopted/overwritten except the initial loader.php itself. Modified or missing previously managed files block the update for investigation. Files removed upstream are removed only when recorded as managed and unchanged locally. Local config/credentials/backups and unrelated files are outside that set.

## Recovery

Backups, the state file, events and a pre-activation journal are stored in an installation-specific subdirectory of the private root. A deployment lock prevents concurrent changes. Files are staged privately and renamed; the loader is replaced last. Ordinary detected activation errors restore the previous state. An interrupted operation leaves a recovery journal and blocks new installations until the owner invokes recovery.

**Multi-file activation is recoverable, not a globally atomic, zero-downtime app deployment.** Do not use it as a production release guarantee. The private directory and public project folder must be on the same filesystem for renames. Backups are retained; monitor available disk space. Do not automatically prune recovery data.

**Roll back last deployment** restores the prior managed files and deployment record. It blocks if managed files have changed locally. Keep an independent original loader.php copy: if a future defective loader cannot execute at all, cPanel File Manager recovery is needed. Backups are keyed by path hashes; rollback.json contains the matching paths and prior checksums.

## Progress and diagnostics

Installed commit, checked GitHub commit, snapshot timestamp, required CI checks and milestone status are different fields. The progress count is completed milestones, not a speculative percentage. Agreed recommendations do not count as completed engineering.

Use **Download diagnostic report** for a JSON report containing deployment state, last checked snapshot and recent events, never the token/password/setup code. It may reveal private project/commit details: share it only with intended reviewers. HTTP errors show status, not response bodies or signed archive URLs.

## Upstream API documentation

- https://docs.github.com/en/rest/repos/contents#download-a-repository-archive-zip
- https://docs.github.com/en/rest/checks/runs#list-check-runs-for-a-git-reference
- https://www.php.net/manual/en/ziparchive.getexternalattributesindex.php

Private archive redirects are followed only to allowlisted HTTPS GitHub download hosts; the API Authorization header is not forwarded. TLS certificate and hostname verification remain enabled.
