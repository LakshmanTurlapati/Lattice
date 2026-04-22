---
phase: 01-runtime-api-output-contracts
plan: 03
subsystem: runtime-api
tags: [typescript, output-contracts, standard-schema, zod, validation, vitest]

# Dependency graph
requires:
  - phase: 01-runtime-api-output-contracts
    provides: Lattice-owned artifact refs and execution plan stub from Plan 02
provides:
  - Named output contracts for text, Standard Schema, citations, and generated artifact refs
  - InferOutput and InferOutputMap type inference for named output maps
  - Standard Schema validation boundary returning typed RunResult success/failure objects
  - Lattice-owned validation and execution-unavailable error types
  - Runtime tests for text, Zod schema, validation failure, citations, and generated artifact outputs
affects: [runtime-api-output-contracts, deterministic-planning-execution, artifact-lifecycle-storage, context-sessions-provider-packaging]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Standard Schema validation is called through schema["~standard"].validate only
    - Validation failures resolve to ok:false RunResult values with raw and partial outputs
    - Named output maps preserve readonly keys through InferOutputMap

key-files:
  created:
    - packages/lattice/src/outputs/contracts.ts
    - packages/lattice/src/outputs/infer.ts
    - packages/lattice/src/outputs/validate.ts
    - packages/lattice/src/results/errors.ts
    - packages/lattice/src/results/result.ts
    - packages/lattice/test/outputs.test.ts
  modified: []

key-decisions:
  - "Use literal \"text\" for plain text output contracts rather than adding output.text() or a single-output shortcut."
  - "Use Standard Schema as the validation boundary so Zod and compatible validators share one code path."
  - "Return validation failures as RunResult ok:false objects with issue details, raw outputs, partial outputs, and the provided plan."

patterns-established:
  - "Output helpers are reserved for non-text reference contracts such as citations and generated artifacts."
  - "Validation walks output maps in declaration order and returns the first validation failure with successfully validated partial outputs."
  - "Runtime tests import source modules directly until the public package facade is wired in Plan 04."

requirements-completed: [OUT-01, OUT-02, OUT-03, OUT-04]

# Metrics
duration: 5min
completed: 2026-04-22
---

# Phase 01 Plan 03: Output Contracts and Validation Summary

**Named output maps with Standard Schema validation and typed RunResult success/failure unions**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-22T15:49:45Z
- **Completed:** 2026-04-22T15:55:04Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added named output contracts for `"text"`, Standard Schema validators, `output.citations()`, and `output.artifacts()`.
- Added `InferOutput` and `InferOutputMap` so text outputs infer `string`, schema outputs infer validator output types, and reference outputs infer readonly arrays.
- Added `ValidationIssue`, `ValidationError`, `ExecutionUnavailableError`, `RunSuccess`, `RunFailure`, and `RunResult` as Lattice-owned result boundaries.
- Added `validateSchemaOutput` and `validateOutputMap` using `schema["~standard"].validate`, supporting sync and Promise validators without calling Zod `.parse`.
- Added Vitest coverage for text/schema success, missing text failure, invalid schema failure, citations, generated artifact refs, and type inference.

## Task Commits

TDD tasks were committed as RED test commits followed by GREEN implementation commits where implementation was needed:

1. **Task 1 RED: Output inference type tests** - `e229f52` (test)
2. **Task 1 GREEN: Named output contract inference** - `7bfff3e` (feat)
3. **Task 2 RED: Output validation tests** - `12792cd` (test)
4. **Task 2 GREEN: Result and validation boundary** - `dea7756` (feat)
5. **Task 3: Required runtime output scenarios** - `a5aba8f` (test)

## Files Created/Modified

- `packages/lattice/src/outputs/contracts.ts` - Output contract types, citation refs, generated artifact output contracts, and `output` helpers.
- `packages/lattice/src/outputs/infer.ts` - Conditional output and named output map type inference.
- `packages/lattice/src/outputs/validate.ts` - Standard Schema validation helpers and output map validation to `RunResult`.
- `packages/lattice/src/results/errors.ts` - Lattice validation and execution-unavailable error shapes.
- `packages/lattice/src/results/result.ts` - Typed run success/failure union.
- `packages/lattice/test/outputs.test.ts` - Type inference and runtime validation tests.

## Decisions Made

- Kept text output declaration as the literal `"text"` and did not add `output.text()`, `output.json()`, or a single-output shortcut.
- Treated any object with a callable `~standard.validate` member as the schema output contract path, before citation/artifact helper object handling.
- Kept validation focused on contract shape only for citation and artifact arrays; richer citation/artifact element validation belongs to later artifact lifecycle work.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Task 3's added scenarios passed immediately because Task 2 had already implemented the required validation behavior. The tests were still committed as the task's test-only coverage commit.
- The plan-level `.parse(` scan returned no matches, which means `rg` exits with status 1 by design. It was rerun in a no-match-safe form and produced `NO_PARSE_MATCHES`.
- GSD state and roadmap update commands reported success but left visible progress fields stale; corrected `STATE.md` percent/progress metrics and `ROADMAP.md` plan count to match the new summary count.

## Verification

- `pnpm --filter lattice test -- outputs.test.ts`
- `pnpm --filter lattice typecheck`
- `rg '\.parse\(' packages/lattice/src/outputs packages/lattice/test` returned no matches.

## Known Stubs

- `packages/lattice/src/outputs/validate.ts` - Successful validation currently returns `artifacts: []`; generated artifact refs are available inside named outputs, and run-level artifact aggregation is later runtime/execution work.
- `packages/lattice/src/results/result.ts` - Results reference the `ExecutionPlanStub` from Plan 02; real inspectable execution plans are deferred to later planning/execution phases.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

OUT-01 through OUT-04 are ready for Plan 04 to wire the public `createAI` and `ai.run({ task, artifacts, outputs, policy })` facade on top of these output contracts, validation helpers, and result types.

## Self-Check: PASSED

- Verified all created key files exist.
- Verified task commits `e229f52`, `7bfff3e`, `12792cd`, `dea7756`, and `a5aba8f` exist in git history.

---
*Phase: 01-runtime-api-output-contracts*
*Completed: 2026-04-22*
