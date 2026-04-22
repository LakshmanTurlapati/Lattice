---
phase: 02-artifact-lifecycle-storage
plan: 01
subsystem: artifacts
tags: [typescript, artifacts, metadata, lineage, mime, vitest]

requires:
  - phase: 01-runtime-api-output-contracts
    provides: Named lattice exports, Phase 1 artifact stubs, policy privacy vocabulary, and runtime result artifact refs
provides:
  - Synchronous artifact constructors for text, JSON, file, image, audio, document, URL, and tool-result values
  - Artifact identity, privacy, cheap media and size metadata, storage ref, and fingerprint data contracts
  - Payload-free artifact refs plus descriptor-only lineage for derived/generated artifacts
affects: [02-artifact-lifecycle-storage, 03-deterministic-planning-execution-spine, 04-context-sessions-provider-packaging, 05-tools-replay-observability]

tech-stack:
  added: [mime@4.1.0]
  patterns: [synchronous artifact constructors, payload-free refs, descriptor-only lineage, cheap metadata inference]

key-files:
  created:
    - packages/lattice/src/artifacts/metadata.ts
    - packages/lattice/src/artifacts/lineage.ts
    - packages/lattice/test/artifacts.test.ts
  modified:
    - pnpm-workspace.yaml
    - pnpm-lock.yaml
    - packages/lattice/package.json
    - packages/lattice/src/artifacts/artifact.ts

key-decisions:
  - "Artifact constructors stay synchronous and IO-free; file paths are never read or statted during construction."
  - "Path and Blob media inference is best-effort metadata only, with caller overrides preserved."
  - "Lineage stores transform descriptors and payload-free parent refs without implementing provider packaging or media transforms."

patterns-established:
  - "ArtifactRef is the payload-free shape for plans, results, and lineage; ArtifactInput may carry raw value."
  - "Privacy defaults to the Phase 1 policy vocabulary value standard on constructed artifacts."
  - "Derived artifacts use explicit transform descriptors for future extraction, transcription, packaging, tool, and model-output stages."

requirements-completed: [ART-01, ART-02, ART-03, ART-05]

duration: 4min
completed: 2026-04-22
---

# Phase 02 Plan 01: Artifact Constructors, Metadata, and Lineage Summary

**Provider-neutral artifact records with synchronous constructors, cheap metadata defaults, payload-free refs, and descriptor-only lineage.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-22T17:10:49Z
- **Completed:** 2026-04-22T17:14:57Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Added `artifact.text`, `artifact.json`, `artifact.file`, `artifact.image`, `artifact.audio`, `artifact.document`, `artifact.url`, and `artifact.toolResult` with opaque IDs, privacy defaults, media inference, and cheap size metadata.
- Added first-class artifact metadata contracts for privacy, partial size, SHA-256 fingerprint refs, and storage refs without file IO, hashing, uploads, or payload movement.
- Added lineage transform descriptors, derived artifact construction, structural ref detection, and `toArtifactRef` payload stripping.

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Artifact constructor tests** - `237d0c8` (test)
2. **Task 1 GREEN: Artifact constructors and metadata defaults** - `6d55032` (feat)
3. **Task 2 RED: Lineage and ref tests** - `96e58ed` (test)
4. **Task 2 GREEN: Lineage and payload-free refs** - `60c4493` (feat)

_Note: TDD tasks produced separate test and implementation commits._

## Files Created/Modified

- `packages/lattice/src/artifacts/artifact.ts` - Expanded artifact public contract, constructors, `derive`, `toArtifactRef`, and `isArtifactRef`.
- `packages/lattice/src/artifacts/metadata.ts` - Cheap media type and size inference helpers using `mime`, Blob metadata, and `TextEncoder`.
- `packages/lattice/src/artifacts/lineage.ts` - Transform kind union plus lineage, parent ref, and transform descriptor types.
- `packages/lattice/test/artifacts.test.ts` - Runtime coverage for constructors, metadata defaults, lineage, and payload-free refs.
- `packages/lattice/package.json` - Added `mime` dependency through the workspace catalog.
- `pnpm-workspace.yaml` - Added `mime: 4.1.0` to the catalog.
- `pnpm-lock.yaml` - Updated lockfile for `mime`.

## Decisions Made

- Used `ArtifactPrivacy = NonNullable<PolicySpec["privacy"]>` so artifact privacy remains aligned with the Phase 1 policy vocabulary.
- Kept constructor metadata cheap: text/JSON byte and character counts, Blob size/type, and extension/path MIME lookup only.
- Represented future transforms and provider packaging as lineage descriptors only; no deferred transform or upload behavior was implemented.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Linked the new dependency into local node_modules**
- **Found during:** Task 1 (Expand artifact constructors and cheap metadata defaults)
- **Issue:** `pnpm install --lockfile-only` updated the lockfile but did not link the newly declared `mime` dependency locally, so Vitest initially could not resolve `mime`.
- **Fix:** Ran `pnpm install` after the lockfile-only update. This linked `mime` without additional tracked file changes.
- **Files modified:** None beyond the planned dependency declaration and lockfile update.
- **Verification:** `pnpm --filter lattice test -- artifacts.test.ts` and `pnpm --filter lattice typecheck` both passed afterward.
- **Committed in:** `6d55032` (dependency declaration and lockfile)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Local dependency linking was required to verify the planned dependency. No scope was added.

## Issues Encountered

- The first green verification run failed because `mime` was declared but not linked into local `node_modules`; a normal `pnpm install` resolved it.

## Verification

- `pnpm --filter lattice test -- artifacts.test.ts` passed.
- `pnpm --filter lattice typecheck` passed.
- `rg 'from "openai"|from "ai"|@ai-sdk|anthropic|gemini' packages/lattice/src packages/lattice/test` returned no matches.
- Stub scan across touched files found no TODO/FIXME/placeholder or hardcoded empty UI data stubs.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 02 can build memory and local filesystem stores on top of the now-stable distinction between payload-bearing `ArtifactInput` and payload-free `ArtifactRef`. The storage plan can also attach `ArtifactStorageRef` and future fingerprint values without changing constructor semantics.

## Known Stubs

None.

## Self-Check: PASSED

- Created files exist: `metadata.ts`, `lineage.ts`, `artifacts.test.ts`, and `02-01-SUMMARY.md`.
- Task commits exist: `237d0c8`, `6d55032`, `96e58ed`, and `60c4493`.

---
*Phase: 02-artifact-lifecycle-storage*
*Completed: 2026-04-22*
