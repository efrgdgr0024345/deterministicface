"""Offline checks for the documentation handoff, not application acceptance."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    "README.md", "AGENTS.md", "PROJECT_START.md", "docs/SYSTEM_DESIGN.md",
    "docs/GENERATOR_CONTRACT.md", "docs/THREAT_MODEL.md", "docs/ACCEPTANCE_TESTS.md",
    "docs/AI_GOVERNANCE.md", "docs/ROADMAP.md", "docs/HANDOFF.md", "docs/STATUS.md",
    "docs/tasks/DF-001.md", "docs/adr/0001-procedural-client-side-core.md",
    "docs/REFERENCES.md", ".github/pull_request_template.md",
    ".github/ISSUE_TEMPLATE/task.md", ".github/workflows/ci.yml",
    "tools/check_repository.py", "tools/check_vectors.py",
    "tools/test_repository_tools.py", "tests/vectors/derivation.json",
)
LINK = re.compile(r"(?<!!)\[[^\]\n]+\]\(([^\s)]+)\)")
IGNORED_DIRS = {".git", "node_modules", "dist", "coverage", "__pycache__", ".venv"}


def local_link_errors(root: Path, source: Path, text: str) -> list[str]:
    errors = []
    for match in LINK.finditer(text):
        target = match.group(1)
        parts = urlsplit(target)
        if parts.scheme or parts.netloc or not parts.path:
            continue
        resolved = (source.parent / unquote(parts.path)).resolve()
        if not resolved.is_relative_to(root.resolve()):
            errors.append(f"{source.name}: link escapes repository: {target}")
        elif not resolved.exists():
            errors.append(f"{source.name}: missing local link target: {target}")
    return errors


def source_files(root: Path) -> list[Path]:
    # Prefer tracked/untracked non-ignored paths; avoid scanning later dependencies.
    probe = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"], cwd=root,
        capture_output=True, text=True, check=False,
    )
    if probe.returncode == 0 and Path(probe.stdout.strip()).resolve() == root.resolve():
        result = subprocess.run(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
            cwd=root, capture_output=True, check=True,
        )
        return sorted({root / name.decode("utf-8") for name in result.stdout.split(b"\0") if name})
    return sorted(path for path in root.rglob("*")
                  if path.is_file() and not IGNORED_DIRS.intersection(path.relative_to(root).parts))


def check(root: Path) -> list[str]:
    errors = []
    for name in REQUIRED:
        path = root / name
        if not path.is_file() or not path.read_bytes().strip():
            errors.append(f"missing or empty required file: {name}")
    for path in source_files(root):
        if path.suffix not in {".md", ".py", ".json", ".yml"}:
            continue
        try:
            data = path.read_bytes()
            text = data.decode("utf-8")
        except (OSError, UnicodeError) as exc:
            errors.append(f"cannot read {path.name}: {type(exc).__name__}")
            continue
        if not data.endswith(b"\n") or b"\r" in data:
            errors.append(f"{path.name}: require LF and final newline")
        if path.suffix == ".md":
            errors.extend(local_link_errors(root, path, text))
    task = root / "docs/tasks/DF-001.md"
    if task.is_file():
        text = task.read_text(encoding="utf-8")
        for heading in ("## Objective", "## Required behaviour", "## Out of scope", "## Done / stop"):
            if heading not in text:
                errors.append(f"DF-001 missing task heading: {heading}")
    return errors


if __name__ == "__main__":
    problems = check(ROOT)
    if problems:
        raise SystemExit("\n".join(problems))
    print("Repository contract passed: files, text format, local file links, bounded task")
