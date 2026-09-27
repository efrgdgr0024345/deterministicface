# Console evidence and limitations

Local execution during the 2026-09-27 task used PHP 8.4.23 and Python 3.13.5. The deployed source targets PHP 8.1+. CI includes the real ZIP extension; skipped archive tests must not be represented as passing.

Executed locally:

- `php -l loader.php`: passed.
- `php -l tools/test_loader.php`: passed.
- `php tools/test_loader.php`: 69 assertions passed; 10 ZIP-specific cases skipped because the local PHP runtime lacks ZipArchive.
- `python3 tools/test_loader_http.py`: 21 HTTPS integration assertions passed with local ephemeral TLS, owner setup, password sign-in, secure cookies, CSRF rejection, private credential placement, redacted report and logout/relogin.

The regression cases cover input/path validation, fixed repository download host policy, preventing credential forwarding, exact-head check evaluation, protected storage, managed-file collision detection, symlink rejection, first installation, removal of obsolete managed files, rollback, injected partial-update failure and restoration, locking and journal guards.

The archive cases require actual ZipArchive: allowlist-only extraction, malformed PHP, traversal, absolute paths, multiple roots, missing loader, hidden web files, case-collision, symlink and expanded-size limit. CI must run these without skips before the console allows that commit to install.

These are tests of loader/project-console mechanics, not tests of the portrait algorithm. No renderer, actual-key adapter, human study, host deployment or independent code review is claimed complete. No private repository token or live cPanel account was used for local tests. Live private-archive downloads and the target host remain integration gates. Check GitHub for the final exact-head CI results rather than inferring them from this document.
