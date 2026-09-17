"""Regression tests for bootstrap validators; these are not renderer tests."""
from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from check_repository import check, local_link_errors
from check_vectors import ROOT, hkdf, verify_vectors


class RepositoryToolsTests(unittest.TestCase):
    def test_existing_local_link_and_external_url(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "target.md").write_text("# Target\n", encoding="utf-8")
            text = "[target](target.md) [external](https://example.org/absent)"
            self.assertEqual(local_link_errors(root, root / "README.md", text), [])

    def test_missing_local_target_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.assertEqual(len(local_link_errors(root, root / "a.md", "[bad](missing.md)")), 1)

    def test_repository_escape_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.assertEqual(len(local_link_errors(root, root / "a.md", "[bad](../outside.md)")), 1)

    def test_empty_repository_does_not_pass(self):
        with tempfile.TemporaryDirectory() as tmp:
            self.assertTrue(check(Path(tmp)))

    def test_full_project_vectors_pass(self):
        self.assertGreaterEqual(verify_vectors(ROOT / "tests/vectors/derivation.json"), 8)

    def test_wrong_expected_vector_does_not_pass(self):
        data = json.loads((ROOT / "tests/vectors/derivation.json").read_text(encoding="utf-8"))
        data["cases"][0]["expectedHex"] = "00" * data["cases"][0]["length"]
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "bad.json"
            path.write_text(json.dumps(data), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "vector mismatch"):
                verify_vectors(path)

    def test_empty_vector_suite_does_not_pass(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "empty.json"
            path.write_text(json.dumps({"profile": "df-exp-1", "hashAlgorithm": "sha256", "cases": []}))
            with self.assertRaisesRegex(ValueError, "missing required"):
                verify_vectors(path)

    def test_oracle_output_length_boundaries(self):
        for length in (1, 8160):
            self.assertEqual(len(hkdf(b"input", b"salt", b"info", length)), length)
        for length in (0, 8161, True, 1.5):
            with self.assertRaises(ValueError):
                hkdf(b"input", b"salt", b"info", length)


if __name__ == "__main__":
    unittest.main()
