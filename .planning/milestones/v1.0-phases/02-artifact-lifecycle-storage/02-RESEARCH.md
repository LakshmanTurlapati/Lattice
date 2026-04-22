# Phase 2: Artifact Lifecycle & Storage - Research

**Researched:** 2026-04-22
**Domain:** TypeScript artifact data model, metadata, fingerprinting, memory/local filesystem stores, fixture layout, lineage
**Confidence:** HIGH for repo/API/storage patterns; MEDIUM for MIME sniffing depth because Phase 2 should keep parsing lightweight.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Claude's Discretion
### Agent's Discretion
- The planner may choose exact type names, module boundaries, and method names if they preserve the decisions above and keep the public API small.
- The planner may choose whether to expose stores as classes, factory functions, or plain objects, as long as they are easy to test and import from the package.
- The planner may choose the exact JSON envelope layout for local storage, but it should be readable and stable enough for fixture/replay use.
- The planner may choose the hashing implementation details, but the default fingerprint algorithm should be deterministic and standard, preferably SHA-256.

### Deferred Ideas (OUT OF SCOPE)
- S3, SQLite, Postgres, tenant/project-scoped stores, and production storage operations belong to later OPS requirements.
- Provider upload/file ID packaging, provider-ready message parts, URL/base64 transport decisions, and policy enforcement for transport choices belong to Phase 4.
- Actual extraction, chunking, transcription, resizing, and media transcoding implementations belong to later execution/provider phases unless a tiny fixture-only stub is needed for lineage tests.
- Tool execution, MCP integration, and schema-validated tool calls belong to Phase 5.
- Rich video input/output handling remains deferred to v2; Phase 2 may only preserve generic video/file metadata if needed by existing types.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ART-01 | Developer can create text, JSON, file, image, audio, document/PDF, URL, and tool-result artifacts. | Extend the existing `artifact` namespace in `packages/lattice/src/artifacts/artifact.ts`; keep constructors synchronous; add source-specific defaults and tests for each helper. |
| ART-02 | Each artifact has a stable ID, kind, media type, source, size metadata when available, privacy labels, and storage reference. | Add `ArtifactPrivacy`, `ArtifactSize`, `ArtifactFingerprint`, and `ArtifactStorageRef`; default privacy to `standard`; use opaque UUID-based IDs and SHA-256 fingerprints only when payload bytes are available. |
| ART-03 | Lattice records parent/derived artifact lineage for transforms such as extraction, chunking, transcription, resizing, and provider packaging. | Add `ArtifactLineage` with parent refs and a transform descriptor; provide a generic `artifact.derive(...)` or equivalent helper to attach lineage without implementing transforms. |
| ART-04 | Lattice can store artifacts in memory and local filesystem stores for development, testing, and replay fixtures. | Replace/expand `StorageLike` into an artifact-store interface with `put`, `get`, `load`, `has`, `delete`, and `list`; implement `createMemoryArtifactStore` and `createLocalArtifactStore`. |
| ART-05 | Generated outputs, tool results, transcripts, and packaged provider handles are represented as artifacts rather than ad hoc response fields. | Strengthen `ArtifactRef` so `RunSuccess.artifacts` and `output.artifacts()` can carry generated/tool/transcript/provider-handle refs with lineage, privacy, metadata, and storage refs. |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- Build a TypeScript-first SDK for developers in app/product integration ecosystems.
- Keep the public API capability-first and small; the beginner path is one `run` call with artifacts, outputs, and policy.
- Keep v0.1 routing deterministic; Phase 2 must not introduce opaque AI-selected routing.
- Reuse provider infrastructure where useful later, but provider breadth and provider packaging are not Phase 2's differentiation.
- Stay MCP-native for future tools/context integration; do not invent a proprietary plugin protocol.
- Use one umbrella package with modular internals so easy install coexists with tree-shakable adapters and optional bindings.
- Every run must be inspectable; Phase 2 artifact storage and lineage should feed later execution plans and replay.
- Follow stack guidance: Node `>=24`, TypeScript 6, pnpm workspaces, ESM-first exports, tsdown, Vitest, strict type settings, and package-shape checks.
- Existing Phase 1 patterns are named exports, readonly-first types, provider-neutral public contracts, Vitest runtime/type tests, `tsd` package-boundary tests, and no provider SDK type leakage.
- GSD workflow enforcement applies to implementation edits. Use planned phase execution for code changes.

No `CLAUDE.md` file or project-local `.claude/skills` / `.agents/skills` directory exists in this workspace.

## Summary

Phase 2 should turn the existing Phase 1 artifact stubs into boring, provider-neutral data records and stores. The key design is to separate identity, metadata, lineage, and storage references from payload loading: `ArtifactRef` should be cheap and safe to pass through plans/results, while `ArtifactInput` or a loaded artifact record may carry the raw value. This keeps later context packing, provider packaging, replay, and redaction from accidentally moving raw bytes through every subsystem.

Use opaque public artifact IDs generated with `crypto.randomUUID()` and compute SHA-256 fingerprints separately during storage. Constructors should remain synchronous and should only fill cheap metadata: text characters/UTF-8 bytes, JSON serialized bytes when serializable, Blob/File size/type, URL string, caller labels, privacy, and caller metadata. Filesystem reads, hashing, and payload copying belong in the store implementations.

**Primary recommendation:** Implement a small artifact model plus `ArtifactStore` interface first, then add memory and local filesystem stores with inspectable JSON envelopes and separate payload files. Do not implement provider packaging, extraction, transcription, resizing, durable databases, or production object stores in Phase 2; represent those as lineage transform kinds and extension points only.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-ins | Target `>=24`; local `v25.9.0` | IDs, hashing, local filesystem storage, Web primitives | Node provides `Blob`, `File`, `crypto.randomUUID`, WebCrypto, `node:crypto`, and `node:fs/promises`; these cover Phase 2 without adding storage or UUID packages. |
| TypeScript | `6.0.3`, published 2026-04-16 | Source language and public type contract | Existing workspace uses strict TS with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`; new artifact/storage types must preserve that style. |
| `mime` | `4.1.0`, published 2025-09-12 | Extension/path media type lookup | Use for best-effort media type inference from file names/paths. Do not maintain custom MIME tables. |
| Vitest | `4.1.5`, published 2026-04-21 | Runtime and type tests | Existing package tests use Vitest, including typecheck tests; continue for helper/store behavior and source-level type assertions. |
| tsd | `0.33.0`, published 2025-08-05 | Package declaration tests | Required to prove built declarations expose artifact/store APIs through `import { artifact, createMemoryArtifactStore } from "lattice"`. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `file-type` | `22.0.1`, published 2026-04-09 | Magic-number content sniffing | Do not add by default unless the plan explicitly implements byte-level type verification. Use it later rather than hand-rolling signature tables. |
| `@standard-schema/spec` | `1.1.0`, published 2025-12-15 | Existing schema boundary | Keep as-is for output/tool schemas. Phase 2 artifact metadata should stay plain JSON-compatible data, not schema-library instances. |
| `publint` / `@arethetypeswrong/cli` | `0.3.18` / `0.18.2` | Package export verification | Run after exporting new artifact/store factories and types. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `crypto.randomUUID()` | `uuid` package | Extra dependency is unnecessary on Node 24+. Keep deterministic test overrides through `options.id`. |
| Separate SHA-256 fingerprint | Content hash as public artifact ID | Content-addressed IDs leak content equality and change when bytes change. Locked decision requires opaque stable IDs. |
| `mime` path lookup | Tiny custom extension map | Custom maps age poorly and will miss edge cases. Use `mime`, and mark extension-derived media types as best-effort. |
| `file-type` now | Defer content sniffing | Phase 2 only needs cheap metadata. Add `file-type` when byte-level validation is intentionally planned. |
| Local JSON envelopes + payload files | SQLite/Postgres/S3 | Databases and object stores are explicitly deferred. Files are inspectable and adequate for dev/testing/replay fixtures. |
| Provider upload handles as concrete provider objects | Artifact refs with `source: "provider-upload"` and lineage metadata | Real provider upload/file IDs are Phase 4. Phase 2 should only model the ref shape and lineage slot. |

**Installation:**

```bash
pnpm --filter lattice add mime
```

Do not install `file-type` unless a Phase 2 plan explicitly includes content-sniffing tests:

```bash
pnpm --filter lattice add file-type
```

**Version verification:** Current package versions were verified on 2026-04-22 with `npm view <package> version` and `npm view <package> time --json`. Local tool versions: Node `v25.9.0`, pnpm `10.33.1`.

## Architecture Patterns

### Recommended Project Structure

```text
packages/lattice/src/
  artifacts/
    artifact.ts          # public artifact helpers and core artifact types
    metadata.ts          # cheap metadata/media type helpers
    lineage.ts           # transform and lineage types/helpers if artifact.ts grows
  storage/
    storage.ts           # ArtifactStore / StorageLike interface and shared record types
    memory.ts            # createMemoryArtifactStore
    local.ts             # createLocalArtifactStore, Node-only fs implementation
  runtime/
    public-types.ts      # re-export public artifact/storage types
  index.ts               # named public exports and type exports
packages/lattice/test/
  artifacts.test.ts
  artifact-storage.test.ts
  artifact-local-store.test.ts
  public-api.test-d.ts
packages/lattice/test-d/
  package-types.test-d.ts
```

Keep `artifacts/artifact.ts` browser/Web-primitive friendly. Put `node:fs/promises`, `node:crypto`, and path handling in `storage/local.ts`, not in the generic artifact constructors.

### Pattern 1: Ref vs Loaded Payload

**What:** Keep `ArtifactRef` cheap and payload-free; use `ArtifactInput` or `LoadedArtifact` for values.

**When to use:** Any API that returns results, plans, lineage, storage metadata, or citations should use refs. Only store/load APIs and run inputs should carry raw values.

**Example:**

```typescript
export type ArtifactPrivacy = "standard" | "sensitive" | "restricted";

export interface ArtifactSize {
  readonly bytes?: number;
  readonly characters?: number;
  readonly pages?: number;
  readonly width?: number;
  readonly height?: number;
  readonly durationMs?: number;
}

export interface ArtifactFingerprint {
  readonly algorithm: "sha256";
  readonly value: string;
}

export interface ArtifactStorageRef {
  readonly storeId: string;
  readonly key: string;
}

export interface ArtifactRef {
  readonly id: string;
  readonly kind: ArtifactKind;
  readonly mediaType?: string;
  readonly source: ArtifactSource;
  readonly label?: string;
  readonly metadata?: Record<string, unknown>;
  readonly privacy: ArtifactPrivacy;
  readonly size?: ArtifactSize;
  readonly fingerprint?: ArtifactFingerprint;
  readonly storage?: ArtifactStorageRef;
  readonly lineage?: ArtifactLineage;
}

export type ArtifactInput = ArtifactRef & {
  readonly value?: unknown;
};
```

Use `privacy: "standard"` as a concrete default rather than omitting it. Optional privacy fields make later policy checks ambiguous.

### Pattern 2: Synchronous Constructors, Asynchronous Stores

**What:** `artifact.*` functions create data records only. Stores do IO, hashing, and payload persistence.

**When to use:** All public helpers: `artifact.text`, `artifact.json`, `artifact.file`, `artifact.image`, `artifact.audio`, `artifact.document`, `artifact.url`, `artifact.toolResult`.

**Example:**

```typescript
const note = artifact.text("Customer says the item arrived damaged", {
  label: "customer-message",
  privacy: "sensitive",
});

const photo = artifact.image("./fixtures/package.jpg", {
  mediaType: "image/jpeg",
  privacy: "sensitive",
});

const store = createMemoryArtifactStore();
const ref = await store.put(note);
const loaded = await store.load(ref.id);
```

`artifact.file("./path")` may infer a media type from the path extension, but it must not read the path, stat the file, hash bytes, or verify the extension synchronously.

### Pattern 3: Store Interface Separates Manifest Access From Payload Loading

**What:** `get` returns metadata/ref only; `load` returns a value-bearing artifact.

**When to use:** Storage APIs, run-result integration, and later replay/context planning.

**Example:**

```typescript
export interface ArtifactStore {
  readonly kind: "artifact-store";
  readonly id: string;

  put(artifact: ArtifactInput): Promise<ArtifactRef>;
  get(id: string): Promise<ArtifactRef | undefined>;
  load(id: string): Promise<ArtifactInput | undefined>;
  has(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  list(): Promise<readonly ArtifactRef[]>;
}

export type StorageLike = ArtifactStore;
```

Returning `undefined` for misses is fine for `get`, `load`, and `has`; programmer/setup errors such as invalid local store root or unreadable payload files should throw.

### Pattern 4: Inspectable Local Fixture Layout

**What:** Store a manifest envelope separately from payload bytes/values.

**When to use:** `createLocalArtifactStore({ root })`.

**Recommended layout:**

```text
.lattice-artifacts/
  artifacts/
    artifact%3Atext%3Acase-1/
      manifest.json
      payload.txt
    artifact%3Ajson%3Aaction-1/
      manifest.json
      payload.json
    artifact%3Aimage%3Aphoto-1/
      manifest.json
      payload.bin
  index.json
```

`manifest.json` should include a stable schema version, artifact ref, payload descriptor, created timestamp, and serialization format:

```json
{
  "schemaVersion": "lattice.artifact.v1",
  "artifact": {
    "id": "artifact:text:case-1",
    "kind": "text",
    "source": "inline",
    "mediaType": "text/plain",
    "privacy": "sensitive",
    "size": { "bytes": 19, "characters": 19 },
    "fingerprint": {
      "algorithm": "sha256",
      "value": "..."
    }
  },
  "payload": {
    "format": "text",
    "file": "payload.txt"
  },
  "createdAt": "2026-04-22T00:00:00.000Z"
}
```

Use `encodeURIComponent(id)` or another reversible safe encoding for artifact directories. Do not use raw artifact IDs as path segments because the default ID shape contains colons and caller-provided IDs can contain path traversal characters.

### Pattern 5: Lineage As Data, Not Transform Execution

**What:** Represent parent refs and transform descriptors without implementing extraction/transcription/resizing.

**When to use:** Any generated, derived, tool-result, transcript, chunk, extracted text, resized media, or future provider-handle artifact.

**Example:**

```typescript
export type ArtifactTransformKind =
  | "manual"
  | "generated"
  | "tool-result"
  | "extraction"
  | "chunking"
  | "transcription"
  | "resize"
  | "provider-packaging";

export interface ArtifactTransform {
  readonly kind: ArtifactTransformKind;
  readonly name: string;
  readonly version?: string;
  readonly parameters?: Record<string, unknown>;
}

export interface ArtifactLineage {
  readonly parents: readonly ArtifactRef[];
  readonly transform: ArtifactTransform;
}

const transcript = artifact.derive(
  artifact.text("call transcript", {
    label: "transcript",
    source: "generated",
  }),
  {
    parents: [audioRef],
    transform: {
      kind: "transcription",
      name: "fixture-transcript",
    },
  },
);
```

If `artifact.derive` feels too broad, put `lineage` directly in `ArtifactOptions`; keep one generic helper either way.

### Anti-Patterns to Avoid

- **Class-heavy artifact builders:** The locked API is a named `artifact` namespace. Use plain immutable records and functions.
- **Content hash public IDs:** Hashes are useful fingerprints, not user-facing identities.
- **Async artifact helpers:** File IO and hashing in constructors make `artifact.file(...)` surprising and hard to use in browser-compatible code.
- **Raw payload in plans/results:** Plans and `RunSuccess.artifacts` should carry refs, not bytes, transcripts, signed URLs, or provider bodies.
- **Raw artifact IDs as paths:** Use safe encoding before touching the filesystem.
- **Provider-specific fields at the top level:** Put future provider upload handles in metadata/lineage/storage descriptors until Phase 4 defines packaging contracts.
- **SQLite/Postgres/S3 now:** These are explicitly out of scope and would distract from the artifact contract.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique artifact IDs | Custom random/date ID generator as the main path | `crypto.randomUUID()` with caller `id` override | Node provides UUID generation; test determinism comes from explicit IDs. |
| SHA-256 fingerprints | Ad hoc checksum or JSON hash logic | Node `node:crypto` hashing in storage utilities | Standard hashing is needed for fixture verification and dedupe without making IDs content-derived. |
| MIME extension database | Hardcoded extension map | `mime.getType(pathOrExtension)` | MIME mappings change; `mime` is ESM, typed, and dependency-free. |
| Magic-number sniffing | Custom binary signature tables | `file-type` when byte-level sniffing is in scope | File signatures are subtle and numerous; Phase 2 can defer this. |
| Durable production storage | Mini ORM/database abstraction | Memory store plus local filesystem store | Production stores are deferred OPS work. |
| Transform engines | PDF extraction, audio transcription, image resizing, provider uploads | Lineage records and future extension points | Phase 2 needs provenance, not transform execution. |
| JSON canonicalization | Homegrown canonical JSON for semantic dedupe | Hash bytes exactly as stored | Fingerprints should verify stored payload identity, not imply semantic equivalence. |

**Key insight:** The hard part in Phase 2 is drawing the lifecycle boundary correctly. Build an artifact manifest and storage contract that later systems can trust; do not solve media processing or provider packaging early.

## Common Pitfalls

### Pitfall 1: Treating `ArtifactRef` As A Payload

**What goes wrong:** Results, lineage, plans, and future replay files start carrying raw text, binary bytes, transcripts, or provider bodies.

**Why it happens:** The existing Phase 1 `ArtifactInput` is `ArtifactRef & { value?: unknown }`, so it is easy to keep passing value-bearing objects everywhere.

**How to avoid:** Define a payload-free `ArtifactRef` and use `ArtifactInput` / `LoadedArtifact` only at ingestion and store-load boundaries.

**Warning signs:** `RunSuccess.artifacts` snapshots include `value`, local manifests store raw bytes in JSON, or tests assert deep equality on large payloads.

### Pitfall 2: Privacy Defaults Are Ambiguous

**What goes wrong:** Later routing/packaging cannot tell whether missing privacy means "standard" or "forgotten".

**Why it happens:** Optional labels feel convenient in constructors.

**How to avoid:** Materialize `privacy: "standard"` on every artifact and allow stricter caller overrides.

**Warning signs:** Type tests accept refs without privacy, or provider packaging code later needs fallback privacy logic.

### Pitfall 3: Filesystem Layout Is Not Replay-Friendly

**What goes wrong:** Fixture directories contain opaque binary blobs or file names that break across operating systems.

**Why it happens:** Store implementations use raw artifact IDs or content hashes directly as filenames and put all metadata inside binary payloads.

**How to avoid:** Use safe encoded directory names, human-readable `manifest.json`, and separate `payload.*` files.

**Warning signs:** `artifact:text:<uuid>.json` appears as a raw filename, manifests cannot be opened independently, or deleting a payload leaves no useful metadata.

### Pitfall 4: Overclaiming MIME Accuracy

**What goes wrong:** A `.jpg` path is treated as verified image content without inspecting bytes.

**Why it happens:** Extension lookup is mistaken for content sniffing.

**How to avoid:** Store inferred media type and caller-provided media type plainly. If the implementation adds byte sniffing, use `file-type` and test mismatches.

**Warning signs:** Documentation says "validated MIME" while implementation only calls `mime.getType()`.

### Pitfall 5: Lineage Stores Full Parent Payloads

**What goes wrong:** Derived artifacts duplicate raw parent contents and create privacy/replay bloat.

**Why it happens:** Parent artifacts are copied wholesale instead of referenced.

**How to avoid:** Lineage parents should be `ArtifactRef[]`; store payloads once and reload only when asked.

**Warning signs:** A chunk artifact manifest includes the full source PDF/text value.

### Pitfall 6: Local Store Writes Are Not Sequenced

**What goes wrong:** Concurrent writes corrupt manifests or leave payload/manifest pairs out of sync.

**Why it happens:** `writeFile` is used repeatedly for the same path without awaiting prior writes; Node docs call this unsafe.

**How to avoid:** Await each write, write payload before manifest, and keep one artifact directory per ID. For robustness, write temp files then rename if the planner has time.

**Warning signs:** Tests pass sequentially but fail under `Promise.all([...store.put(...)])`.

## Code Examples

Verified patterns from official sources and current repo structure:

### Public Artifact Helpers

```typescript
import { artifact } from "lattice";

const text = artifact.text("support case", {
  id: "artifact:text:case-1",
  label: "case note",
  privacy: "sensitive",
});

const doc = artifact.document("./fixtures/policy.pdf", {
  mediaType: "application/pdf",
  label: "refund policy",
});

const tool = artifact.toolResult(
  { status: "ok", action: "refund" },
  {
    id: "artifact:tool-result:refund-check",
    metadata: {
      toolName: "refundPolicyCheck",
      toolCallId: "call_123",
    },
  },
);
```

### Store Round Trip

```typescript
import { artifact, createMemoryArtifactStore } from "lattice";

const store = createMemoryArtifactStore({ id: "test-memory" });
const original = artifact.json(
  { kind: "refund", reason: "invoice mismatch" },
  { id: "artifact:json:action-1" },
);

const ref = await store.put(original);
const metadataOnly = await store.get(ref.id);
const loaded = await store.load(ref.id);

if (metadataOnly === undefined || loaded === undefined) {
  throw new Error("artifact was not stored");
}
```

### SHA-256 Fingerprint Boundary

```typescript
import { createHash } from "node:crypto";

export function sha256Hex(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}
```

Use this inside storage or serialization helpers, not inside `artifact.*` constructors.

### Local Fixture Store Shape

```typescript
import { artifact, createLocalArtifactStore } from "lattice";

const store = createLocalArtifactStore({
  id: "fixtures",
  root: ".lattice-artifacts",
});

await store.put(
  artifact.text("dense policy excerpt", {
    id: "artifact:text:policy-excerpt",
    privacy: "restricted",
  }),
);
```

The resulting fixture should contain a readable manifest and a separate payload file.

### Lineage For Deferred Transforms

```typescript
const chunk = artifact.derive(
  artifact.text("Section 2. Refunds require invoice validation.", {
    id: "artifact:text:policy-chunk-1",
    label: "policy chunk",
  }),
  {
    parents: [policyDocumentRef],
    transform: {
      kind: "chunking",
      name: "manual-fixture-chunk",
      version: "0",
      parameters: {
        chunkIndex: 0,
      },
    },
  },
);
```

No chunker is required in Phase 2. The requirement is to make the provenance representable.

## State Of The Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SDKs pass provider-specific message parts directly | Provider-neutral artifact refs plus later packaging stages | Project architecture decision, Phase 1/2 | Keeps Lattice's public API independent of OpenAI/AI SDK/LiteLLM payload formats. |
| UUID package for IDs | Native `crypto.randomUUID()` | Modern Node/Web runtimes | Avoids a dependency and keeps IDs opaque. |
| Raw `Buffer` as the public file primitive | Web `Blob`, `File`, `ArrayBuffer`, streams, and URL/path strings | Node 20+ and Node 24 target make Web APIs available | Keeps artifacts closer to browser and provider transport primitives. |
| Extension-only MIME as "truth" | Explicit media type, `Blob.type`/`File.type`, extension lookup, optional future magic sniffing | Current file handling guidance | Prevents overclaiming accuracy while preserving a simple Phase 2 API. |
| One opaque database for all artifacts | Inspectable JSON envelopes plus payload files for local fixtures | Lattice replay/debugging requirement | Developers can inspect fixtures before durable stores exist. |

**Deprecated/outdated:**

- `uuid` as a required dependency for this package: unnecessary for Node `>=24` because `crypto.randomUUID()` exists.
- `Buffer` as a public artifact payload type: keep Buffer as an implementation detail in local store code only.
- SQLite/Postgres/S3 in Phase 2: deferred by user decision.
- PDF/audio/image processing in Phase 2: model lineage now, implement transforms later.

## Open Questions

1. **Should `artifact.json` restrict values to a `JsonValue` type?**
   - What we know: storage needs serializable JSON for fixture stability.
   - What's unclear: changing from Phase 1 `unknown` to `JsonValue` may be slightly stricter.
   - Recommendation: define and export `JsonValue`; type `artifact.json(value: JsonValue, ...)` if tests can be updated cleanly. Otherwise keep `unknown` but make stores reject non-serializable values with a clear error.

2. **Should `file-type` be installed in Phase 2?**
   - What we know: `file-type` is current, ESM, Node `>=22`, and handles magic-number detection.
   - What's unclear: D-11 says avoid heavyweight parsing, and D-12 only requires best-effort inference.
   - Recommendation: do not install it in the default Phase 2 plan. Add it only if the planner wants a specific content-sniffing task and tests.

3. **Should the main package entry export Node-only local store factories?**
   - What we know: the project targets Node `>=24`, and Phase 2 explicitly requires local filesystem stores.
   - What's unclear: future browser/edge builds may want artifact helpers without `node:fs`.
   - Recommendation: export `createLocalArtifactStore` from the main entry for Phase 2, but keep Node imports isolated in `storage/local.ts` so a future subpath split is easy.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Runtime, Web APIs, crypto, filesystem | Yes | `v25.9.0` local; package target `>=24` | None needed |
| pnpm | Workspace installs/tests | Yes | `10.33.1` | npm not recommended for this workspace |
| npm registry access | Version checks and dependency install | Yes | npm CLI available | Use existing catalog/pnpm lock if offline |
| git | Optional research commit | Yes | `/usr/bin/git` available | Skip commit only if commit tool fails |
| Global `Blob` / `File` | Artifact payload primitives | Yes | Functions available in local Node | Use `ArrayBuffer` only if needed |
| `crypto.randomUUID` / `crypto.subtle` | IDs and possible WebCrypto hashing | Yes | Available in local Node | Use `node:crypto` in Node-only storage |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** `mime` is not installed yet; add it with `pnpm --filter lattice add mime` if the plan implements path/extension media type inference. Without it, require explicit `mediaType` for path strings.

## Sources

### Primary (HIGH confidence)

- Local project files: `.planning/phases/02-artifact-lifecycle-storage/02-CONTEXT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/PROJECT.md`, Phase 1 context/verification, and current `packages/lattice/src` / `test` files.
- Node.js Crypto docs: https://nodejs.org/api/crypto.html - verified `crypto.randomUUID()` and `crypto.createHash()` availability and hashing guidance.
- Node.js WebCrypto docs: https://nodejs.org/api/webcrypto.html - verified `subtle.digest()` availability.
- Node.js File System docs: https://nodejs.org/api/fs.html - verified `fsPromises.readFile()`, `writeFile()`, and write sequencing warning.
- Node.js Buffer/Blob docs: https://nodejs.org/api/buffer.html - verified `Blob.size` and `Blob.bytes()`.
- Vitest docs: https://vitest.dev/guide/ - verified current v4.1.5 docs and test/typecheck suitability.

### Secondary (MEDIUM confidence)

- `mime` GitHub README: https://github.com/broofa/mime - verified `mime.getType(pathOrExtension)` behavior.
- `file-type` GitHub README: https://github.com/sindresorhus/file-type - verified `fileTypeFromFile`, `fileTypeFromBuffer`, and magic-number sniffing purpose.
- npm registry via `npm view`: verified `mime@4.1.0`, `file-type@22.0.1`, `vitest@4.1.5`, `tsd@0.33.0`, `typescript@6.0.3`, and `@standard-schema/spec@1.1.0` versions and publish dates.
- tsd README: https://github.com/tsdjs/tsd - package-boundary type testing tool context.

### Tertiary (LOW confidence)

- None used as authoritative input.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - versions were checked against npm and existing workspace config; Node APIs verified in official docs.
- Architecture: HIGH - based on locked Phase 2 decisions, verified Phase 1 public API state, and current source layout.
- Storage layout: MEDIUM-HIGH - local JSON envelope plus payload file is directly aligned with user constraints; exact directory names are planner discretion.
- MIME/content sniffing: MEDIUM - extension lookup is straightforward with `mime`, but byte-level sniffing depth is intentionally deferred unless planned.
- Pitfalls: HIGH - derived from existing Phase 1 stubs, Node filesystem docs, privacy/routing roadmap requirements, and artifact/replay constraints.

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 for package/API/storage guidance; re-check npm versions before implementation if delayed.
