# Phase 1: Runtime API & Output Contracts - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 1-runtime-api-output-contracts
**Areas discussed:** Beginner API Shape, Runtime Config Surface, Output Contract Style, Result And Errors

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Beginner API Shape | Exact feel of `createAI`, `ai.run`, `artifact`, and `session`; recommended because this becomes the core DX. | yes |
| Runtime Config Surface | What belongs in `createAI(config)` now vs later: providers, storage, policy, tracing. | yes |
| Output Contract Style | Whether outputs use named outputs, boolean modality flags, builder helpers, or another shape. | yes |
| Result And Errors | Whether `run` returns a result union, throws typed errors, exposes validation failures inline, and how multi-output results are structured. | yes |

**User's choice:** all
**Notes:** User selected all gray areas for discussion.

---

## Beginner API Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Named exports | `import { createAI, artifact } from "lattice"` | yes |
| Default factory | `import lattice from "lattice"` | |
| Namespace | `import * as lattice from "lattice"` | |

| Option | Description | Selected |
|--------|-------------|----------|
| One object | `ai.run({ task, artifacts, outputs, policy })` | yes |
| Builder chain | `ai.task(...).with(...).output(...).run()` | |
| Split methods | `ai.text(...)`, `ai.json(...)`, `ai.multimodal(...)` | |

| Option | Description | Selected |
|--------|-------------|----------|
| Stub the helper now | Public `artifact.text(...)`, `artifact.file(...)` types exist; implementation comes Phase 2. | yes |
| Plain typed objects | Keep artifacts as plain typed objects for now. | |
| Hide helpers | Hide artifact helpers until Phase 2. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Type-only placeholder | Expose `session` / `SessionRef` shape but no real session behavior yet. | yes |
| No session API | No session API until Phase 5. | |
| Minimal behavior | Include minimal in-memory session behavior now. | |

**User's choice:** all recommended
**Notes:** User accepted all recommended defaults for beginner API shape.

---

## Runtime Config Surface

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal typed skeleton | `providers`, `storage`, `defaults`, `tracing`, with no real provider/storage execution yet. | yes |
| Providers only | Only `providers` for now. | |
| No config yet | Add config when implementations exist. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Opaque adapter refs | Accept typed `ProviderRef` / `ProviderAdapter` shapes; real adapters come later. | yes |
| Provider names only | Provider names as strings only: `"openai"`, `"anthropic"`. | |
| Full provider SDK config | Include full provider SDK config now. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Runtime defaults plus per-run override | `createAI({ defaults: { policy } })`, then `ai.run({ policy })` can override. | yes |
| Per-run only | Only per-run policy. | |
| Runtime only | Only runtime-level policy. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Interface-only | Define stable `StorageLike` and `TracerLike` types, implementations later. | yes |
| Leave both out | Defer storage/tracing until implementation phases. | |
| In-memory implementations | Include in-memory implementations now. | |

**User's choice:** all recommended
**Notes:** User accepted all recommended defaults for runtime config surface.

---

## Output Contract Style

| Option | Description | Selected |
|--------|-------------|----------|
| Named outputs | `outputs: { answer: "text", action: z.object({ ... }) }` | yes |
| Boolean modality flags | `{ text: true, json: schema }` | |
| Builder helpers | `output.text("answer")` | |

| Option | Description | Selected |
|--------|-------------|----------|
| Zod-first, Standard Schema-compatible | Zod is the documented default; compatible schema libraries can work through Standard Schema. | yes |
| JSON Schema only | Use JSON Schema only. | |
| Zod only | Zod only, no compatibility layer yet. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Keep named shape | Even one output is `outputs: { answer: "text" }`. | yes |
| Shortcut | Allow `output: "text"`. | |
| Separate method | Use `ai.text(...)`. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Type contract only | Define generated artifact refs as output-compatible; implementation later. | yes |
| Defer entirely | Do not represent generated artifact outputs yet. | |
| Working generated artifacts | Include working generated artifacts now. | |

**User's choice:** all recommended
**Notes:** User accepted all recommended defaults for output contract style.

---

## Result And Errors

| Option | Description | Selected |
|--------|-------------|----------|
| Always-resolved result object | Model/validation outcomes return `{ ok: true | false }`. | yes |
| Throw for all failures | Throw for every failure. | |
| Throw otherwise | Return successful outputs only, throw otherwise. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Programmer/environment failures only | Invalid config, missing adapter implementation, aborted signal, store unavailable may throw. | yes |
| Nothing throws | Nothing throws. | |
| Everything exceptional throws | Everything exceptional throws. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Structured failure result | `ok: false`, `error.kind: "validation"`, partial raw output, schema issue details. | yes |
| Throw validation errors | Throw validation errors. | |
| Null output fields | Return `null` output fields. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Outputs plus plan stub | `{ ok: true, outputs, artifacts: {}, plan }` | yes |
| Only outputs | Return only `outputs`. | |
| Data plus metadata | Use `data` plus metadata fields at top level. | |

**User's choice:** all recommended
**Notes:** User accepted all recommended defaults for result and error semantics.

---

## Agent's Discretion

- Exact TypeScript names where not explicitly locked.
- Package scaffold details.
- Test layout.
- Stub implementation details for later-phase systems.

## Deferred Ideas

None.
