# Architecture Patterns

**Project:** Lattice  
**Domain:** TypeScript-first capability runtime SDK for multimodal AI tasks  
**Researched:** 2026-04-22  
**Overall confidence:** HIGH for architecture direction, MEDIUM for exact provider substrate choices

## Recommendation

Lattice should be architected as a small public runtime wrapped around explicit internal subsystems: artifact lifecycle, context packing, deterministic routing, provider packaging, execution, storage, tracing, and replay. The public API should expose intentions and results; internals should expose inspectable data records and narrow extension interfaces.

Use one published umbrella package for v0.1, `lattice`, with subpath exports for advanced extension points. Keep internal workspace modules or folders modular from day one, but avoid forcing users to install a constellation of packages before the core value is validated. This follows the useful pattern visible in adjacent SDKs: a small default entry point with lower-level packages or adapters available only when needed.

The central architectural rule: **the execution plan is a runtime artifact, not the authoring interface.** Users should not design graphs for v0.1. They provide `task`, `artifacts`, `outputs`, and `policy`; Lattice derives a stage plan, executes it, records why each choice happened, and returns the plan for inspection, replay, and debugging.

## Tiny Public API

Recommended beginner surface:

```ts
import { artifact, createAI } from "lattice";
import { z } from "zod";

const ai = createAI({
  providers: ["gateway"],
  storage: "memory",
});

const result = await ai.run({
  task: "Summarize this support request and extract the next action.",
  artifacts: [
    artifact.text("Customer says the shipment photo does not match the invoice."),
    artifact.file(invoicePdf, { mediaType: "application/pdf" }),
    artifact.image(screenshotFile),
  ],
  outputs: {
    summary: "text",
    action: z.object({
      kind: z.enum(["replace", "refund", "escalate"]),
      reason: z.string(),
    }),
  },
  policy: {
    maxCostUsd: 0.25,
    latency: "interactive",
    privacy: "standard",
  },
});

console.log(result.output);
console.log(result.plan);
```

Public exports should stay narrow:

| Export | Purpose | Notes |
|--------|---------|-------|
| `createAI(config?)` | Create configured runtime | Main entry point. |
| `artifact.*` | Build canonical artifacts | Text, JSON, file, image, audio, video, URL, tool result. |
| `session(config?)` | Create/load session handle | Optional in beginner path. |
| `ai.run(intent)` | Execute a capability task | Accepts task, artifacts, outputs, policy, session. |
| `ai.plan(intent)` | Dry-run plan creation | Same planner without provider calls. |
| `ai.replay(runRef, options?)` | Replay from recorded run | Uses recorded inputs, plan, events, and fixture provider responses. |
| `ai.branch(sessionRef, options?)` | Fork session state | Copy-on-write branch for alternatives. |

Advanced exports should be subpaths, not top-level API clutter:

| Subpath | Use |
|---------|-----|
| `lattice/providers` | Provider adapter contracts and official adapters. |
| `lattice/storage` | Store interfaces and built-in stores. |
| `lattice/testing` | Fake providers, fixture stores, golden-plan helpers. |
| `lattice/react` | Optional UI hooks once runtime events stabilize. |
| `lattice/mcp` | MCP tool/resource bridges. |

## Progressive Disclosure Strategy

The public API should reveal control in layers:

| Layer | User Need | API Surface |
|-------|-----------|-------------|
| Beginner | Run a multimodal task | `createAI`, `artifact`, `ai.run` |
| Inspect | Understand what happened | `result.plan`, `ai.plan`, run events |
| Continue | Carry work across turns | `session`, `ai.branch` |
| Debug | Reproduce behavior | `ai.replay`, cassettes, trace sinks |
| Override | Force advanced behavior | model/provider override, custom router, custom packer, hooks |
| Extend | Add runtime capabilities | provider, storage, transform, MCP, UI subpath exports |

Advanced controls should be configured through typed options and extension interfaces, not by expanding the beginner method list. This lets Lattice keep a tiny surface while still supporting forced provider/model selection, custom summarizers, artifact transforms, routing policy overrides, lifecycle hooks, and provider-specific escape hatches.

## Component Boundaries

| Component | Responsibility | Owns | Must Not Own |
|-----------|----------------|------|--------------|
| Public Runtime | Small ergonomic API, config normalization | `createAI`, `run`, `plan`, `replay`, `branch` facades | Provider-specific message formats |
| Domain Types | Shared immutable records | `RunIntent`, `ArtifactRef`, `OutputSpec`, `Policy`, `ExecutionPlan`, `Stage`, `LatticeResult` | Network calls or storage |
| Artifact Registry | Normalize, identify, store, derive, and package artifacts | Artifact manifests, content hashes, parent/derived links, media metadata | Model routing decisions |
| Context Engine | Build model-visible context from session and artifacts | Live context, compressed summary, archived refs, token budgets | Provider network calls |
| Router | Deterministic model/provider selection | Capability matrix, policy scoring, fallback graph, rejected-candidate reasons | Artifact transforms |
| Planner | Convert intent into executable stages | Stage DAG, dependencies, selected providers, budgets, required transforms | Provider SDK implementation details |
| Executor | Run stages and collect outputs | Stage lifecycle, retries, fallback activation, result normalization | Policy scoring rules |
| Provider Adapters | Translate canonical packages into provider calls | Message/file/audio/image packaging, uploads, response normalization | Public Lattice API shape |
| Storage | Persist artifacts, sessions, runs, checkpoints, traces | Store interfaces and implementations | Routing logic |
| Sessions | Conversation/task continuity | Session snapshots, branches, live/summary/archive planes | Raw artifact bytes |
| Tracing | Observability and plan-event capture | Events, spans, redaction, trace sinks | Business decisions |
| Replay | Deterministic re-execution and debugging | Run logs, cassettes, plan snapshots, fixture provider responses | New routing choices unless explicitly requested |
| UI Bindings | Headless runtime state for apps | React hooks over run/session events | Runtime orchestration |

## Package Boundary Recommendation

For v0.1, publish one package and keep optional integrations behind subpath exports and peer dependencies:

```text
packages/lattice/
  src/index.ts                  # tiny public API
  src/runtime/                  # createAI facade and config
  src/domain/                   # pure types and validation
  src/artifacts/                # artifact lifecycle
  src/context/                  # packing and summarization
  src/router/                   # capability matrix and deterministic scorer
  src/planner/                  # intent -> stage DAG
  src/executor/                 # stage runner and fallback activation
  src/providers/                # adapter contracts and built-ins
  src/storage/                  # memory/file stores and interfaces
  src/sessions/                 # session model, branch, compaction hooks
  src/tracing/                  # event bus, plan events, OTEL bridge
  src/replay/                   # cassettes and deterministic replay
  src/testing/                  # fake provider, fixtures, golden-plan assertions
  src/react/                    # optional hooks, late v0.1 or v0.2
```

This gives roadmap flexibility:

1. Start with internal folders and `exports` maps.
2. Extract to `@lattice/*` packages only when independent versioning or dependency weight becomes painful.
3. Keep provider dependencies optional so installing `lattice` does not pull every provider SDK.

Recommended package exports:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./providers": "./dist/providers/index.js",
    "./storage": "./dist/storage/index.js",
    "./testing": "./dist/testing/index.js",
    "./react": "./dist/react/index.js",
    "./mcp": "./dist/mcp/index.js"
  }
}
```

## Core Data Model

### RunIntent

`RunIntent` is the normalized version of user input:

```ts
type RunIntent = {
  id: RunId;
  task: TaskSpec;
  artifacts: ArtifactRef[];
  outputs: OutputSpec[];
  policy: PolicySpec;
  session?: SessionRef;
  overrides?: AdvancedOverrides;
};
```

### Artifact

Artifacts should be content-addressable where possible and always referenceable:

```ts
type ArtifactManifest = {
  id: ArtifactId;
  kind: "text" | "json" | "image" | "audio" | "video" | "document" | "file" | "tool-result";
  mediaType?: string;
  source: "inline" | "file" | "url" | "generated" | "provider-upload" | "tool";
  uri?: string;
  checksum?: string;
  sizeBytes?: number;
  tokenEstimate?: number;
  labels: {
    privacy?: "public" | "standard" | "sensitive" | "restricted";
    audience?: "user" | "assistant" | "system";
  };
  parents?: ArtifactId[];
  transform?: {
    name: string;
    version: string;
    configHash: string;
  };
};
```

Artifacts move through this lifecycle:

```text
ingest -> normalize -> store raw -> analyze -> transform -> package -> use in stage
       -> store generated outputs -> link lineage -> archive/garbage collect
```

Every transformed artifact must keep parent lineage. This is required for explainable plans, replay, privacy audits, and debugging packaging failures.

### ExecutionPlan

The plan should be stable JSON, safe to display, and detailed enough for tests:

```ts
type ExecutionPlan = {
  id: PlanId;
  intentId: RunId;
  createdAt: string;
  catalogVersion: string;
  stages: StagePlan[];
  routing: RoutingDecision[];
  context: ContextPackSummary;
  fallbacks: FallbackEdge[];
  estimates: {
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
    latencyMs?: number;
  };
  explanations: PlanExplanation[];
};
```

The plan must include rejected candidates with reason codes, not just the selected model. This is the main mechanism for trust in deterministic routing.

## Data Flow

The runtime should flow in one direction. Avoid cycles where providers or UI code mutate planning decisions.

```text
User Input
  task + artifacts + outputs + policy + optional session
        |
        v
Input Normalizer
  canonical RunIntent
        |
        v
Artifact Registry
  ArtifactRefs + manifests + raw storage + metadata
        |
        v
Session Loader
  live context + compressed summary + archived refs
        |
        v
Context Engine
  ContextPack candidates + token estimates + omitted-item reasons
        |
        v
Capability Resolver + Router
  filtered candidate models/providers + deterministic scores + fallback chain
        |
        v
Planner
  Stage DAG: preprocess -> package -> generate/validate -> postprocess
        |
        +------ ai.plan(...) returns here without execution
        |
        v
Executor
  stage lifecycle + provider calls + retries + fallback activation
        |
        v
Result Normalizer
  validated outputs + generated artifacts + usage/cost/latency
        |
        v
Persistence + Tracing
  run record + events + session update + trace spans
        |
        v
LatticeResult
  output + artifacts + plan + trace + usage + session ref
```

### Stage Flow

Stages should be a DAG internally, but v0.1 can execute mostly linear plans:

```text
Analyze artifacts
  -> optional transforms: OCR, resize, transcode, audio transcription, PDF chunking
  -> context packing
  -> provider packaging
  -> model call
  -> schema validation / repair if allowed by policy
  -> optional speech/image/document output
  -> session and run persistence
```

The stage DAG exists to make plans inspectable and replayable. It should not be exposed as a required user-facing graph DSL.

## Deterministic v0.1 Routing

Routing should be deterministic in v0.1. Do not use an LLM classifier to pick models in the first release.

Recommended algorithm:

1. Load a versioned model catalog.
2. Apply hard filters:
   - Required input modalities.
   - Required output modalities.
   - Structured output/tool support.
   - Context window.
   - Provider availability.
   - Privacy policy.
   - Max cost and latency class.
3. Score candidates with a visible weighted function:
   - Capability fit.
   - Cost estimate.
   - Latency estimate.
   - Quality tier.
   - Packaging friction.
   - Provider preference.
4. Resolve ties by stable catalog order.
5. Produce fallback edges from the next-best candidates that satisfy the same hard constraints.
6. Record selected and rejected candidates with reason codes.

Example routing record:

```ts
type RoutingDecision = {
  stageId: StageId;
  selected: ModelRoute;
  fallbacks: ModelRoute[];
  rejected: Array<{
    route: ModelRoute;
    reason:
      | "missing-input-modality"
      | "missing-structured-output"
      | "context-window-too-small"
      | "policy-privacy"
      | "policy-cost"
      | "policy-latency"
      | "provider-disabled";
  }>;
  scoreBreakdown: Record<string, number>;
};
```

Model catalog shape:

```ts
type ModelCapability = {
  route: ModelRoute;
  provider: string;
  model: string;
  inputs: Modality[];
  outputs: Modality[];
  contextWindowTokens: number;
  supports: {
    structuredOutput?: boolean;
    toolUse?: boolean;
    streaming?: boolean;
    audioIn?: boolean;
    audioOut?: boolean;
    imageGeneration?: boolean;
    fileUpload?: boolean;
  };
  packaging: {
    image?: "url" | "base64" | "upload";
    document?: "url" | "base64" | "upload" | "chunks";
    audio?: "url" | "base64" | "upload";
  };
  pricing?: PricingHint;
  latencyClass?: "realtime" | "interactive" | "batch";
  dataPolicy?: DataPolicyHint;
};
```

The router should accept live provider metadata later, but v0.1 should route against a frozen catalog snapshot to make tests and replay stable.

## Context Packing

Lattice should treat context as a first-class runtime concern, not as provider prompt assembly.

Use three context planes per session:

| Plane | Contents | Model Visibility |
|-------|----------|------------------|
| Live | Recent turns, selected artifacts, active task facts | Usually visible |
| Summary | Compressed durable state and decisions | Visible when useful |
| Archive | Raw artifacts, old turns, full traces | Referenced, fetched, or re-packed only when needed |

Context packing should output both payload and explanation:

```ts
type ContextPack = {
  messages: CanonicalMessage[];
  artifacts: PackagedArtifactInput[];
  tokenEstimate: number;
  included: ContextItemRef[];
  omitted: Array<{ ref: ContextItemRef; reason: string }>;
  summaryRefs: ArtifactRef[];
};
```

Packing strategy:

1. Reserve budget for system/developer instructions, output schema, and expected completion.
2. Include task-local artifacts first.
3. Include live session items by recency and relevance.
4. Include summaries before old raw history.
5. Include archived artifacts by reference unless the selected provider/stage requires bytes.
6. Record omissions and truncation decisions in the plan.

Keep local runtime context separate from model-visible context. Local context may hold stores, loggers, user IDs, and hooks; model-visible context is the explicit packed payload. This boundary prevents accidental secret leakage and makes plans easier to inspect.

## Provider Abstractions

Provider adapters should implement a narrow contract:

```ts
interface ProviderAdapter {
  id: string;
  capabilities(): Promise<ModelCapability[]> | ModelCapability[];
  prepare(input: ProviderPrepareInput): Promise<ProviderPackage>;
  execute(pkg: ProviderPackage, signal?: AbortSignal): Promise<ProviderResult>;
  stream?(pkg: ProviderPackage, signal?: AbortSignal): AsyncIterable<ProviderEvent>;
}
```

The adapter owns provider-specific packaging:

| Canonical Need | Adapter Decision |
|----------------|------------------|
| Image input | URL vs base64 vs upload ID, size limits, resize transform |
| PDF/document | Direct file, chunking, upload, extraction, retrieval reference |
| Audio input | Upload, base64, transcription pre-stage, realtime stream |
| Structured output | Native schema, tool-call emulation, JSON repair policy |
| Speech output | TTS model call, stream handling, generated audio artifact |

Use an existing TypeScript provider surface underneath the first adapter when it accelerates breadth, but do not leak that surface into Lattice's public types. Official AI SDK docs verify provider registries, custom providers, structured output, multimodal provider capability tables, telemetry hooks, and gateway fallbacks. Those are useful substrate capabilities, but Lattice's differentiator is capability planning and artifact/context orchestration above them.

## Storage And Session Abstractions

Use explicit storage interfaces from the start:

```ts
interface ArtifactStore {
  put(input: ArtifactWrite): Promise<ArtifactManifest>;
  get(ref: ArtifactRef): Promise<ArtifactRead>;
  stat(ref: ArtifactRef): Promise<ArtifactManifest>;
  derive(parent: ArtifactRef[], input: ArtifactWrite, transform: TransformRecord): Promise<ArtifactManifest>;
}

interface SessionStore {
  load(ref: SessionRef): Promise<SessionSnapshot>;
  appendTurn(ref: SessionRef, update: SessionUpdate): Promise<SessionSnapshot>;
  updateSummary(ref: SessionRef, summary: ArtifactRef): Promise<void>;
  branch(ref: SessionRef, options?: BranchOptions): Promise<SessionRef>;
}

interface RunStore {
  create(run: RunRecord): Promise<void>;
  appendEvent(runId: RunId, event: RunEvent): Promise<void>;
  saveCheckpoint(runId: RunId, checkpoint: RunCheckpoint): Promise<void>;
  load(runId: RunId): Promise<RunRecord>;
}
```

Built-ins:

| Store | Phase | Purpose |
|-------|-------|---------|
| `MemoryStore` | First | Fast tests, examples, browser-compatible prototypes. |
| `FileStore` | Early | Local dev, showcase replay, easy inspection. |
| `SQLiteStore` | After core stabilizes | Durable local apps and demos with searchable run/session records. |
| `PostgresStore` | Later | Production multi-user apps. |

Session records should not duplicate raw artifact bytes. Store references and derived summaries. Branching should be copy-on-write:

```text
session A
  checkpoint 1
  checkpoint 2
    branch B -> new turns only, shared artifacts by ref
    branch C -> alternative policy/model, shared base context
```

Replay should load the original run record, artifact manifests, model catalog version, plan, events, and provider cassette. By default, replay should not re-route. Re-routing can be an explicit comparison mode later.

## Tracing And Inspectability

Lattice should emit its own structured run events and optionally bridge them to OpenTelemetry.

Required internal events:

| Event | Why |
|-------|-----|
| `run.created` | Top-level correlation ID. |
| `artifact.ingested` | Audit input normalization. |
| `artifact.transformed` | Explain preprocessing and lineage. |
| `context.packed` | Show included/omitted context. |
| `router.candidates` | Show hard filters and scoring. |
| `plan.created` | Freeze stage DAG. |
| `stage.started` / `stage.completed` | Debug lifecycle and latency. |
| `provider.request` / `provider.response` | Debug provider packaging and usage. |
| `fallback.activated` | Explain failover. |
| `result.validated` | Show schema validation/repair outcome. |
| `session.updated` | Explain memory mutation. |

Use redaction defaults. Traces should carry artifact IDs and metadata by default, not raw content. Raw prompt/body capture should require explicit dev-mode opt-in.

## Optional UI Bindings

UI bindings should be late and thin. They should subscribe to run/session events and expose headless state:

```ts
const run = useLatticeRun(ai, {
  task,
  artifacts,
  outputs,
  policy,
});

run.status;
run.output;
run.plan;
run.events;
run.cancel();
run.replay();
```

Do not let React hooks become the core architecture. The runtime should work in Node, workers, CLI tools, serverless functions, and tests before UI bindings are added.

## Dependency Graph

```text
domain
  -> artifacts
  -> storage
  -> sessions

domain + artifacts + sessions
  -> context

domain + artifacts
  -> provider contracts

domain + provider contracts
  -> router

context + router
  -> planner

planner + providers + storage + tracing
  -> executor

executor + run store + artifacts
  -> replay

executor events + result types
  -> optional UI bindings

testing depends on domain + router + planner + fake providers + memory storage
```

Forbidden dependencies:

| From | Must Not Depend On | Reason |
|------|--------------------|--------|
| `domain` | Everything | Keeps core records pure and testable. |
| `router` | `executor` | Routing must be dry-runnable and deterministic. |
| `context` | Provider SDKs | Packing decisions must be provider-neutral until packaging. |
| `providers` | Public runtime facade | Adapters should be pluggable without circular APIs. |
| `react` | Planner internals | UI observes events/results; it should not author plans. |

## Suggested Build Order

1. **Domain types and validation**
   - Build `RunIntent`, `ArtifactManifest`, `OutputSpec`, `PolicySpec`, `ExecutionPlan`, `StagePlan`, and `LatticeResult`.
   - Reason: every other subsystem needs stable records.

2. **Artifact lifecycle and memory storage**
   - Implement artifact builders, manifests, content hashes, `MemoryStore`, and generated artifact lineage.
   - Reason: multimodal runtime value depends on artifacts being first-class.

3. **Deterministic model catalog and router**
   - Implement frozen catalog fixtures, hard filters, scoring, fallback selection, and rejected-candidate reasons.
   - Reason: v0.1 trust depends on explainable routing before real provider complexity.

4. **Planner with fake providers**
   - Convert intent into stage DAG and support `ai.plan()`.
   - Reason: planning can be tested without network calls.

5. **Executor, run events, and tracing sink**
   - Execute stages against fake provider, persist run records, emit events, return result and plan.
   - Reason: establishes inspectable runtime spine.

6. **Context engine and sessions**
   - Add live/summary/archive planes, session append, branch, and pack explanations.
   - Reason: context decisions affect routing, packaging, and replay; integrate after stage skeleton exists.

7. **First real provider adapter**
   - Use one broad TypeScript provider substrate behind Lattice's adapter contract.
   - Reason: prove packaging and structured output with real calls without overbuilding provider breadth.

8. **Replay**
   - Record provider cassettes and enable deterministic run replay.
   - Reason: makes debugging, demos, and CI stable.

9. **Showcase transforms**
   - Add PDF chunking, image resizing/OCR hook, audio transcription stage, and optional speech output.
   - Reason: these exercise artifact lifecycle and stage composition.

10. **Optional UI bindings**
    - Add `lattice/react` after events and cancellation semantics are stable.
    - Reason: UI should observe runtime state, not define runtime architecture.

## Testability Strategy

Test architecture must prioritize deterministic plans and replayable runs.

| Layer | Test Type | What To Verify |
|-------|-----------|----------------|
| Domain | Unit + type tests | Schema validation, API type inference, invalid policies. |
| Artifacts | Unit + property tests | Stable IDs, lineage, MIME detection, transform records. |
| Router | Golden tests | Same intent + catalog + policy always produces same route and fallback chain. |
| Context | Snapshot tests | Included/omitted items, token budget behavior, summary use. |
| Planner | Golden plan tests | Stage DAG shape, dependency ordering, dry-run output. |
| Providers | Contract tests | Adapter prepares canonical packages and normalizes responses. |
| Executor | Integration tests with fake provider | Stage events, retries, fallback activation, cancellation. |
| Sessions | State tests | Append, summary update, branch, snapshot load. |
| Replay | Cassette tests | Original run can be replayed without network and without re-routing. |
| Tracing | Redacted event snapshots | No raw sensitive content unless dev capture is explicitly enabled. |
| Public API | `tsd` or `expectTypeOf` tests | Beginner API remains small and inferred outputs stay typed. |

Required fixtures for v0.1:

```text
fixtures/
  artifacts/
    support-message.txt
    invoice.pdf
    damaged-package.jpg
    call-note.wav
  catalogs/
    v0.1-model-catalog.json
  runs/
    work-inbox-happy-path.json
    fallback-activated.json
    context-overflow.json
```

Every phase should include tests that assert plan JSON, not just final model output. This keeps the core differentiator inspectable.

## Anti-Patterns To Avoid

### Public Graph DSL First

**Why bad:** It makes Lattice feel like another orchestration framework.  
**Instead:** Derive internal stage DAGs from `task`, `artifacts`, `outputs`, and `policy`.

### Provider Types In Public API

**Why bad:** It couples Lattice's long-term API to the first adapter substrate.  
**Instead:** Keep provider SDK types inside adapters and normalize to Lattice records.

### Routing Inside Provider Adapters

**Why bad:** It hides decisions and makes `ai.plan()` impossible to trust.  
**Instead:** Router selects routes; adapters only prepare and execute selected routes.

### Context Packing As Prompt String Concatenation

**Why bad:** It loses artifact lineage, omission reasons, and provider packaging flexibility.  
**Instead:** Build `ContextPack` as structured messages plus artifact references and packing explanations.

### Replay That Re-routes By Default

**Why bad:** Debugging becomes nondeterministic.  
**Instead:** Replay original catalog version, plan, artifacts, and provider cassettes; make re-routing explicit comparison mode.

### UI Hooks Before Runtime Events Stabilize

**Why bad:** UI state shape will leak unstable internal concepts.  
**Instead:** stabilize run events and cancellation first, then bind UI to those events.

## Roadmap Implications

The first milestone should not start with real provider breadth or UI hooks. It should prove the runtime spine:

1. Canonical artifacts and domain records.
2. Deterministic routing and dry-run plans.
3. Fake-provider execution with traceable events.
4. Sessions and context packing.
5. One real provider adapter.
6. Replay and showcase transforms.
7. Optional UI bindings.

The key dependency is: **artifact model before context, context before provider packaging, router before executor, event/run store before replay.**

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Public API shape | HIGH | Aligns with project requirements and adjacent SDK small-entry patterns. |
| Internal package boundaries | HIGH | Boundaries map directly to required runtime responsibilities. |
| Deterministic routing design | HIGH | Requirements explicitly reject opaque v0.1 routing. |
| Provider substrate | MEDIUM | AI SDK/Gateway is a strong candidate, but exact choice should be validated during implementation against required multimodal packaging. |
| Storage/session model | HIGH | Patterns are supported by official session/checkpoint docs and project requirements. |
| UI binding timing | HIGH | Project says frontend hooks are not the center; architecture should preserve that. |

## Sources

- Vercel AI SDK introduction, provider abstraction, and supported provider model: https://ai-sdk.dev/docs/introduction
- Vercel AI SDK provider/model management and registry: https://ai-sdk.dev/docs/ai-sdk-core/provider-management
- Vercel AI SDK structured output support: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- Vercel AI SDK DevTools inspectability pattern: https://ai-sdk.dev/docs/ai-sdk-core/devtools
- Vercel AI Gateway model/provider switching and routing: https://vercel.com/docs/ai-gateway/models-and-providers
- Vercel AI Gateway model fallback behavior: https://vercel.com/docs/ai-gateway/models-and-providers/model-fallbacks
- OpenAI Agents SDK TypeScript small-primitives/package-boundary pattern: https://openai.github.io/openai-agents-js/
- OpenAI Agents SDK sessions and pluggable session storage: https://openai.github.io/openai-agents-js/guides/sessions/
- OpenAI Agents SDK context separation: https://openai.github.io/openai-agents-js/guides/context/
- OpenAI Agents SDK tracing: https://openai.github.io/openai-agents-js/guides/tracing/
- LangGraph durable execution and deterministic replay guidance: https://docs.langchain.com/oss/javascript/langgraph/durable-execution
- LangGraph persistence, checkpointing, threads, time travel, and fault tolerance: https://docs.langchain.com/oss/javascript/langgraph/persistence
- TanStack AI package-boundary and type-safe modality pattern: https://tanstack.com/ai/latest/docs/getting-started/overview
- Model Context Protocol tool result and resource-link content model: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
- OpenTelemetry JavaScript manual span instrumentation: https://opentelemetry.io/docs/languages/js/instrumentation/
