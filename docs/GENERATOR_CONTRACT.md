# Experimental generator contract

Status: normative for DF-001 derivation; scene geometry remains staged under DF-002/003.

## 1. Parsing: DF-IN-001

Input object: `{hashAlgorithm: "sha256", hashHex: string, profile: "df-exp-1"}`. Reject unknown fields and identifiers at the public boundary. No filename, username, public-key text, private key or arbitrary string coercion.

Strip only leading/trailing ASCII space, tab, carriage return and line feed from `hashHex`. The remaining string must be exactly 64 ASCII hex characters `[0-9A-Fa-f]`. Reject internal separators/whitespace, `0x`, `sha256:` prefixes, Unicode lookalikes, other lengths, nulls and non-strings. Upper/lower case are equivalent. Canonical presentation is lowercase; bytes are decoded left-to-right, first hex pair first. Leading zero bytes are significant. Do not parse the whole digest as a JavaScript Number. Do not SHA-256 the hex text again.

A real public-key adapter is a separate contract. This module reads an already supplied digest and makes no claim that it came from a verified key exchange.

## 2. Labelled derivation: DF-KDF-001

Use the platform's standard HKDF with SHA-256, as specified in RFC 5869 and exposed by Web Crypto. The fixed application salt is for public deterministic expansion; it is not secret or per-user. No extra runtime random value is permitted.

Exact bytes:

```text
IKM  = the 32 decoded input bytes
salt = ASCII("deterministicface/df-exp-1/sha256/extract")
info = ASCII("deterministicface/df-exp-1/param/")
       || ASCII(label) || 0x00 || U32BE(index)
OKM  = HKDF-SHA-256(IKM, salt, info, length)
```

`||` means byte concatenation. Literal strings contain no quotes or trailing newline. `0x00` is one zero byte. `index` is an unsigned 32-bit integer, encoded in four bytes, big endian. `length` is an integer byte count from 1 through 8160 inclusive. Web Crypto `deriveBits` receives `length * 8`, not the byte count.

Labels are ASCII, 1–64 characters, matching `[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*`. Reject invalid labels; do not normalise two labels into one. Reject fractional, negative, infinite or boolean indices/lengths. Object index 0 is the default only in an explicitly declared wrapper; the primitive requires an explicit index.

Initial semantic label families: `composition.*`, `face.*`, `hair.*`, `background.*`, and `landmarks.*`. DF-001 implements the generic derivation primitive, not the complete registry. Required test labels are in [vectors](../tests/vectors/derivation.json). A later parameter-table change is versioned, not a reason to silently rewrite these vectors.

The full digest enters every derivation. Labels prevent incidental random-stream consumption changes. They do not add entropy or guarantee perceptual independence. Deriving a longer output preserves its shorter prefix; callers must not treat different lengths under one label/index as independent parameters.

## 3. Bounded integer sampling: DF-KDF-002

`uniformInt(bytes, n)` consumes 4-byte words from the beginning in big-endian order. Input must have a positive length divisible by four. `n` is an integer from 1 through 2^32 inclusive.

```text
limit = floor(2^32 / n) * n
for each 32-bit unsigned word x:
    if x < limit: return x mod n
otherwise: raise SAMPLE_EXHAUSTED
```

Use exact integer arithmetic (BigInt is permitted) for boundaries. No modulo before the rejection test. No last-word fallback. `n = 1` yields zero; `n = 2^32` yields the first word. A parameter draw derives 128 bytes for its own label/index and applies this algorithm; 32 rejected words produce the explicit error. No retry with a random seed.

Inclusive integer ranges `[a,b]` are `a + uniformInt(bytes,b-a+1)`, with validated bounds. Parameter-dependent constraints must declare the dependency and range; no hidden clamp that concentrates many inputs into one common default portrait.

## 4. Proposed API shape

```typescript
type HashInput = {
  hashAlgorithm: "sha256";
  hashHex: string;
  profile: "df-exp-1";
};

parseHash(input: HashInput): Uint8Array; // exactly 32 bytes; copied

deriveBytes(
  digest: Uint8Array, label: string, index: number, length: number
): Promise<Uint8Array>;

uniformInt(bytes: Uint8Array, n: number): number;
```

Runtime validation remains required even when TypeScript types compile. `deriveBytes` validates the exact digest size and snapshots mutable caller buffers before asynchronous work. Return fresh arrays. No DOM import, network, filesystem read, shared mutable PRNG state or input mutation in core functions. Use Node's native Web Crypto for Node tests and the browser's native implementation later. Do not implement a home-grown hash/KDF in application code.

DF-001 error codes: `INVALID_INPUT`, `UNSUPPORTED_HASH`, `UNSUPPORTED_PROFILE`, `INVALID_LABEL`, `INVALID_INDEX`, `INVALID_LENGTH`, `INVALID_RANGE`, `SAMPLE_EXHAUSTED`, `CRYPTO_UNAVAILABLE`. Return/throw a typed error without echoing the full digest in normal error messages. No silent profile fallback.

## 5. Scene representation: DF-DET-002 (DF-002 onward)

Proposed `SceneSpec` fields: `schemaVersion`, `profile`, `hashAlgorithm`, `hashHex`, `canvas`, `composition`, `face`, `background`, `landmarks`, and `primitives`. `schemaVersion` is an explicit integer. The precise nested geometry schema and all numerical parameter ranges are a DF-002 deliverable, not part of DF-001.

Canvas is 1024 by 1024. Coordinates use signed integers representing 1/64 canvas unit (Q6); a full width is 65536. Validate safe integer bounds and intermediate operations. Colours use integer sRGB bytes. No NaN, infinity, platform trigonometry, local time, locale-sensitive formatting, ambient RNG, or unspecified ordering. Tables and constraints must be repository-owned/versioned.

Canonical scene JSON: keys restricted to ASCII, recursively sorted lexicographically; arrays preserve semantic order; integers only for numeric values; lowercase hex colour/digest conventions; booleans/null permitted; compact separators with no whitespace; UTF-8; exactly one trailing LF. String values in the fingerprint schema are restricted to declared ASCII identifiers. Reject unknown fields. Do not call this full RFC 8785 JSON canonicalization: it is a deliberately narrower project format.

## 6. SVG and raster contract: DF-REN-001 (DF-004 onward)

Use a deterministic allowlist of `svg`, `defs`, `linearGradient`, `radialGradient`, `stop`, `g`, `path`, `circle`, `ellipse`, `rect` and `clipPath`. No scripts, event handlers, external URLs, remote fonts, `foreignObject`, embedded image files, filters with unspecified implementations, or inherited page CSS. Geometry and palette originate in the validated scene only.

Stable primitive/attribute ordering and SVG IDs; no timestamps, random IDs or environment metadata. Q6 coordinates serialize by exact division by 64, at most six decimal places, with trailing fractional zeroes and the decimal point removed when unnecessary. Normalize zero, including negative zero, to `0`. Pin gradient units, viewBox, stroke handling, colour interpolation and layer order in DF-004. Use ASCII UTF-8 and one trailing LF.

The byte-level SVG grammar and reference rasterizer must be frozen with golden fixtures in DF-004. Until that occurs, no cross-browser byte-identical PNG claim is permitted. Metadata-only differences never count as visible avalanche.

## 7. Scan contract (DF-005)

Implement `scan-grid-cw-1` exactly as defined in [system design](SYSTEM_DESIGN.md), section 9. Pure timeline input is elapsed **active** milliseconds plus a fixed scan policy. Output is crop rectangle/mode; the schedule must not depend on a secret checkpoint. No checkpoint field is added to `SceneSpec`, requests, storage, telemetry, or exported fingerprints.

Changing scan defaults does not change fingerprint geometry, but needs a new scan-policy identifier and explicit user-visible handling. Do not silently change familiar timing for an enrolled image.

## 8. Conformance vectors

[derivation.json](../tests/vectors/derivation.json) contains project-specific expected output for zero bytes, all-one bytes, sequential bytes, one-bit changes, multiple labels and indices. The fixture is generated from the exact framing above. [check_vectors.py](../tools/check_vectors.py) verifies it against Python standard-library HMAC/SHA-256, including an independent RFC 5869 Appendix A.1 known-answer check.

DF-001 must consume the checked-in expected outputs unchanged using native Web Crypto. Add malformed inputs, test-time injected rejection bytes and mutable-buffer tests. Compare full bytes, not only a prefix printed for convenience. Agreement establishes derivation conformance, not visual distinctiveness or authentication security.
