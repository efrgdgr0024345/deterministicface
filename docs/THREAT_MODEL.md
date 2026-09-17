# Threat model and permitted claims

Status: experimental hypothesis, not a deployed authentication protocol.

## Assets and trust boundaries

The goal is human recognition of a previously trusted public-key fingerprint. The image is public. Its digest, rules, source code, scan order and candidate landmark positions are also public. A person's chosen checkpoint is undisclosed mental information. It is not included in generation and must not be collected by the ordinary application.

A trusted protocol adapter must supply the digest of the actual public key used and verify possession of its private key. The initial paste-a-hash viewer does neither. A trusted first association/reference is assumed in continuity experiments, not created by an attractive portrait.

## Attacker cases

| Case | Attacker capability | Required response / limit |
| --- | --- | --- |
| Alternative key | Generate many valid key pairs, hash them, render candidate scenes | Measure targeted perceptual confusion of face, entire scene and unknown local checkpoint. No assumed work factor. |
| Arbitrary digest | Search arbitrary 32-byte inputs | Useful preliminary stress test; do not confuse it with valid-key search. |
| Copied image or scan | Supply the genuine image while using a different key | Trusted verifier must generate from the connection's key. A copied remote avatar is not accepted as evidence. |
| Compromised viewer | Modify display, generator, UI or trusted baseline | Outside visual fingerprint protection; needs authenticated software delivery and trusted verification surface. |
| Known checkpoint | Observe selection, pause behaviour, gaze or a disclosed detail | Evaluate separately; secrecy benefit may be reduced/lost. Never claim shoulder-surfing resistance. |
| Version downgrade/drift | Choose another generator version or stale cached portrait | Verifier pins profile/algorithm; validates cache binding; shows version mismatch distinctly. |
| Original private key stolen | Impersonate with the same key | Portrait is unchanged; this mechanism cannot detect that compromise. |
| Legitimate rotation | Real owner changes key | Flag change and use deliberate re-verification, not automatic familiar-image acceptance. |

## What randomness does and does not buy

Take a user's random initial checkpoint as the design premise. The implementation must not secretly choose it from the public hash. Truly uniform private mental selection is not enforced by the app and is a study assumption to report.

An attacker need not discover the exact checkpoint: a candidate can preserve several possible patches. If eligible regions were equally likely and a candidate preserved an accepted subset, conditional success would be that subset's fraction, after conditioning on the other checks. This is explanatory arithmetic, not an estimated attack rate. Perceptual regions and checks may be strongly correlated.

Repeated exposure may help memory or may induce habituation. Treat both as possibilities to investigate. Do not assume all users perform all three checks, remember microscopic pixel structure, or have identical visual abilities.

## Key technical limits

Determinism guarantees repeatability, not an injective hash-to-image map or a collision-free human perceptual space. Full-hash expansion cannot add information absent from its input. A long list of independent-looking parameters does not give a proven number of security bits. Neither the naturalness of the face nor the complexity of the maths proves search resistance.

Test visible content, not embedded hash metadata. Different SVG bytes can rasterize similarly. Changed colour alone may fail on another display or for a user with colour-vision differences. A tiny private patch can be visually ambiguous even when its pixels differ.

Different keys with the same underlying digest necessarily generate the same scene under a fixed profile; the visual layer cannot repair that digest collision. Do not invent a custom cryptographic substitute to address it.

## Permitted claims

After engineering conformance: "The same supported digest and frozen profile reproduce the same canonical scene and SVG."

As product intent: "Designed to make key-fingerprint changes recognisable through a face, a deterministic scene and private local inspection."

Only after suitable studies: report measured confusion/detection rates, search budget, hardware, tested population and confidence intervals. Do not claim "unforgeable", "cannot be bypassed", "256-bit visual security", guaranteed detection, or three independent authentication factors.

## Safe default

With a trusted stored digest, exact mismatch wins. Without one, show unverified status. Without native cryptography or a supported profile, return an explicit error. A failed renderer must not show a generic reassuring face. Keep the original baseline unchanged on failure. Preserve the text fingerprint/reference method as an alternative, not an afterthought.
