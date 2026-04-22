# Phase 1: Runtime API & Output Contracts - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 defines the first public TypeScript contract for Lattice. It should deliver the install/import shape, `createAI`, `ai.run`, runtime config types, output contract types, and typed validation/result boundaries without implementing real artifact lifecycle, provider routing, sessions, storage, tracing, or provider execution.

This phase clarifies how the API should feel to a developer. Later phases implement artifacts, deterministic planning/execution, context/sessions, provider packaging, tools, replay, and the showcase.

</domain>

<decisions>
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

### Agent's Discretion
- The planner may choose exact TypeScript type names where not locked above, as long as the names remain clear and stable.
- The planner may decide package scaffold details, test file layout, and implementation sequencing inside this phase.
- The planner may keep Phase 1 implementations as non-executing stubs where behavior belongs to later roadmap phases, but those stubs must make downstream phase integration obvious.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project And Scope
- `.planning/PROJECT.md` - Product vision, core value, constraints, and project-level decisions.
- `.planning/ROADMAP.md` - Phase 1 boundary, success criteria, and phase ordering.
- `.planning/REQUIREMENTS.md` - Phase 1 requirements: API-01, API-02, API-03, OUT-01, OUT-02, OUT-03, OUT-04.
- `.planning/STATE.md` - Current project state and phase focus.

### Research
- `.planning/research/SUMMARY.md` - Consolidated research, including Phase 1 runtime contract implications and pitfalls.
- `.planning/research/STACK.md` - Recommended TypeScript, package, schema, build, and testing stack.
- `.planning/research/FEATURES.md` - Feature landscape and v0.1 runtime thesis.
- `.planning/research/ARCHITECTURE.md` - Recommended public API, component boundaries, and data model direction.
- `.planning/research/PITFALLS.md` - Contract-first pitfalls to avoid, especially weak artifacts, shallow plans, and provider leakage.

### Project Guide
- `AGENTS.md` - Generated project guidance, stack summary, and GSD workflow enforcement.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No application or package source exists yet. Phase 1 should create the initial source layout instead of conforming to existing implementation patterns.

### Established Patterns
- Planning artifacts define a TypeScript-first, ESM-first SDK with a small public API and modular internals.
- Research recommends Node `>=24`, TypeScript 6, pnpm workspaces, Changesets, tsdown builds, Vitest, strict type settings, Zod 4, Standard Schema compatibility, and package-shape checks.
- The roadmap intentionally puts runtime contracts before artifact lifecycle, provider adapters, context/session behavior, replay, and the work-inbox showcase.

### Integration Points
- Phase 1 should establish package scaffolding, public exports, core domain type modules, output validation boundary types, and tests that future phases can build on.
- Phase 1 should avoid importing concrete provider SDKs into public API types.
- Phase 1 should avoid implementing real artifact storage, routing, provider execution, session persistence, or tracing behavior beyond interfaces/placeholders needed for type stability.

</code_context>

<specifics>
## Specific Ideas

- The core happy path should read like:

```ts
import { createAI, artifact } from "lattice";

const ai = createAI({
  providers,
  defaults: { policy },
});

const result = await ai.run({
  task: "Resolve this support case",
  artifacts: [artifact.text(message)],
  outputs: {
    answer: "text",
    action: actionSchema,
  },
  policy,
});

if (!result.ok) {
  // typed failure handling
}
```

- Keep the API consistent rather than adding early shortcuts. Shortcuts can be reconsidered after the core shape is validated.
- Public Phase 1 types should make later behavior obvious without pretending those later systems already work.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-runtime-api-output-contracts*
*Context gathered: 2026-04-22*
