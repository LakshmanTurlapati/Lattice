# Phase 2: Artifact Lifecycle & Storage - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 02-artifact-lifecycle-storage
**Areas discussed:** Artifact API Shape, Identity And Metadata, Storage Surface, Lineage Model

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Artifact API Shape | Decide helper names and input shapes for text, JSON, file, image, audio, document/PDF, URL, and tool-result artifacts. | ✓ |
| Identity And Metadata | Decide stable ID strategy, size metadata, MIME/media typing, source labels, privacy labels, and automatic vs caller-provided metadata. | ✓ |
| Storage Surface | Decide memory/local filesystem store behavior, public storage APIs, reload semantics, raw bytes vs references, and test fixture ergonomics. | ✓ |
| Lineage Model | Decide how derived/generated artifacts reference parents for extraction, chunking, transcription, resizing, provider packaging, tool results, and model outputs. | ✓ |

**User's choice:** all recommended
**Notes:** Interpreted as selecting all recommended gray areas and using recommended defaults for each area.

---

## Artifact API Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Extend `artifact` namespace | Keep the small named API and add helpers under the existing namespace. | ✓ |
| Builder/class API | Introduce chainable artifact builders or classes. | |
| Separate factory package | Move artifact creation behind a different module/package surface. | |

**User's choice:** Recommended default.
**Notes:** CONTEXT.md locks the namespace approach and helper set.

---

## Identity And Metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Opaque IDs plus separate fingerprint | Stable public IDs avoid content leakage; deterministic hash/fingerprint supports dedupe and fixtures. | ✓ |
| Content-hash IDs | Deterministic by default, but makes public IDs content-derived and more privacy-sensitive. | |
| Caller-provided IDs only | Maximum control, but poor beginner ergonomics. | |

**User's choice:** Recommended default.
**Notes:** CONTEXT.md locks opaque IDs by default, optional caller IDs, and separate content fingerprinting.

---

## Storage Surface

| Option | Description | Selected |
|--------|-------------|----------|
| Memory and local filesystem stores | Covers development, testing, and replay fixtures without production storage scope. | ✓ |
| Production stores now | Add S3/SQLite/Postgres in this phase. | |
| Metadata-only storage | Avoid payload persistence, but fails the store/reload requirement. | |

**User's choice:** Recommended default.
**Notes:** CONTEXT.md locks memory/local filesystem stores and defers production storage.

---

## Lineage Model

| Option | Description | Selected |
|--------|-------------|----------|
| Parent refs plus transform descriptor | Generic enough for derived/generated artifacts without implementing every transform now. | ✓ |
| Full transform engine now | More complete, but bleeds into later planning/execution/provider phases. | |
| Freeform metadata only | Too weak for replay, debugging, and future provider packaging. | |

**User's choice:** Recommended default.
**Notes:** CONTEXT.md locks explicit lineage metadata with parent refs and transform descriptors.

---

## Agent's Discretion

- Exact type names, module boundaries, store method names, and JSON envelope layout.
- Whether concrete stores are exposed as classes, factory functions, or plain objects.
- Hash implementation details, with SHA-256 preferred.

## Deferred Ideas

- Production storage adapters.
- Provider packaging and transport-policy enforcement.
- Real media/document transforms.
- Tool/MCP execution.
- Rich video handling beyond generic metadata.
