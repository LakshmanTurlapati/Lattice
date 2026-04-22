# Phase 1: Runtime API & Output Contracts - Research

**Researched:** 2026-04-22
**Domain:** TypeScript SDK public API, package scaffolding, output contracts, schema validation, type tests
**Confidence:** HIGH for TypeScript/schema/package patterns; MEDIUM for public npm package naming because `lattice` is already occupied.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Beginner API Shape
- **D-01:** Use named exports as the primary import style: `import { createAI, artifact } from "lattice"`.
- **D-02:** Use one object as the main run shape: `ai.run({ task, artifacts, outputs, policy })`.
- **D-03:** Expose public `artifact.*` helper types in Phase 1, including stubs such as `artifact.text(...)` and `artifact.file(...)`; real artifact lifecycle and storage are Phase 2 work.
- **D-04:** Expose session as a type or placeholder shape only in Phase 1; real session behavior is deferred to the context/session phase.

### Runtime Config Surface
- **D-05:** `createAI(config)` should include a minimal typed skeleton for `providers`, `storage`, `defaults`, and `tracing`.
- **D-06:** Provider configuration should use opaque typed `ProviderRef` / `ProviderAdapter`-style shapes at the public boundary; real adapters and provider execution come later.
- **D-07:** Policy should support runtime defaults through `createAI({ defaults: { policy } })` plus per-run overrides through `ai.run({ policy })`.
- **D-08:** Storage and tracing should be interface-only in Phase 1 through stable `StorageLike` and `TracerLike` types; concrete implementations come later.

### Output Contract Style
- **D-09:** Outputs should use a named output map, for example `outputs: { answer: "text", action: z.object({ ... }) }`.
- **D-10:** Schema support should be Zod-first and Standard Schema-compatible.
- **D-11:** Do not add a single-output shortcut in Phase 1; even one output should use the named output map shape.
- **D-12:** Generated artifact outputs should be represented in the type contract only in Phase 1; implementation is deferred to later artifact/provider phases.

### Result And Errors
- **D-13:** `ai.run(...)` should return an always-resolved result object for model, provider-domain, and validation outcomes: `if (!result.ok) { ... }`.
- **D-14:** Programmer/environment failures may still throw: invalid config, missing adapter implementation, aborted signal, unavailable store, or equivalent setup/runtime failures outside model outcome semantics.
- **D-15:** Validation failures should return a structured failure result with `ok: false`, `error.kind: "validation"`, partial raw output where available, and schema issue details.
- **D-16:** Successful results should include typed outputs plus artifact refs and a plan stub: `{ ok: true, outputs, artifacts, plan }`.

### Claude's Discretion
### Agent's Discretion
- The planner may choose exact TypeScript type names where not locked above, as long as the names remain clear and stable.
- The planner may decide package scaffold details, test file layout, and implementation sequencing inside this phase.
- The planner may keep Phase 1 implementations as non-executing stubs where behavior belongs to later roadmap phases, but those stubs must make downstream phase integration obvious.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within Phase 1 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| API-01 | Developer can install and import a TypeScript-first `lattice` package with a small public API. | Scaffold one ESM-first workspace package named `lattice`, export `createAI`, `artifact`, `output`, and public types from `packages/lattice/src/index.ts`; verify package shape with `tsdown`, `publint`, `attw`, and import tests. |
| API-02 | Developer can create a runtime with `createAI(config)` using typed provider, storage, policy, and tracing options. | Define `LatticeConfig`, `ProviderRef`, `ProviderAdapter`, `StorageLike`, `TracerLike`, `PolicySpec`, and defaults merge behavior without concrete provider/storage/tracing implementations. |
| API-03 | Developer can call `ai.run({ task, artifacts, outputs, policy })` without selecting a provider-specific API. | Define `AI.run<TOutputs>(intent)` over Lattice-owned `RunIntent` and `OutputContractMap` types; keep provider objects opaque and provider SDK types out of public declarations. |
| OUT-01 | Developer can request plain text output. | Support `"text"` in named output maps and infer `string` at `result.outputs[key]` on success. |
| OUT-02 | Developer can request structured JSON output using Zod or another Standard Schema-compatible validator. | Accept `StandardSchemaV1` contracts directly; document Zod 4 as the default because Zod is TypeScript-first, has static inference, and implements Standard Schema. |
| OUT-03 | Lattice validates structured outputs and returns typed success or typed validation failure. | Implement a validation boundary that calls `schema["~standard"].validate`, normalizes issues, and returns `RunResult<TOutputs>` rather than throwing for validation failures. |
| OUT-04 | Lattice can return multiple outputs from one run, including text, typed JSON, citations/artifact references, and generated artifact references. | Use one named output map for all outputs; add Phase 1 type contracts for `output.citations()` and `output.artifacts()` while deferring actual citation/artifact generation to later phases. |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- Build a TypeScript-first SDK for developers in app/product integration ecosystems.
- Keep the public API capability-first and small; beginner path is one `run` call with artifacts, outputs, and policy.
- Keep v0.1 routing deterministic; do not introduce opaque AI-selected routing in Phase 1.
- Reuse provider infrastructure where useful, but provider breadth is not Phase 1's differentiation.
- Stay MCP-native for tools/context integration later; do not invent a proprietary plugin protocol in Phase 1.
- Use one umbrella package with modular internals so easy install coexists with tree-shakable adapters and optional bindings.
- Every run must be inspectable; even Phase 1 stubs need a typed plan stub.
- Follow stack guidance: Node `>=24`, TypeScript 6, pnpm workspaces, ESM-first package exports, tsdown, Vitest, Zod 4, Standard Schema, `publint`, and `@arethetypeswrong/cli`.
- The repository currently has no source files or package scaffold. Phase 1 creates the initial project structure.
- GSD workflow enforcement applies to implementation edits. Use planned phase execution for code changes.

## Summary

Phase 1 should establish Lattice's public contract, not provider behavior. The planner should create a small ESM-first TypeScript package with named exports, a typed `createAI(config)` runtime factory, `artifact.*` stubs, output contract helpers, and a generic `ai.run({ task, artifacts, outputs, policy })` signature. The implementation can be deliberately shallow behind the public facade, but the type surface must be stable enough for later artifact, router, provider, session, tracing, and replay phases.

The output contract strategy should be Zod-first and Standard Schema-native. Accept any `StandardSchemaV1` as an output contract, infer output types through `StandardSchemaV1.InferOutput<T>`, and normalize validation issues into Lattice's own `ValidationIssue` shape. Validation failures must be returned as `ok: false` result objects; programmer/setup failures may throw.

**Primary recommendation:** Build the public API and type inference first, then implement only the minimal validation/finalization path needed to test typed success and validation failure with fixture raw outputs. Do not implement real routing, provider packaging, artifact storage, sessions, tracing, replay, or model calls in Phase 1.

**Important package-name finding:** `npm view lattice` shows `lattice@0.98.0`, described as "JavaScript SDK for all OpenLattice REST APIs", last modified 2022-06-19. Phase 1 may still name the local workspace package `lattice` to satisfy imports and tests, but public npm publishing under the bare `lattice` name requires transfer/ownership or a later explicit naming decision.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | Target `>=24`; official latest LTS page shows v24.15.0, local machine has v25.9.0 | Runtime target | Node 24 is current LTS; Node docs recommend Active/Maintenance LTS for production applications. Use Node Web APIs (`Blob`, `File`, streams, `fetch`) as public artifact primitives. |
| TypeScript | `6.0.3`, npm modified 2026-04-16 | Source language and public type contract | Current stack target; use `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`, and declaration output. |
| pnpm | `10.33.1`, npm modified 2026-04-22; local `10.29.3` | Workspace/package manager | Workspace protocol enforces local package links and clean package boundaries. |
| tsdown | `0.21.9`, npm modified 2026-04-16 | Library bundling and declaration generation | Library-focused bundler powered by Rolldown/Oxc; supports declaration generation and package validation options. |
| Zod | `4.3.6`, npm modified 2026-01-25 | Default documented schema library | Official docs describe Zod as TypeScript-first with static inference, strict TS requirement, built-in JSON Schema conversion, and Zod 4 stable. |
| `@standard-schema/spec` | `1.1.0`, npm modified 2025-12-15 | Schema-library-neutral public contract | Standard Schema defines `~standard.validate`, typed inference, and standardized issues; recent Zod, Valibot, and ArkType implement it. |
| Vitest | `4.1.5`, npm modified 2026-04-21 | Unit and type tests | Supports runtime tests plus `*.test-d.ts` type tests through `--typecheck`, using `expectTypeOf`/`assertType`. |
| tsd | `0.33.0`, npm modified 2025-08-05 | Published declaration/API type tests | Useful after build to test consumer-facing package declarations from `package.json` and `exports`. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@standard-schema/utils` | `0.3.0`, npm modified 2024-11-27 | Helper utilities for Standard Schema | Use only if it removes boilerplate around issue normalization; the spec alone is enough for Phase 1. |
| AJV | `8.18.0`, npm modified 2026-02-20 | JSON Schema validation | Keep internal and optional for later provider/replay JSON Schema compatibility. Do not require it for Phase 1's Standard Schema runtime validation. |
| `@vitest/coverage-v8` | `4.1.5`, npm modified 2026-04-21 | Coverage | Add with Vitest, but do not gate coverage heavily in this first scaffold phase. |
| `publint` | `0.3.18`, npm modified 2026-03-01 | Package publication lint | Run against packed package to catch broken exports and compatibility issues. |
| `@arethetypeswrong/cli` | `0.18.2`, npm modified 2025-06-09 | Package type resolution verification | Run `attw --pack . --profile esm-only` or equivalent for the package. |
| `@changesets/cli` | `2.31.0`, npm modified 2026-04-17 | Versioning/changelog discipline | Scaffold early, but actual release can wait until package name is resolved. |
| fast-check | `4.7.0`, npm modified 2026-04-17 | Property-based tests | Not required in Phase 1 unless planner adds output-map inference invariants; more valuable in router/artifact phases. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Bare public package name `lattice` | Scoped package such as `@lattice-ai/lattice` | The bare npm name is already occupied. Locked Phase 1 imports should remain `from "lattice"` locally, but external publishing needs a decision. |
| Zod-first Standard Schema | Valibot or ArkType as default | Both can work through Standard Schema, but Zod is the documented default and maps best to expected developer ergonomics. |
| Standard Schema validation | Custom schema adapter branches for Zod/Valibot/ArkType | Custom branches create long-term maintenance and type-inference drift. Use the common `~standard` interface. |
| Vitest type tests | Only `tsc --noEmit` | `tsc` catches errors but does not express API inference expectations as clearly as `expectTypeOf`/`assertType`. |
| tsd package tests | Only source-level type tests | Source-level tests can pass while published declaration exports are broken. Use tsd after `tsdown` builds declarations. |
| tsdown | Handwritten `tsc` emit plus custom scripts | `tsc` is enough for typechecking, but tsdown gives library bundling, declaration generation, and package-oriented config with less custom glue. |
| AJV for Phase 1 output validation | Standard Schema `validate` | AJV is useful once provider JSON Schema/replay fixtures enter. Phase 1 should validate user schemas through Standard Schema directly. |

**Installation:**

```bash
pnpm add -w zod @standard-schema/spec
pnpm add -w -D typescript tsdown vitest @vitest/coverage-v8 tsd publint @arethetypeswrong/cli @changesets/cli eslint prettier
```

**Version verification:** Versions above were verified with `npm view <package> version time.modified --json` on 2026-04-22. The public package name check was verified with `npm view lattice name version description time.modified --json`.

## Architecture Patterns

### Recommended Project Structure

```text
package.json
pnpm-workspace.yaml
tsconfig.base.json
packages/
  lattice/
    package.json
    tsconfig.json
    tsdown.config.ts
    src/
      index.ts              # public exports only
      runtime/
        create-ai.ts         # createAI facade and AI runtime object
        config.ts            # LatticeConfig, defaults normalization
      artifacts/
        artifact.ts          # Phase 1 artifact stubs and helpers
      outputs/
        contracts.ts         # output contract types and helpers
        infer.ts             # InferOutputMap<TOutputs>
        validate.ts          # Standard Schema validation boundary
      results/
        result.ts            # RunResult, RunSuccess, RunFailure
        errors.ts            # discriminated Lattice error shapes
      policy/
        policy.ts            # minimal PolicySpec skeleton
      providers/
        provider.ts          # opaque ProviderRef/ProviderAdapter interfaces
      storage/
        storage.ts           # StorageLike interface only
      tracing/
        tracing.ts           # TracerLike interface only
      plan/
        plan.ts              # Phase 1 ExecutionPlan stub shape
    test/
      runtime.test.ts
      outputs.test.ts
      public-api.test-d.ts
    test-d/
      package-types.test-d.ts
```

Keep this as one published package in Phase 1. Do not create adapter packages yet; create internal folders and public subpath placeholders only if the planner needs them for future integration clarity.

### Pattern 1: Public Facade With Narrow Named Exports

**What:** Export only the beginner API and stable public types from `src/index.ts`.

**When to use:** Always for Phase 1. Internal modules may be structured, but consumers should start with `import { createAI, artifact } from "lattice"`.

**Example:**

```typescript
// Source: Node package exports docs and TypeScript module docs.
export { createAI } from "./runtime/create-ai.js";
export { artifact } from "./artifacts/artifact.js";
export { output } from "./outputs/contracts.js";

export type {
  AI,
  LatticeConfig,
  RunIntent,
  RunResult,
  RunSuccess,
  RunFailure,
  PolicySpec,
  ProviderAdapter,
  ProviderRef,
  StorageLike,
  TracerLike,
} from "./runtime/public-types.js";
```

Use explicit `.js` extensions in source imports if the package uses Node-compatible ESM output. Verify with `tsc`, `tsdown`, `publint`, and `attw`.

### Pattern 2: Runtime Factory Owns Config, Not Globals

**What:** `createAI(config)` returns an isolated runtime object with merged defaults.

**When to use:** This is the main API. Avoid global mutable provider/storage/policy configuration.

**Example:**

```typescript
export interface LatticeConfig {
  providers?: ProviderRegistryInput;
  storage?: StorageLike | StorageMode;
  defaults?: {
    policy?: PolicySpec;
  };
  tracing?: TracerLike | false;
}

export interface AI {
  run<const TOutputs extends OutputContractMap>(
    intent: RunIntent<TOutputs>,
  ): Promise<RunResult<TOutputs>>;
}

export function createAI(config: LatticeConfig = {}): AI {
  const normalized = normalizeConfig(config);

  return {
    run(intent) {
      return runWithNormalizedConfig(normalized, intent);
    },
  };
}
```

The planner should make config validation throw for programmer/setup mistakes, but make model/provider/validation outcomes resolve as `RunResult`.

### Pattern 3: Named Output Map Drives Type Inference

**What:** A single output map infers success output shape.

**When to use:** All outputs, including one output. Do not add a single-output shortcut.

**Example:**

```typescript
import type { StandardSchemaV1 } from "@standard-schema/spec";

export type TextOutputContract = "text";

export interface CitationsOutputContract {
  readonly kind: "citations";
}

export interface ArtifactRefsOutputContract {
  readonly kind: "artifacts";
  readonly artifactKind?: string;
}

export type SchemaOutputContract = StandardSchemaV1;

export type OutputContract =
  | TextOutputContract
  | SchemaOutputContract
  | CitationsOutputContract
  | ArtifactRefsOutputContract;

export type OutputContractMap = Record<string, OutputContract>;

export type InferOutput<C> =
  C extends "text" ? string :
  C extends StandardSchemaV1 ? StandardSchemaV1.InferOutput<C> :
  C extends CitationsOutputContract ? CitationRef[] :
  C extends ArtifactRefsOutputContract ? ArtifactRef[] :
  never;

export type InferOutputMap<T extends OutputContractMap> = {
  readonly [K in keyof T]: InferOutput<T[K]>;
};

export const output = {
  citations(): CitationsOutputContract {
    return { kind: "citations" };
  },
  artifacts(options: { artifactKind?: string } = {}): ArtifactRefsOutputContract {
    return { kind: "artifacts", ...options };
  },
} as const;
```

`"text"` remains the small beginner path; `output.citations()` and `output.artifacts()` avoid string literal sprawl for non-text output references.

### Pattern 4: Standard Schema Validation Boundary

**What:** Treat every schema as an unknown validator implementing `StandardSchemaV1`, call `schema["~standard"].validate`, and normalize issues.

**When to use:** In result finalization after a provider/test fixture returns raw output values. Use for Zod and any Standard Schema-compatible validator.

**Example:**

```typescript
import type { StandardSchemaV1 } from "@standard-schema/spec";

export async function validateSchemaOutput<S extends StandardSchemaV1>(
  name: string,
  schema: S,
  value: unknown,
): Promise<
  | { ok: true; value: StandardSchemaV1.InferOutput<S> }
  | { ok: false; issue: ValidationFailureIssue }
> {
  let result = schema["~standard"].validate(value);
  if (result instanceof Promise) result = await result;

  if (result.issues) {
    return {
      ok: false,
      issue: {
        output: name,
        issues: result.issues.map((issue) => ({
          message: issue.message,
          path: issue.path?.map((segment) =>
            typeof segment === "object" && segment !== null && "key" in segment
              ? segment.key
              : segment,
          ),
        })),
      },
    };
  }

  return { ok: true, value: result.value };
}
```

Do not use `schema.parse` directly in the generic boundary. Zod-specific paths are acceptable in docs/examples, not in the core validator.

### Pattern 5: Result Union Is The Public Error Boundary

**What:** `RunResult<TOutputs>` is a discriminated union with `ok`.

**When to use:** All `ai.run` model/provider/validation outcomes. Throw only for programmer/environment failures.

**Example:**

```typescript
export type RunResult<TOutputs extends OutputContractMap> =
  | RunSuccess<TOutputs>
  | RunFailure;

export interface RunSuccess<TOutputs extends OutputContractMap> {
  readonly ok: true;
  readonly outputs: InferOutputMap<TOutputs>;
  readonly artifacts: readonly ArtifactRef[];
  readonly plan: ExecutionPlanStub;
}

export interface RunFailure {
  readonly ok: false;
  readonly error: LatticeRunError;
  readonly raw?: unknown;
  readonly partialOutputs?: Record<string, unknown>;
  readonly plan: ExecutionPlanStub;
}

export type LatticeRunError =
  | {
      readonly kind: "validation";
      readonly message: string;
      readonly output?: string;
      readonly issues: readonly ValidationIssue[];
    }
  | {
      readonly kind: "execution_unavailable";
      readonly message: string;
    };
```

Add future error kinds only as stubs if needed, and mark them as not produced until later phases.

### Pattern 6: Phase-Aware Stubs, Not Fake Completeness

**What:** Define stable shapes for later systems but make behavior explicit.

**When to use:** Provider refs, storage, tracing, sessions, generated artifacts, citations, and plan details.

**Recommended stubs:**

```typescript
export interface ProviderRef {
  readonly id: string;
  readonly kind?: "provider-ref";
}

export interface ProviderAdapter {
  readonly id: string;
  readonly kind: "provider-adapter";
  readonly execute?: (request: ProviderRunRequest) => Promise<ProviderRunResponse>;
}

export interface StorageLike {
  readonly kind: "storage";
}

export interface TracerLike {
  readonly kind: "tracer";
}

export interface SessionRef {
  readonly id: string;
}
```

For `ai.run`, allow a test/fixture adapter to return normalized raw outputs so output validation can be tested. If no executable adapter exists, return `ok: false` with `error.kind: "execution_unavailable"` or throw only if config is invalid.

### Anti-Patterns to Avoid

- **Provider type leakage:** Public types must not import `openai`, `ai`, `@ai-sdk/provider`, Anthropic, Gemini, or provider message types.
- **Single-output shortcut:** Do not add `ai.run({ output: schema })` or `outputs: z.object(...)` in Phase 1.
- **Boolean output flags:** Avoid `text: true` or `json: true`; use named output contracts so inference has stable keys.
- **Validation throws:** Schema mismatches must return `ok: false`, not throw.
- **Pretend artifacts work:** `artifact.file(...)` can create typed stubs, but must not imply storage, hashing, MIME sniffing, upload, or lineage exists yet.
- **Fake routing:** Do not create route scoring, capability catalogs, no-route plans, fallback chains, or provider packaging in Phase 1.
- **Global defaults:** Avoid module-level mutable provider/policy state. Runtime defaults belong to the `createAI` instance.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema-library neutrality | Custom `isZod`, `isValibot`, `isArkType` branches | Standard Schema `StandardSchemaV1` | One `~standard.validate` path gives runtime validation, type inference, and standardized issues. |
| Default schema authoring | Custom validator DSL | Zod 4 | Zod is TypeScript-first, has strong inference, strict TS guidance, Standard Schema support, and built-in JSON Schema conversion. |
| Type assertion testing | Bespoke conditional type harness | Vitest `expectTypeOf`/`assertType` and `*.test-d.ts`; optionally tsd after build | Type tests must fail clearly when inference regresses. |
| Package build scripts | Custom Rollup/Oxc/tsc script stack | tsdown plus `tsc --noEmit` | Less glue and better library defaults. |
| Package export validation | Manual import smoke checks only | `publint` and `attw` | Catch broken `exports`, declaration, and resolver edge cases before publishing. |
| Provider execution simulation | Real provider SDK calls | Minimal fixture adapter returning normalized raw outputs | Phase 1 must prove public boundaries without network/provider dependencies. |
| Artifact lifecycle | Hashing, storage, upload, MIME sniffing | Typed stubs only | Lifecycle, storage, and metadata belong to Phase 2. |
| Error taxonomy | Provider-specific error classes | Lattice discriminated unions | Public API should stay provider-neutral and exhaustively matchable. |

**Key insight:** The hard part in Phase 1 is not runtime behavior. It is preserving a small public API while making the type contract strong enough that later provider, artifact, and routing work cannot leak through or force a breaking redesign.

## Common Pitfalls

### Pitfall 1: The `lattice` npm Name Is Already Occupied

**What goes wrong:** The planner scaffolds a package named `lattice` and later assumes it can be published publicly.

**Why it happens:** The phase success criteria say install/import `lattice`, but the npm registry already has `lattice@0.98.0` for OpenLattice REST APIs.

**How to avoid:** Use `"name": "lattice"` locally only if the goal is workspace import tests. Add a planning note that public npm publishing needs name ownership/transfer or a scoped package decision. Do not silently switch imports away from `from "lattice"` in Phase 1 because that contradicts locked decisions.

**Warning signs:** Release scripts or Changesets config assume `pnpm publish` can publish the bare name.

### Pitfall 2: Public API Accidentally Imports Provider SDK Types

**What goes wrong:** `LatticeConfig` or `ProviderAdapter` exposes `OpenAI`, AI SDK `LanguageModel`, provider message parts, or provider-specific options.

**Why it happens:** Provider SDKs are convenient during early tests.

**How to avoid:** Keep provider inputs opaque: `ProviderRef`, `ProviderAdapter`, `ProviderRegistryInput`. If a fixture adapter is needed for tests, it returns Lattice-owned raw output maps only.

**Warning signs:** `packages/lattice/src/index.ts` or generated `.d.ts` contains imports from `openai`, `ai`, `@ai-sdk/*`, or provider packages.

### Pitfall 3: Output Contracts Become Text Plus Optional JSON

**What goes wrong:** The result becomes `{ text, json }`, making multiple outputs, citations, and generated artifacts hard to add.

**Why it happens:** The first tests naturally focus on a single answer string and one structured object.

**How to avoid:** Force every run to use a named output map. Define type contracts for text, schema outputs, citations, and artifact refs now, even if generated citations/artifacts are only stubs.

**Warning signs:** `result.text`, `result.data`, or `output` singular appears in the public API.

### Pitfall 4: Validation Failures Throw

**What goes wrong:** App code must wrap normal model/schema mismatch behavior in `try/catch`, contradicting the locked always-resolved result design.

**Why it happens:** Zod's `parse` throws and is familiar.

**How to avoid:** Use Standard Schema `validate` or Zod `safeParse` only behind adapters, normalize issues, and return `ok: false` with `error.kind: "validation"`.

**Warning signs:** Tests expect `await expect(ai.run(...)).rejects.toThrow()` for invalid model outputs.

### Pitfall 5: Standard Schema Async Validation Is Ignored

**What goes wrong:** The validator works for synchronous Zod schemas but fails or mis-types libraries that return promises.

**Why it happens:** Examples often show synchronous validation.

**How to avoid:** Treat `schema["~standard"].validate(value)` as `Result | Promise<Result>` and always await if needed.

**Warning signs:** Validation code assumes `result.issues` exists immediately without promise handling.

### Pitfall 6: Zod JSON Schema Conversion Is Over-Promised

**What goes wrong:** Planner requires every Zod output schema to convert cleanly to provider JSON Schema in Phase 1.

**Why it happens:** Zod 4 has `z.toJSONSchema()`, but provider schema constraints and unrepresentable Zod types are later concerns.

**How to avoid:** In Phase 1, validate actual outputs through Standard Schema. Store room for future schema descriptors. Do not require provider-compatible JSON Schema conversion yet.

**Warning signs:** Phase 1 rejects `z.transform`, `z.date`, or other schemas for provider compatibility even though no provider call exists yet.

### Pitfall 7: Stubs Pretend Later Systems Work

**What goes wrong:** `artifact.file`, `storage: "memory"`, `tracing`, `session`, and generated artifact refs appear functional without backing behavior.

**Why it happens:** Ergonomic examples can hide missing implementation.

**How to avoid:** Name Phase 1 types honestly and document returned plan stubs. Where behavior is absent, return `execution_unavailable` or expose placeholder references without side effects.

**Warning signs:** Files are read, hashed, uploaded, traced, persisted, or session-mutated in Phase 1.

## Code Examples

Verified patterns from official sources and local requirements.

### Consumer API Contract

```typescript
import { artifact, createAI, output } from "lattice";
import { z } from "zod";

const ai = createAI({
  providers: [{ id: "fixture", kind: "provider-ref" }],
  defaults: {
    policy: {
      latency: "interactive",
      privacy: "standard",
    },
  },
});

const actionSchema = z.object({
  kind: z.enum(["refund", "replace", "escalate", "clarify"]),
  reason: z.string(),
});

const result = await ai.run({
  task: "Resolve this support case.",
  artifacts: [artifact.text("The shipment photo does not match the invoice.")],
  outputs: {
    answer: "text",
    action: actionSchema,
    evidence: output.citations(),
    generated: output.artifacts(),
  },
  policy: { maxCostUsd: 0.25 },
});

if (result.ok) {
  result.outputs.answer.toUpperCase();
  result.outputs.action.kind;
  result.outputs.evidence;
  result.outputs.generated;
} else if (result.error.kind === "validation") {
  result.error.issues;
}
```

### Type Inference Test

```typescript
// Source: Vitest type-testing docs.
import { assertType, expectTypeOf, test } from "vitest";
import { artifact, createAI, output, type RunResult } from "lattice";
import { z } from "zod";

test("run infers named output map", async () => {
  const ai = createAI();
  const schema = z.object({ count: z.number() });

  const result = await ai.run({
    task: "Count cases.",
    artifacts: [artifact.text("one two")],
    outputs: {
      answer: "text",
      stats: schema,
      citations: output.citations(),
    },
  });

  assertType<RunResult<{
    answer: "text";
    stats: typeof schema;
    citations: ReturnType<typeof output.citations>;
  }>>(result);

  if (result.ok) {
    expectTypeOf(result.outputs.answer).toEqualTypeOf<string>();
    expectTypeOf(result.outputs.stats).toEqualTypeOf<{ count: number }>();
  }
});
```

Run with:

```bash
pnpm --filter lattice test -- --typecheck
```

### Validation Failure Shape

```typescript
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { finalizeOutputsForTest } from "../src/outputs/validate.js";

describe("output validation", () => {
  it("returns validation failure instead of throwing", async () => {
    const result = await finalizeOutputsForTest(
      { action: z.object({ kind: z.literal("refund") }) },
      { action: { kind: "replace" } },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
      expect(result.error.output).toBe("action");
      expect(result.raw).toEqual({ action: { kind: "replace" } });
    }
  });
});
```

The planner may choose a different internal test helper name, but the behavior should be tested without a real provider.

### Package Exports

```json
{
  "name": "lattice",
  "version": "0.0.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "types": "./dist/index.d.ts",
  "files": ["dist"]
}
```

Node package docs require explicit `exports` subpaths; `attw` should verify the resulting package's declarations resolve under the chosen profile.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CJS-first packages with implicit deep imports | ESM-first packages with explicit `exports` | Node `exports` stable since Node 12 era; current Node docs enforce exported subpaths | Phase 1 should define the package contract through `exports` and keep internals private. |
| Library-specific schema branches | Standard Schema `~standard` protocol | Standard Schema lists Zod 3.24+, Valibot v1+, ArkType v2+ implementers | Lattice can support Zod-first docs while accepting compatible validators without adapters. |
| Zod 3 plus `zod-to-json-schema` as default | Zod 4 with built-in `z.toJSONSchema()` for later provider JSON Schema | Zod 4 stable in current docs | Phase 1 should not add `zod-to-json-schema`; provider JSON Schema conversion is later. |
| Runtime tests only | Runtime tests plus `*.test-d.ts`, `expectTypeOf`, and package declaration tests | Vitest 4 docs support type testing with `--typecheck` | Public API inference must be tested as a first-class deliverable. |
| Real provider calls in initial API tests | Fixture raw outputs through Lattice-owned interfaces | Project roadmap defers provider execution and fake providers | Phase 1 should prove contracts without network/provider dependencies. |

**Deprecated/outdated:**

- Node 18 target: Node docs list v18 as EOL; do not use it as the baseline.
- Zod 3 as default: use Zod 4.
- `zod-to-json-schema` as a new core dependency: use Zod 4 conversion later if provider JSON Schema is needed.
- CJS-only output: conflicts with ESM-first SDK direction and modern package export expectations.
- Public provider SDK types: contradicts Phase 1 goal and creates breaking-change coupling.

## Open Questions

1. **How will the project resolve the public package name conflict?**
   - What we know: The npm registry already has `lattice@0.98.0` for OpenLattice REST APIs.
   - What's unclear: Whether the user can acquire the name, will publish under a scope, or only needs local package imports for now.
   - Recommendation: Phase 1 should keep local package/import name `lattice` to honor locked decisions, but add a release-blocking note before public npm publishing.

2. **Should Phase 1 expose `output` as a named helper export?**
   - What we know: `"text"` and Standard Schema cover text and JSON, but citations/artifact refs need a typed contract.
   - What's unclear: Whether the user wants only `createAI` and `artifact` as values in the beginner example.
   - Recommendation: Export `output` for non-schema output contracts while keeping the common example focused on `createAI` and `artifact`.

3. **How much fixture execution should `ai.run` support?**
   - What we know: Real providers are deferred, but success/validation boundaries need tests.
   - What's unclear: Whether the planner wants a public `ProviderAdapter.execute` test path now or an internal-only finalization helper.
   - Recommendation: Define the public `ProviderAdapter` shape now with optional execution, use a test fixture adapter or internal helper for validation tests, and avoid real provider semantics.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | TypeScript SDK build/test runtime | yes | local `v25.9.0`; target `>=24` | Install/test Node 24 LTS before release if CI is added. |
| npm | Registry version checks and fallback package manager | yes | `11.12.1` | Use pnpm for workspace operations. |
| pnpm | Workspace install/scripts | yes | local `10.29.3`; latest verified `10.33.1` | Upgrade via Corepack or npm if planner requires exact latest. |
| git | Repository state and future commits | yes | `2.50.1` Apple Git | none |
| Public npm package name `lattice` | External publishing | occupied | `lattice@0.98.0` | Use local workspace name for Phase 1; resolve package name before publish. |

**Missing dependencies with no fallback:**

- None for Phase 1 implementation and tests.

**Missing dependencies with fallback:**

- Public npm package name ownership is not available by default; local workspace imports can still satisfy Phase 1.

## Sources

### Primary (HIGH confidence)

- Local `.planning/phases/01-runtime-api-output-contracts/01-CONTEXT.md` - locked Phase 1 API decisions.
- Local `.planning/REQUIREMENTS.md` - API-01, API-02, API-03, OUT-01, OUT-02, OUT-03, OUT-04.
- Local `.planning/ROADMAP.md` - Phase 1 scope and success criteria.
- Local `.planning/research/STACK.md` - project stack direction.
- Local `.planning/research/ARCHITECTURE.md` - public runtime and component boundary direction.
- Local `.planning/research/PITFALLS.md` - provider leakage, output, artifact, and inspectability pitfalls.
- Node.js releases: https://nodejs.org/en/about/previous-releases - Node 24 LTS and Node 18 EOL status.
- Node package exports docs: https://nodejs.org/api/packages.html - package `exports` and subpath export behavior.
- TypeScript modules reference: https://www.typescriptlang.org/docs/handbook/modules/reference.html - ESM syntax, type-only imports, `moduleResolution: bundler`.
- Zod docs: https://zod.dev/ - Zod 4 stable, TypeScript-first validation, strict TS requirement.
- Zod JSON Schema docs: https://zod.dev/json-schema - `z.toJSONSchema()` and unrepresentable schema caveats.
- Standard Schema docs: https://standardschema.dev/schema - `StandardSchemaV1`, `~standard.validate`, issue shape, type inference, implementer list.
- Vitest type testing docs: https://vitest.dev/guide/testing-types.html - `*.test-d.ts`, `expectTypeOf`, `assertType`, `--typecheck`.
- tsdown docs: https://tsdown.dev/ and https://tsdown.dev/options/dts - library bundler and declaration generation behavior.
- pnpm workspace docs: https://pnpm.io/workspaces - workspace protocol and publish transformation.
- npm registry checks on 2026-04-22 - verified package versions and `lattice` name occupancy.

### Secondary (MEDIUM confidence)

- tsd GitHub README: https://github.com/tsdjs/tsd - package declaration testing conventions.
- publint docs: https://publint.dev/ - package compatibility linting.
- Are The Types Wrong CLI docs: https://github.com/arethetypeswrong/arethetypeswrong.github.io/tree/main/packages/cli - package type entrypoint checks and profiles.

### Tertiary (LOW confidence)

- None used for recommendations.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - current versions verified with npm registry and official docs.
- Architecture: HIGH - constrained by local Phase 1 decisions and TypeScript SDK best practices.
- Output typing strategy: HIGH - Standard Schema and Vitest type testing are directly documented.
- Package naming: MEDIUM - npm occupancy is verified, but business resolution is outside technical research.
- Pitfalls: HIGH - derived from local project pitfalls plus official docs around exports, schemas, and type testing.

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 for TypeScript/package/schema stack; revisit immediately before public package publishing because the npm name and package versions may change.
