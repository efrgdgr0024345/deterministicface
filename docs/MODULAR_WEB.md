# Modular portrait web review

The owner requested a working GitHub URL on 13 October 2026 (Australia/Perth).
The [review page](https://efrgdgr0024345.github.io/deterministicface/modular/) is built
from this experimental branch by the existing GitHub Pages workflow. Source, CI,
publication and external review remain separate states; see the workflow's exact
commit and deployment result before assuming the current site includes this page.

Local checks passed: typecheck, 31 core/server/review tests, four modular scene/asset
tests, nine modular browser checks and all existing browser/portable assertions.
The existing Pages endpoint responds over HTTPS. Read-only inspection of the
`github-pages` environment found a single allowed deployment branch, `main`.
Publishing this feature branch requires adding its exact name to that environment's
deployment-branch list; no main merge or permission change has been performed.

## Controls and scope

- Choose any of the first six public test keys to inspect head turns and separate gaze.
- Change magnification between fit, actual pixels, 2× and 4×; scroll within the image.
- Compare another key, or a saved fresh-process same-key CPU output for keys 1 and 2.
- Check all 1,048,576 original RGBA channel bytes and download the canonical PNG.
- Open the existing live generator for a fresh key and illustrated pixel regeneration.

The finite gallery contains visibly computer-generated faces. It is not arbitrary-key
3D rendering in a browser, a photorealism result, another-machine conformance test or
an evaluation of attacker-selected lookalikes. Repeat checks compare saved independent
outputs from the already validated pinned CPU reference. Image files and catalog are
checked on every build; corruption is rejected before a labelled main portrait appears.

No account, token, landmark entry, click marker, analytics or browser storage is
required. Keep any personally remembered face/background intersection private.

## Local validation

```bash
npm run typecheck
npm test
node --test experiments/modular-head/spec.test.mjs
npm start
python3 scripts/browser-modular-test.py http://127.0.0.1:8000
```

The Pages build runs the Node and modular browser checks before deployment, and retains
browser screenshots/test evidence as an Actions artifact. Blender renders do not run
in hosted CI. CPU fixture provenance is recorded in the [catalog](../experiments/modular-head/review/catalog.json)
and [reference results](../experiments/modular-head/RESULTS.md).
