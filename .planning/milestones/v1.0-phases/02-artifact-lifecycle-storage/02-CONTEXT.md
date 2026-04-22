# Phase 2: Artifact Lifecycle & Storage - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 turns the Phase 1 artifact stubs into real provider-neutral artifact lifecycle primitives. It should let developers create text, JSON, file, image, audio, document/PDF, URL, and tool-result artifacts; attach stable metadata and privacy labels; store and reload artifacts from memory and local filesystem stores; and preserve lineage for derived/generated artifacts.

This phase should not implement deterministic routing, provider packaging, real provider adapters, context packs, durable sessions, replay envelopes, or a hosted storage/control plane. It should build the artifact and storage data model that later phases use.

</domain>

<decisions>
## Implementation Decisions

### Artifact API Shape
- **D-01:** Keep the public API under the existing named `artifact` namespace rather than introducing a class-heavy builder or separate artifact factory.
- **D-02:** Extend the Phase 1 helpers to cover `artifact.text`, `artifact.json`, `artifact.file`, `artifact.image`, `artifact.audio`, `artifact.document`, `artifact.url`, and `artifact.toolResult`.
- **D-03:** `artifact.document(...)` is the canonical helper for PDFs and other documents; avoid a separate required `artifact.pdf(...)` shortcut in this phase unless the planner finds it trivial as an alias.
- **D-04:** If the existing `video` kind remains in types, treat it as generic file/media metadata only. Do not add video-specific processing, provider support, transcoding, or showcase behavior in Phase 2.
- **D-05:** Artifact helpers should stay synchronous constructors for artifact data. File IO, persistence, hashing, and payload movement belong to storage or lifecycle utilities, not helper construction.
- **D-06:** Tool results should be modeled as artifacts with `source: "tool"` and enough metadata for a future tool-call plan entry, but actual tool execution remains Phase 5 work.

### Identity And Metadata
- **D-07:** Public artifact IDs should be opaque and stable once created, with a default shape like `artifact:<kind>:<uuid>`. Callers may override IDs for deterministic tests and fixtures.
- **D-08:** Do not use content hashes as public IDs by default. Compute a separate `fingerprint`/`contentHash` when content is available so dedupe and fixture checks can work without making the public ID content-derived.
- **D-09:** Align artifact privacy labels with the Phase 1 policy vocabulary: `standard`, `sensitive`, and `restricted`. Default to `standard`; callers must opt into stricter labels.
- **D-10:** Every artifact/ref should carry first-class `kind`, `mediaType`, `source`, optional `label`, optional caller metadata, optional privacy label, optional storage reference, and available size metadata.
- **D-11:** Size metadata should be structured and partial: include fields such as bytes, characters, pages, width/height, and duration when they are cheaply available. Avoid heavyweight parsing just to fill metadata in Phase 2.
- **D-12:** Media type inference should be best-effort and overrideable. Use clear defaults for text and JSON, use file/Blob/path metadata when obvious, and require caller input when ambiguous.

### Storage Surface
- **D-13:** Implement concrete development stores for memory and local filesystem use. Do not add S3, SQLite, Postgres, remote object storage, or multi-tenant production stores in this phase.
- **D-14:** Storage should return reusable `ArtifactRef`s and support reload for development, testing, and replay fixtures. The exact method names are planner discretion, but the core operations should cover put/save, get/load, existence checks, deletion, and listing.
- **D-15:** Local filesystem storage should keep replay-friendly, inspectable files: a metadata envelope plus a payload file/value rather than an opaque binary-only database.
- **D-16:** Stored artifacts should distinguish metadata/ref access from raw payload loading so later phases can avoid accidentally moving large or sensitive payloads.
- **D-17:** The Phase 1 `StorageLike` interface may be replaced or expanded, but the public surface must remain provider-neutral and must not leak Node filesystem types into browser-compatible artifact types unless those APIs are explicitly local-store-specific.

### Lineage Model
- **D-18:** Add explicit lineage to artifact metadata using parent artifact references plus a creation/transform descriptor.
- **D-19:** Lineage should be able to represent extraction, chunking, transcription, resizing, provider packaging, tool results, model outputs, and manual/generated creation, even if most transform implementations are deferred.
- **D-20:** Provide a generic way to create derived/generated artifacts while preserving parent references. Actual extraction, chunking, transcription, resizing, and provider packaging behavior can remain stubs or future integration points.
- **D-21:** Provider packaging handles can be represented as artifact lineage/source metadata for future compatibility, but real provider uploads/file IDs/message part packaging are Phase 4 work.

### Agent's Discretion
- The planner may choose exact type names, module boundaries, and method names if they preserve the decisions above and keep the public API small.
- The planner may choose whether to expose stores as classes, factory functions, or plain objects, as long as they are easy to test and import from the package.
- The planner may choose the exact JSON envelope layout for local storage, but it should be readable and stable enough for fixture/replay use.
- The planner may choose the hashing implementation details, but the default fingerprint algorithm should be deterministic and standard, preferably SHA-256.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project And Scope
- `.planning/PROJECT.md` - Product vision, core value, constraints, and project-level decisions.
- `.planning/ROADMAP.md` - Phase 2 boundary, dependencies, success criteria, and phase ordering.
- `.planning/REQUIREMENTS.md` - Phase 2 requirements: ART-01, ART-02, ART-03, ART-04, ART-05.
- `.planning/STATE.md` - Current project state and prior phase completion state.

### Prior Phase Context
- `.planning/phases/01-runtime-api-output-contracts/01-CONTEXT.md` - Locked Phase 1 API decisions, especially the `artifact` namespace and deferred real artifact lifecycle.
- `.planning/phases/01-runtime-api-output-contracts/01-VERIFICATION.md` - Verified Phase 1 public package/API state and closure of the `ai.session(id)` placeholder.

### Current Code
- `packages/lattice/src/artifacts/artifact.ts` - Existing artifact kinds, sources, helpers, `ArtifactRef`, and `ArtifactInput` stubs.
- `packages/lattice/src/storage/storage.ts` - Phase 1 storage placeholder interface to replace or expand.
- `packages/lattice/src/policy/policy.ts` - Existing privacy/policy vocabulary to align artifact labels with.
- `packages/lattice/src/results/result.ts` - `RunSuccess.artifacts` uses artifact refs; generated outputs should remain artifact-backed.
- `packages/lattice/src/runtime/public-types.ts` - Public type barrel that Phase 2 must update.
- `packages/lattice/src/index.ts` - Named public exports that should remain the package entrypoint.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/lattice/src/artifacts/artifact.ts` already defines `ArtifactKind`, `ArtifactSource`, `ArtifactOptions`, `ArtifactRef`, `ArtifactInput`, and an `artifact` helper namespace.
- `packages/lattice/src/storage/storage.ts` currently has a minimal `StorageLike` placeholder with optional `put` and `get`.
- `packages/lattice/src/policy/policy.ts` already defines policy privacy as `standard | sensitive | restricted`, plus transport-related flags such as `noUpload`, `noPublicUrl`, and `noLogging`.
- `packages/lattice/src/results/result.ts` already returns generated/run artifacts as `readonly ArtifactRef[]`.

### Established Patterns
- Public API is named-export based from `packages/lattice/src/index.ts`.
- Types are strict and readonly-first.
- Runtime tests use Vitest, and package/source type boundary checks use Vitest type tests plus `tsd`.
- Provider SDK types must not leak into public contracts.
- Phase 1 intentionally made artifact helpers lightweight; Phase 2 owns the real lifecycle behavior.

### Integration Points
- Update `artifacts/artifact.ts` or split it into focused artifact modules if it grows too large.
- Expand/replace `storage/storage.ts` with memory and local filesystem stores while preserving provider-neutral public types.
- Update `runtime/public-types.ts` and `index.ts` so new artifact/storage/lineage types are available through `lattice`.
- Add runtime tests for helper construction, metadata, storage round-trips, local fixture layout, and lineage.
- Add type tests proving public package imports can construct, store, reload, and type artifact refs without provider-specific types.

</code_context>

<specifics>
## Specific Ideas

- The API should stay close to:

```ts
import { artifact, createMemoryArtifactStore } from "lattice";

const message = artifact.text("Customer says the item arrived damaged", {
  privacy: "sensitive",
  label: "customer-message",
});

const photo = artifact.image("./fixtures/package.jpg", {
  mediaType: "image/jpeg",
  privacy: "sensitive",
});

const store = createMemoryArtifactStore();
const ref = await store.put(message);
const reloaded = await store.load(ref.id);
```

- Artifacts should feel like boring data objects with explicit refs, metadata, storage, and lineage, not magic provider message parts.
- Local filesystem fixtures should be inspectable enough that a developer can open the stored metadata and understand what was persisted.
- Privacy labels should be present from Phase 2 even though enforcement against provider transport choices happens later.

</specifics>

<deferred>
## Deferred Ideas

- S3, SQLite, Postgres, tenant/project-scoped stores, and production storage operations belong to later OPS requirements.
- Provider upload/file ID packaging, provider-ready message parts, URL/base64 transport decisions, and policy enforcement for transport choices belong to Phase 4.
- Actual extraction, chunking, transcription, resizing, and media transcoding implementations belong to later execution/provider phases unless a tiny fixture-only stub is needed for lineage tests.
- Tool execution, MCP integration, and schema-validated tool calls belong to Phase 5.
- Rich video input/output handling remains deferred to v2; Phase 2 may only preserve generic video/file metadata if needed by existing types.

</deferred>

---

*Phase: 02-artifact-lifecycle-storage*
*Context gathered: 2026-04-22*
