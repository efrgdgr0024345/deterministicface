"""Independent specification oracle; not application cryptography."""
from __future__ import annotations

import hashlib
import hmac
import json
from pathlib import Path

SALT = b"deterministicface/df-exp-1/sha256/extract"
PREFIX = b"deterministicface/df-exp-1/param/"
ROOT = Path(__file__).resolve().parents[1]


def hkdf(ikm: bytes, salt: bytes, info: bytes, length: int) -> bytes:
    if type(length) is not int or not 1 <= length <= 8160:
        raise ValueError("invalid HKDF output length")
    prk = hmac.new(salt, ikm, hashlib.sha256).digest()
    block = b""
    result = bytearray()
    for counter in range(1, (length + 31) // 32 + 1):
        block = hmac.new(prk, block + info + bytes([counter]), hashlib.sha256).digest()
        result.extend(block)
    return bytes(result[:length])


def verify_vectors(path: Path) -> int:
    # RFC 5869 Appendix A.1: independent published known answer.
    answer = hkdf(bytes.fromhex("0b" * 22), bytes(range(13)), bytes(range(240, 250)), 42)
    expected = bytes.fromhex(
        "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf"
        "34007208d5b887185865"
    )
    if answer != expected:
        raise ValueError("RFC 5869 known-answer failure")
    document = json.loads(path.read_text(encoding="utf-8"))
    if document["profile"] != "df-exp-1" or document["hashAlgorithm"] != "sha256":
        raise ValueError("unexpected vector profile")
    cases = document["cases"]
    if not isinstance(cases, list) or len(cases) < 8:
        raise ValueError("missing required vector cases")
    ids: set[str] = set()
    for case in cases:
        name = case["id"]
        if name in ids:
            raise ValueError("duplicate vector ID")
        ids.add(name)
        digest = bytes.fromhex(case["hashHex"])
        if len(digest) != 32:
            raise ValueError(f"invalid digest size: {name}")
        info = PREFIX + case["label"].encode("ascii") + b"\0" + case["index"].to_bytes(4, "big")
        actual = hkdf(digest, SALT, info, case["length"])
        if actual.hex() != case["expectedHex"]:
            raise ValueError(f"vector mismatch: {name}")
    return len(cases)


if __name__ == "__main__":
    count = verify_vectors(ROOT / "tests/vectors/derivation.json")
    print(f"RFC 5869 known answer and {count} project derivation vectors passed")
