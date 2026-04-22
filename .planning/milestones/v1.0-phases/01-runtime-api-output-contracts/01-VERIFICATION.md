---
phase: 01-runtime-api-output-contracts
verified: 2026-04-22T16:18:31Z
status: passed
score: 7/7 must-haves verified
re_verification:
  previous_result: initial verifier found gaps
  previous_score: 5/7
  gaps_closed:
    - "createAI() runtime facade now exposes ai.session(id): SessionRef and returns { id, kind: \"session-ref\" }."
    - "Source and package type tests cover the session placeholder through the public entrypoints."
    - "pnpm --filter lattice typecheck passes after generated packages/lattice/dist is removed."
    - "packages/lattice/tsconfig.json excludes test-d from plain source typecheck; package declaration tests remain under test:types."
  gaps_remaining: []
  regressions: []
---

# Phase 1: Runtime API & Output Contracts Verification Report

**Phase Goal:** Developers can use the small TypeScript-first Lattice API to declare runtime config, tasks, policies, and output contracts without touching provider SDK types.
**Verified:** 2026-04-22T16:18:31Z
**Status:** passed
**Re-verification:** Yes - after gap closure

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Public API exposes named exports for `createAI`, `artifact`, `output`, and runtime/output/policy/session/tracing/storage/provider types. | VERIFIED | `packages/lattice/src/index.ts` exports `createAI`, `artifact`, `output`, `latticeVersion`, `AI`, `RunIntent`, `RunResult`, `SessionRef`, provider/config/policy/storage/tracing/artifact/output types. Built `dist/index.d.ts` exports the same public surface. |
| 2 | `createAI(config)` returns a typed runtime facade with `run()` and Phase 1 `session()` placeholder behavior. | VERIFIED | `packages/lattice/src/runtime/create-ai.ts:24` defines `AI.session(id): SessionRef`; `createAI().session("s1")` returns `{ id: "s1", kind: "session-ref" }`; runtime test covers this behavior. |
| 3 | `ai.run({ task, artifacts, outputs, policy, session })` is a typed skeleton that validates Standard Schema/Zod-compatible contracts and returns structured result objects. | VERIFIED | `RunIntent` includes `task`, `artifacts`, `outputs`, `policy`, `session`, and `signal`; `runWithConfig` builds a provider-neutral request, calls `validateOutputMap`, returns typed `RunResult`, and runtime/type tests cover Zod schema inference and validation failure. |
| 4 | Provider SDK types do not leak through the public API. | VERIFIED | `rg 'from "openai"\|from "ai"\|@ai-sdk\|anthropic\|gemini\|OpenAI\|ChatCompletion\|LanguageModel' packages/lattice/src packages/lattice/dist/index.d.ts packages/lattice/package.json package.json` returned no matches. |
| 5 | Task, policy, artifact, config, provider, storage, tracing, and session types are declared in Lattice-owned domain terms. | VERIFIED | `RunIntent`, `PolicySpec`, `ArtifactInput`, `LatticeConfig`, `ProviderAdapter`, `ProviderRef`, `StorageLike`, `TracerLike`, and `SessionRef` are local interfaces/types. |
| 6 | Runtime and type tests cover output validation and public source/package boundaries. | VERIFIED | `pnpm --filter lattice test` passed 4 files / 17 tests. `pnpm --filter lattice test:types` passed 8 files / 34 type checks plus `tsd`; source and package type tests both use `ai.session()` and `ai.run()` through public exports. |
| 7 | Package verification is repeatable for Phase 1 scope from a clean package state. | VERIFIED | Removed ignored, untracked `packages/lattice/dist`, then `pnpm --filter lattice typecheck` exited 0. Build, type tests, and package lint also passed. |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `package.json` | Root pnpm workspace scripts and Node >=24/TS tooling | VERIFIED | Root workspace metadata enforces pnpm and Node >=24 and exposes recursive build/typecheck/test scripts. |
| `pnpm-workspace.yaml` | Workspace package discovery and catalogs | VERIFIED | Includes `packages/*` and dependency catalog entries for TS, Vitest, tsdown, tsd, Standard Schema, and Zod. |
| `packages/lattice/package.json` | Local package named `lattice` with explicit ESM export map | VERIFIED | Exports `./dist/index.js` and `./dist/index.d.ts`; no provider SDK dependencies; `test:types` remains the package declaration test path. |
| `packages/lattice/tsconfig.json` | Plain source typecheck project | VERIFIED | Includes only `["src", "test"]`, so `test-d` is not part of `pnpm --filter lattice typecheck`. |
| `packages/lattice/src/index.ts` | Small named public API | VERIFIED | Exports `createAI`, `artifact`, `output`, `latticeVersion`, and public type groups. |
| `packages/lattice/src/runtime/create-ai.ts` | Runtime facade with `AI.run` and `AI.session` | VERIFIED | `session(id)` returns `SessionRef`; `run()` validates provider raw outputs and returns `RunResult`. |
| `packages/lattice/src/runtime/public-types.ts` | Public type barrel | VERIFIED | Re-exports runtime/config/provider/policy/artifact/output/result/session/storage/tracing types. |
| `packages/lattice/src/sessions/session.ts` | Session placeholder shape | VERIFIED | Defines `SessionRef` with `id` and optional `kind: "session-ref"`. |
| `packages/lattice/src/providers/provider.ts` | Provider-neutral public provider contracts | VERIFIED | Defines `ProviderRef`, `ProviderAdapter`, `ProviderRunRequest`, and `ProviderRunResponse` without SDK imports. |
| `packages/lattice/src/artifacts/artifact.ts` | Phase 1 artifact helpers | VERIFIED | Provides `artifact.text/json/file/url` helpers without real storage/upload/hash behavior. |
| `packages/lattice/src/outputs/contracts.ts` | Output contract map and helpers | VERIFIED | Provides `"text"`, Standard Schema contract type, `output.citations()`, and `output.artifacts()`. |
| `packages/lattice/src/outputs/infer.ts` | Output type inference | VERIFIED | Maps text to `string`, Standard Schema to inferred output, citations/artifacts to reference arrays. |
| `packages/lattice/src/outputs/validate.ts` | Standard Schema validation boundary | VERIFIED | Uses `schema["~standard"].validate`, not Zod `.parse`, and returns typed validation failures. |
| `packages/lattice/src/results/result.ts` | Run success/failure union | VERIFIED | Defines typed `RunResult<TOutputs>` with success outputs, artifacts, plan, and failure details. |
| `packages/lattice/test/runtime.test.ts` | Runtime behavior tests | VERIFIED | Covers `session()`, fixture adapter success, validation failure, execution unavailable, policy merge, and abort handling. |
| `packages/lattice/test/public-api.test-d.ts` | Source public API type tests | VERIFIED | Imports from `../src/index.js`, exercises `ai.session()`, passes `session` into `ai.run`, and checks typed outputs. |
| `packages/lattice/test-d/package-types.test-d.ts` | Built package declaration tests | VERIFIED | Imports from `"lattice"`, checks `SessionRef`, and validates package-boundary output inference under `test:types`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `packages/lattice/package.json` | `packages/lattice/dist/index.js` / `dist/index.d.ts` | Export map | VERIFIED | Manifest points import/types to built dist files; `pnpm --filter lattice build` produced both. |
| `packages/lattice/tsdown.config.ts` | `packages/lattice/src/index.ts` | Build entry | VERIFIED | `entry: ["src/index.ts"]`; build generated `dist/index.js` and `dist/index.d.ts`. |
| `packages/lattice/src/index.ts` | `packages/lattice/src/runtime/create-ai.ts` | Public named export | VERIFIED | `export { createAI } from "./runtime/create-ai.js";`. |
| `packages/lattice/src/runtime/create-ai.ts` | `packages/lattice/src/sessions/session.ts` | Session placeholder type | VERIFIED | `AI.session(id): SessionRef` returns `{ id, kind: "session-ref" }`. |
| `packages/lattice/test/public-api.test-d.ts` | `packages/lattice/src/index.ts` | Source type boundary | VERIFIED | Type test imports public source API and asserts session/run output types. |
| `packages/lattice/test-d/package-types.test-d.ts` | `packages/lattice/package.json` export map | Built declaration package import | VERIFIED | `tsd` imports from `"lattice"` and passed after build. |
| `packages/lattice/src/runtime/create-ai.ts` | `packages/lattice/src/outputs/validate.ts` | Raw provider output validation | VERIFIED | `runWithConfig` passes `response.rawOutputs` to `validateOutputMap(intent.outputs, ...)`. |
| `packages/lattice/src/runtime/config.ts` | `packages/lattice/src/providers/provider.ts` | Provider registry typing | VERIFIED | Config normalization accepts provider refs/adapters/strings through Lattice-owned contracts. |
| `packages/lattice/src/runtime/config.ts` | `packages/lattice/src/policy/policy.ts` | Defaults policy typing | VERIFIED | Runtime defaults carry `PolicySpec`, merged with per-run policy in `runWithConfig`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| `runtime/create-ai.ts` | `session` | `ai.session(id)` | Yes | FLOWING - returns a concrete `SessionRef`; `RunIntent.session` accepts it and tests pass it into `ai.run`. Phase 1 intentionally has no persistence. |
| `runtime/create-ai.ts` | `request` | `RunIntent` plus normalized config/default policy | Yes | FLOWING - `task`, `artifacts`, output names, merged policy, and signal are passed into `ProviderAdapter.execute`. |
| `runtime/create-ai.ts` | `response.rawOutputs` | Configured executable `ProviderAdapter` | Yes | FLOWING - raw provider outputs feed `validateOutputMap`, then typed success/failure results. |
| `outputs/validate.ts` | `outputs` accumulator | `rawOutputs[name]` plus output contracts | Yes | FLOWING - valid values populate typed outputs; first failure returns `raw`, `partialOutputs`, and validation issues. |
| `artifacts/artifact.ts` | `ArtifactInput.value` | Artifact helper arguments | Yes | FLOWING - helper values are preserved in artifact objects and forwarded to provider requests. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Clean-state source typecheck without generated dist | `rm -rf packages/lattice/dist` then `pnpm --filter lattice typecheck` | Exited 0 | PASS |
| Runtime tests | `pnpm --filter lattice test` | 4 files, 17 tests passed | PASS |
| Build output exists | `pnpm --filter lattice build` | Created `dist/index.js`, map files, `dist/index.d.ts`, and declaration map | PASS |
| Source and package type tests | `pnpm --filter lattice test:types` | 8 files, 34 type checks, no errors; `tsd` exited 0 | PASS |
| Package shape lint | `pnpm --filter lattice lint:packages` | `publint` passed; `attw` exited 0 with expected ignored CJS warning under ESM-only profile | PASS |
| Public built API/session/run behavior | `node --input-type=module -e ...` from `packages/lattice` importing `./dist/index.js` | Named exports were functions, `session` returned `{ id: "s1", kind: "session-ref" }`, valid Zod-backed run returned `ok: true` with typed data and artifact refs | PASS |
| Validation failure result | `node --input-type=module -e ...` with provider raw `{ answer: 42 }` for `"text"` | Returned `{ ok: false, errorKind: "validation", output: "answer", planKind: "plan-stub" }` | PASS |
| Built declaration exposes session | `rg 'session\\(|SessionRef' packages/lattice/dist/index.d.ts` | `AI.session(id): SessionRef` and `RunIntent.session?: SessionRef` found | PASS |
| Provider SDK leak scan | `rg 'from "openai"\|from "ai"\|@ai-sdk\|anthropic\|gemini\|OpenAI\|ChatCompletion\|LanguageModel' ...` | No matches | PASS |
| Shortcut/default export/parse scan | `rg 'output:\|ai\\.run\\(\\{[^}]*output\|export default\|\\.parse\\(' ...` | No matches | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| API-01 | `01-01-PLAN.md` | Developer can install and import a TypeScript-first `lattice` package with a small public API. | SATISFIED | Package metadata/export map/build outputs exist; clean no-dist source typecheck, build, package lint, and package declaration tests pass. |
| API-02 | `01-02-PLAN.md` | Developer can create a runtime with `createAI(config)` using typed provider, storage, policy, and tracing options. | SATISFIED | `LatticeConfig`, `normalizeConfig`, provider/storage/policy/tracing types, and `AI.session()` placeholder are implemented and tested. |
| API-03 | `01-04-PLAN.md` | Developer can call `ai.run({ task, artifacts, outputs, policy })` without selecting a provider-specific API. | SATISFIED | `RunIntent`, `AI.run`, fixture provider request, policy merge, session argument, validation, and execution-unavailable behavior are implemented and tested without provider SDK types. |
| OUT-01 | `01-03-PLAN.md` | Developer can request plain text output. | SATISFIED | `"text"` contract validates string outputs and infers `string`. |
| OUT-02 | `01-03-PLAN.md` | Developer can request structured JSON output using Zod or Standard Schema-compatible validators. | SATISFIED | Zod schemas are accepted through Standard Schema in runtime tests and type tests. |
| OUT-03 | `01-03-PLAN.md` | Lattice validates structured outputs and returns typed success or typed validation failure. | SATISFIED | `validateSchemaOutput` and `validateOutputMap` return `ok: true` or `ok: false` with validation issue details; spot-check confirms text validation failure. |
| OUT-04 | `01-03-PLAN.md` | Lattice can return multiple outputs, including text, typed JSON, citations/artifact refs, and generated artifact refs. | SATISFIED | Runtime and type tests cover named multi-output maps using `"text"`, Zod schema, `output.citations()`, and `output.artifacts()`. |

No orphaned Phase 1 requirements were found in `.planning/REQUIREMENTS.md`.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `packages/lattice/test/runtime-config.test.ts` | 146 | Empty async `put` fixture | Info | Test fixture only; does not affect runtime behavior or public API. |

No blocker or warning anti-patterns were found. Default `{}` parameters, empty accumulator initialization, and optional `undefined` checks are implementation details, not stubs.

### Human Verification Required

None. Phase 1 is package/API/type behavior and was verifiable through source inspection, built declarations, and package commands.

### Gaps Summary

No gaps remain.

The previous `session()` gap is closed: the runtime facade exposes `AI.session(id): SessionRef`, returns a concrete Phase 1 session reference, and both source and package type tests exercise it through the public API. The built declaration also exposes `RunIntent.session?: SessionRef` and `AI.session(id): SessionRef`.

The previous clean-state typecheck gap is closed: `packages/lattice/tsconfig.json` now includes only `src` and `test`, keeping `test-d` out of plain source `tsc`; after deleting ignored `dist`, `pnpm --filter lattice typecheck` passed. Package declaration checks remain under `pnpm --filter lattice test:types`, which passed after build.

---

_Verified: 2026-04-22T16:18:31Z_
_Verifier: Claude (gsd-verifier)_
