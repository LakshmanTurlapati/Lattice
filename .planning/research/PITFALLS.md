# Domain Pitfalls: Lattice

**Domain:** TypeScript AI capability runtime SDK for multimodal artifacts, routing, context, sessions, file transport, replay, and developer ergonomics  
**Researched:** 2026-04-21  
**Overall confidence:** HIGH for provider/runtime mechanics from official docs; MEDIUM for roadmap prioritization because it is inferred from Lattice's project goals.

## Roadmap Phase Map

These phase names are suggested for roadmap planning. The important point is ordering: lock the invariant model before building the showcase.

| Phase | Purpose |
|-------|---------|
| Phase 1: Runtime Contracts | Public API, `Artifact`, output contract, execution plan schema, model capability schema |
| Phase 2: Provider Packaging | Provider adapters, file transport planner, modality transforms, provider conformance tests |
| Phase 3: Context And Sessions | Session/run/context separation, context packing, compaction, artifact archive, branch semantics |
| Phase 4: Deterministic Routing | Policy scoring, fallback envelopes, budget/latency/privacy constraints, route explanations |
| Phase 5: Replay And Observability | Replay envelope, trace hooks, redaction, eval fixtures, failure inspection |
| Phase 6: Work Inbox Showcase | End-to-end multimodal inbox with text, screenshots/photos, audio, PDFs, JSON actions, optional speech |

## Critical Pitfalls

### 1. Collapsing Artifacts Into Provider Message Payloads

**What goes wrong:** The runtime stores whatever a provider expects today: OpenAI `input_file`, Anthropic `document`, AI SDK `image` or `file` parts, raw base64 strings, and tool results. This makes Lattice a transient message builder instead of a capability runtime.

**Why it happens:** Provider SDKs encourage sending request-shaped objects directly. AI SDK message prompts support mixed content parts, but not all models support all message/content types, and provider-specific options can live at function, message, or message-part scope.

**Warning signs:**
- `Artifact` is just `{ type, data }` or an alias for provider payloads.
- Provider upload IDs are the only persistent artifact reference.
- The code cannot answer "which artifact version did this result come from?"
- Transforms such as resize, OCR, transcode, PDF split, or base64 encoding are invisible in the plan.

**Prevention strategy:**
- In Phase 1, make `Artifact` immutable and provider-neutral: stable id, kind, MIME type, byte hash, logical content hash, size, privacy class, storage reference, derived artifacts, provenance, retention policy, and optional human label.
- Treat provider payloads as derived packaging products, never as canonical artifacts.
- Model transforms as first-class lineage records: `sourceArtifactId`, transform name/version, parameters, output artifact id, warnings.
- Require every result artifact to reference the input artifacts and transforms that produced it.

**Phase to address:** Phase 1: Runtime Contracts, enforced again in Phase 2 provider adapters.

**Testing and validation implication:**
- Golden tests must assert artifact ids, hashes, transform lineage, and provider package output separately.
- Snapshot tests should fail if adapter output contains untracked inline bytes or provider IDs without a canonical artifact reference.
- Include round-trip tests from raw file -> transformed artifact -> provider payload -> output artifact -> replay envelope.

### 2. Treating URL, Base64, Upload ID, And Inline Bytes As Interchangeable File Transport

**What goes wrong:** A task works with one provider and fails or leaks data with another because file transport details differ. OpenAI Responses file inputs can use base64, file IDs, or external URLs, but Chat Completions does not support file URLs. Anthropic PDFs can be passed by URL, base64, or Files API id, but have payload/page/context constraints. AI SDK file parts are currently supported by only a limited set of providers/models.

**Why it happens:** "File support" sounds binary. In practice it depends on endpoint, provider, model, MIME type, file size, page count, URL accessibility, retention expectations, and whether visual content must be preserved.

**Warning signs:**
- A single `sendFile()` path is used for all providers.
- Private files are converted to public URLs during packaging.
- The runtime retries failed files by changing transport mode without recording that decision.
- File uploads are not garbage collected or cannot be tied back to a Lattice artifact.

**Prevention strategy:**
- In Phase 2, build a file transport planner that chooses between inline bytes, base64, signed URL, provider file upload, chunking, or preprocessing based on provider capability and policy.
- Make transport decisions visible in the execution plan, including size/page limits, URL TTL, upload retention, and fallback reason.
- Add policy constraints for "no external URL", "no provider persistence", "ZDR required", "must preserve visuals", and "may transcode/downsample".
- Keep provider upload handles as derived metadata on the canonical artifact, scoped by provider/account/model and expiration.

**Phase to address:** Phase 2: Provider Packaging.

**Testing and validation implication:**
- Adapter conformance fixtures must cover PDF by URL, PDF by upload id, base64 image, private signed URL, expired URL, oversized file, unsupported MIME type, and repeated file reuse.
- Tests should verify that Chat Completions-style endpoints are rejected for file URLs rather than silently repackaged.
- Security tests must assert that private artifacts are never exposed through public URLs when policy forbids it.

### 3. Building A Shallow Capability Matrix

**What goes wrong:** Routing says a model "supports vision" or "supports files", then selects it for tasks it cannot actually complete: visual PDF understanding, audio input, speech output, image generation, structured JSON, tool use, streaming, long context, or provider-specific detail controls.

**Why it happens:** Capability matrices often begin as provider/model lists. Lattice needs modality direction and output shape, not just model names.

**Warning signs:**
- Capability fields are booleans such as `vision: true`.
- The router cannot distinguish `text+image+file -> text` from `text -> image`.
- Structured output, tool calling, citations, PDF visual mode, speech, transcription, and file transport are modeled outside the router.
- Unsupported provider options are ignored instead of surfaced as warnings.

**Prevention strategy:**
- In Phase 1, define a typed capability schema with dimensions for input modalities, output modalities, accepted file transports, file/MIME constraints, visual PDF mode, structured output support, tool support, streaming support, max context, max output, cost units, latency class, data handling, and provider-option scopes.
- In Phase 2, each adapter must declare capabilities through this schema and pass conformance tests.
- The router should produce a "no viable route" plan when requirements cannot be met, not downgrade silently.

**Phase to address:** Phase 1: Runtime Contracts; Phase 2: Provider Packaging.

**Testing and validation implication:**
- Matrix tests should include impossible tasks: PDF visual extraction on a text-only route, speech output on a text-only model, image generation through a model that only returns text, and structured JSON on a provider path without enforcement.
- Golden route tests must assert selected model, rejected candidates, and exact rejection reasons.

### 4. Letting Fallbacks Change Semantics Silently

**What goes wrong:** A fallback saves availability but changes the product contract: a cheaper model drops visual PDF support, a privacy-constrained task moves to a provider that stores files, a context-window fallback changes quality, or a content-policy fallback changes refusal behavior.

**Why it happens:** Routing infrastructure commonly treats fallback as a reliability feature. LiteLLM distinguishes general fallbacks, context-window fallbacks, and content-policy fallbacks, which is the right warning: fallback reason changes what is safe to retry.

**Warning signs:**
- Fallback config is a simple ordered model list.
- The result only shows the final model, not failed attempts.
- Privacy, budget, latency, and quality constraints are checked only for the first route.
- Context-window errors trigger a larger model without repacking or summarizing context.

**Prevention strategy:**
- In Phase 4, make fallback envelopes explicit: allowed providers, max cost multiplier, max latency, allowed capability deltas, privacy boundaries, and content-policy behavior.
- Score every fallback candidate against the same task policy and capability constraints as the primary route.
- Record every attempt in the execution plan with error class, retry/fallback reason, policy score, cost estimate, and rejected alternatives.
- Require opt-in for fallback classes that can change output quality or data handling.

**Phase to address:** Phase 4: Deterministic Routing.

**Testing and validation implication:**
- Simulate 429, timeout, provider outage, content policy violation, unsupported modality, and context-window exceeded errors.
- Tests must verify that forbidden fallbacks fail closed and that allowed fallbacks preserve declared capability and privacy constraints.
- Snapshot execution plans should show all attempted routes and reasons.

### 5. Compressing Context By Dropping Turns Instead Of Preserving Decisions

**What goes wrong:** Long sessions appear to work until the runtime forgets constraints, IDs, user preferences, artifact references, or prior decisions. OpenAI's session memory guidance calls out abrupt loss, user-visible amnesia, and token spikes from large recent tool payloads as risks of naive last-N trimming.

**Why it happens:** Context management is often added after the API works. Then "trim old messages" becomes the default because it is simple.

**Warning signs:**
- Context compaction is based only on message count or token count.
- Summaries have no citations back to artifacts, turns, or tool results.
- Archived raw artifacts cannot be rehydrated into a new context pack.
- The runtime cannot explain why a prior constraint was kept or dropped.

**Prevention strategy:**
- In Phase 3, split context into live context, compressed summary, pinned facts/decisions, and archived raw artifacts.
- Summaries must carry provenance links to session turns and artifact ids.
- Make compaction threshold, summarizer model, summary version, dropped items, and pinned items part of the execution plan.
- Support developer-provided retention rules: "never drop policy constraints", "pin customer ID", "preserve artifact references", "summarize tool outputs but keep raw result in archive".

**Phase to address:** Phase 3: Context And Sessions.

**Testing and validation implication:**
- Long-session tests should include changing user goals, durable IDs, conflicting newer constraints, large tool payloads, PDFs, screenshots, and audio transcripts.
- Compare compressed-context answers against full-context oracle cases.
- Regression tests must assert provenance links from summary claims to original artifacts or turns.

### 6. Mixing Session State, Run State, Context State, And Provider State

**What goes wrong:** Branching, replay, nested runs, retry, and user-visible history become inconsistent because the runtime has one mutable "conversation" object that contains app context, provider response IDs, artifacts, summaries, and tool state.

**Why it happens:** Provider SDKs expose convenient state handles. OpenAI Agents SDK documentation explicitly separates local run context from conversation state and warns about serialized runtime metadata, which is a signal that Lattice needs its own state boundaries.

**Warning signs:**
- `session` contains provider-specific IDs as primary state.
- `runContext` or equivalent holds secrets that may later be serialized.
- Replaying a run mutates the live session.
- Branches share mutable artifact or summary state.

**Prevention strategy:**
- In Phase 3, define separate objects: `Session` for user continuity, `Run` for one execution, `ContextPack` for model input, `ProviderAttempt` for external calls, `ArtifactStore` for canonical artifacts, and `ExecutionPlan` for audit.
- Make branches copy-on-write at the plan/context layer and reference immutable artifacts.
- Keep provider state as attempt metadata, never as the source of truth.
- Add serialization rules that forbid secrets and mark sensitive metadata.

**Phase to address:** Phase 3: Context And Sessions.

**Testing and validation implication:**
- Tests must cover branch -> run -> replay without mutating the parent session.
- Nested run tests should verify that local context does not leak across sibling runs.
- Serialization tests should reject secrets or unredacted provider credentials in stored run state.

### 7. Designing Replay As "Run The Prompt Again"

**What goes wrong:** Replay cannot reproduce or diagnose failures because the original model version, resolved provider, context pack, transformed files, signed URLs, tool outputs, upload IDs, fallback path, and warnings are gone.

**Why it happens:** Replay is often scoped to prompts and model output. For Lattice, the interesting behavior is in routing, packaging, context packing, and artifact transformations.

**Warning signs:**
- Replay only stores input messages and final text.
- There is no offline replay mode using captured provider responses.
- The plan does not include adapter versions, transform parameters, or artifact hashes.
- Replaying a failed file run requires the original URL to still be live.

**Prevention strategy:**
- In Phase 5, define a replay envelope: Lattice version, adapter versions, input artifact ids/hashes, transform lineage, context pack, provider payloads after redaction, resolved model/provider ids, policy, routing score, fallback attempts, request ids, timing, warnings, errors, and output artifacts.
- Support two modes: deterministic inspection replay using recorded responses and live rerun replay with explicit "external calls may differ" warnings.
- Store enough redacted payload metadata to debug without leaking raw sensitive files by default.

**Phase to address:** Phase 5: Replay And Observability.

**Testing and validation implication:**
- Golden replay fixtures must reproduce execution plans without network access.
- Rerun tests should diff original and new plans, including changed model versions, changed file packaging, changed costs, and changed fallbacks.
- Failure replay tests should cover expired URLs, failed upload, context-window fallback, and streaming interruption.

### 8. Underestimating Multimodal Token, Cost, And Latency Behavior

**What goes wrong:** The router chooses a model under an invalid budget, context packing overflows after file expansion, or a "cheap" document route becomes expensive because pages are converted into images. Anthropic documents that PDF costs depend on extracted text and page images; OpenAI documents spreadsheet-specific augmentation and partial row handling; image detail settings and audio tokens introduce more provider-specific accounting.

**Why it happens:** Token estimates for text are easier than estimates for PDFs, images, audio, video, and tool outputs. Providers also return different usage fields.

**Warning signs:**
- Cost estimates are based only on prompt text tokenization.
- PDF/page/image/audio budgets are not visible in the plan.
- The router does not reconcile estimated vs actual usage after a run.
- Large recent tool outputs are stuffed into context without token budgeting.

**Prevention strategy:**
- In Phase 2, attach estimated cost/token/latency metadata to each packaging strategy and transform.
- In Phase 4, route using budget bands and confidence levels, not exact fake precision.
- In Phase 5, reconcile actual usage and cost returned by providers into the plan and surface estimate error.
- Give developers warnings such as "visual PDF route may exceed budget; split or use retrieval".

**Phase to address:** Phase 2: Provider Packaging, Phase 4: Deterministic Routing, Phase 5: Replay And Observability.

**Testing and validation implication:**
- Budget tests must include dense PDF, image-detail low/high, audio transcription, large JSON tool output, and spreadsheet files.
- Tests should assert both pre-run estimate and post-run reconciliation fields.
- Routing tests should reject routes whose worst-case estimate violates policy.

### 9. Losing Visual Or Structured Information During Preprocessing

**What goes wrong:** The runtime "supports documents" but strips embedded charts, screenshots, layout, handwritten notes, scanned pages, or tables before model input. OpenAI's file input docs note that non-PDF documents do not extract embedded images/charts into model context; Anthropic's PDF support processes pages as text plus images but has size/page/context constraints.

**Why it happens:** Text extraction is cheaper and easier than preserving visual evidence. It can be correct for some tasks and disastrous for work-inbox tasks that depend on screenshots, forms, tables, and diagrams.

**Warning signs:**
- DOCX, PPTX, spreadsheet, and PDF paths all share one text extractor.
- Transforms are automatic and not visible to the developer.
- The output can cite a file but not the page/region/evidence artifact.
- There is no way to ask for "must preserve visuals".

**Prevention strategy:**
- In Phase 2, make preprocessing explicit: text extraction, PDF conversion, OCR, page image extraction, table extraction, audio transcription, video frame extraction, and downsampling are named transforms with warnings.
- Add task policies: `preserveVisuals`, `allowLossyTransforms`, `requireCitations`, and `maxTransformCost`.
- For the showcase, include visually meaningful fixtures: screenshot with small text, chart in a PDF, image embedded in a rich document, rotated scan, and a table-heavy PDF.

**Phase to address:** Phase 2: Provider Packaging; prove in Phase 6 showcase.

**Testing and validation implication:**
- Fixtures should assert warnings when visual content is dropped.
- Tests should compare text-only extraction vs visual-preserving route for chart/table questions.
- UAT for the work inbox must include documents where visual evidence changes the answer.

### 10. Treating Outputs As Plain Text Plus Optional JSON

**What goes wrong:** Generated images, speech, transcripts, structured actions, tool results, citations, and intermediate files cannot be reused because the runtime only returns `text` and maybe `json`. AI SDK image generation can return files, while some multimodal LLM image flows return files or tool results depending on provider/model path.

**Why it happens:** The first demo often returns text. Lattice's value depends on making outputs first-class artifacts too.

**Warning signs:**
- `run()` returns `{ text, data }` without typed output artifacts.
- Streaming output has no stable event model for artifact creation.
- Tool results are hidden in provider-specific response structures.
- Structured JSON is not validated against the declared output contract.

**Prevention strategy:**
- In Phase 1, define typed output contracts: text, JSON schema, artifact, audio, image, transcript, citation set, tool result, and composite outputs.
- Make output artifacts share the same artifact lifecycle as inputs.
- In Phase 5, make streaming events include stage start/finish, token deltas, tool calls, artifact-created, warnings, and fallback events.

**Phase to address:** Phase 1: Runtime Contracts; Phase 5: Replay And Observability.

**Testing and validation implication:**
- Schema tests should fail on invalid structured action output.
- Streaming tests should verify partial text, final JSON, and artifact-created events arrive in coherent order.
- Provider adapter fixtures must normalize generated files and tool results into Lattice output artifacts.

### 11. Making Inspectability An Afterthought

**What goes wrong:** The product promise says "Lattice handles routing and explains the plan", but the plan only appears after execution or only in logs. Developers cannot understand why a model was chosen, why a file was transformed, why context was dropped, or why cost changed.

**Why it happens:** Routing, packaging, and compaction are often implemented as internal helpers first; plan schema arrives later and has to reverse-engineer decisions.

**Warning signs:**
- No `dryRun` or preflight plan.
- The plan cannot be serialized without provider-specific objects.
- Warnings are console logs instead of structured plan fields.
- Tests verify final output but not plan contents.

**Prevention strategy:**
- In Phase 1, make `ExecutionPlan` a core return type and internal contract.
- Add preflight planning: validate task, artifacts, outputs, policy, candidate routes, context budget, and packaging warnings before external model calls.
- In Phase 4, require every route score to decompose into capability, policy, budget, latency, privacy, and fallback considerations.
- In Phase 5, connect plan spans to telemetry while keeping the plan usable without an observability vendor.

**Phase to address:** Phase 1: Runtime Contracts and Phase 4: Deterministic Routing.

**Testing and validation implication:**
- Unit tests must snapshot plans for success, no-route, fallback, context compression, and file transform cases.
- UAT should require a developer to diagnose an intentional bad route using only the plan.

### 12. Logging Sensitive Artifacts Into Traces And Replay Files

**What goes wrong:** Debuggability leaks screenshots, PDFs, transcripts, prompts, credentials, signed URLs, or user data into local logs, telemetry backends, replay snapshots, or serialized run context. OpenAI Agents SDK context docs warn against putting secrets in serialized run context. AI SDK telemetry and DevTools are useful, but DevTools is local-development only and telemetry is opt-in.

**Why it happens:** Teams add observability by dumping request and response bodies. Multimodal artifacts raise the blast radius because payloads can be large and sensitive.

**Warning signs:**
- Trace spans contain raw base64, full transcripts, or signed URLs.
- Replay snapshots are committed as fixtures without redaction.
- Secrets are accepted in context objects without classification.
- DevTools-like middleware is usable in production by default.

**Prevention strategy:**
- In Phase 5, define redaction classes for artifact bytes, signed URLs, provider IDs, credentials, prompts, transcripts, and output content.
- Make tracing sinks opt-in and redacted by default; require explicit developer override for raw payload capture.
- Store replay metadata and hashes by default, with separate encrypted/raw artifact retention only when configured.
- Add serialization guards that reject secrets in run/session context.

**Phase to address:** Phase 5: Replay And Observability, with serialization rules started in Phase 3.

**Testing and validation implication:**
- Snapshot tests should scan trace/replay output for base64 blobs, signed URLs, API keys, and raw binary payloads.
- Security tests should verify redaction on failure paths, not just success paths.
- Include a "secret in user artifact" fixture and assert it is not emitted to telemetry by default.

### 13. Overbuilding Provider Adapters Instead Of A Conformance Harness

**What goes wrong:** The project spends months adding provider breadth while the runtime invariants remain soft. Each adapter implements slightly different artifact, context, routing, error, and output behavior.

**Why it happens:** Provider count is an easy progress metric. Lattice's differentiator is not "100 adapters"; the project context explicitly says provider breadth should initially lean on existing provider/routing surfaces where practical.

**Warning signs:**
- New providers are added before two providers pass the same multimodal conformance suite.
- Adapter code owns routing or artifact semantics.
- Provider-specific behavior leaks into the public API.
- There is no fixture-driven adapter contract.

**Prevention strategy:**
- In Phase 2, support only enough providers to exercise the invariant surface: one strong text/tool/structured route, one strong multimodal file route, and one speech/transcription or image route as needed for the showcase.
- Create adapter conformance tests before adding a third provider family.
- Treat LiteLLM/Vercel AI SDK/OpenAI-compatible surfaces as acceleration layers, not as Lattice's internal model.

**Phase to address:** Phase 2: Provider Packaging.

**Testing and validation implication:**
- Every adapter must pass the same fixtures for packaging, warnings, output normalization, errors, cost reconciliation, and replay metadata.
- Do not add a provider unless it passes core fixture classes or has explicit unsupported capability declarations.

### 14. Hiding Provider-Specific Controls Until They Become Breaking API Changes

**What goes wrong:** Developers need image detail, prompt caching, reasoning effort, PDF citations, safety settings, or provider-specific file controls, but Lattice's tiny API has nowhere to put them. Later, the API grows ad hoc escape hatches that break the clean capability-first model.

**Why it happens:** "Small API" can be mistaken for "no advanced controls". AI SDK shows provider options can apply at function, message, and message-part levels; Anthropic PDF guidance recommends ordering PDFs before text and prompt caching repeated analysis.

**Warning signs:**
- All provider options are passed through as one untyped `options` bag.
- Provider-specific settings cannot attach to a specific artifact or message part.
- Unsupported options are silently dropped.
- The beginner API and advanced API are separate worlds.

**Prevention strategy:**
- In Phase 1, define scoped metadata and policy overrides at run, artifact, output, and provider-attempt levels.
- Keep common capability controls provider-neutral, but allow namespaced provider options behind progressive disclosure.
- Validate provider options by adapter and emit structured warnings for ignored or incompatible options.

**Phase to address:** Phase 1: Runtime Contracts; Phase 2 adapter validation.

**Testing and validation implication:**
- Type tests should prove common use cases do not require provider options.
- Adapter tests should verify part-level options such as image detail or cache controls are either applied or warned.
- Compatibility tests should reject provider options on the wrong provider namespace.

### 15. Deferring Security Boundaries For Tool And File Execution

**What goes wrong:** Files and tools are processed inside the same process that holds API keys, local file access, or customer credentials. Prompt injection or malicious file content can influence tool calls, exfiltrate secrets, or poison persistent memory. OpenAI's 2026 Agents SDK update emphasizes separating harness from compute, controlled workspaces, externalized state, snapshotting, and keeping credentials away from model-generated code execution.

**Why it happens:** SDKs start in-process for ergonomics. Multimodal work inboxes quickly involve untrusted PDFs, screenshots, audio transcripts, and tool outputs.

**Warning signs:**
- Tool execution and file preprocessing run with ambient environment credentials.
- Untrusted document text is merged into system/developer instructions.
- Memory updates are accepted from model output without provenance or approval.
- Sandboxing is considered only for hosted control plane work.

**Prevention strategy:**
- In Phase 3, tag all context as trusted instruction, developer data, user artifact, tool output, or model-generated summary.
- In Phase 5 or earlier for any executable tools, isolate tool execution from provider keys and use explicit input/output directories.
- Add prompt-injection handling rules for artifacts: never let artifact text override developer/system policy; quote or delimit extracted content; record trust level in context packs.
- Keep MCP/tool integration permissioned and auditable rather than inventing an implicit plugin surface.

**Phase to address:** Phase 3: Context And Sessions for trust labeling; Phase 5: Replay And Observability for audit; any tool-execution phase before release.

**Testing and validation implication:**
- Include malicious PDF/screenshot/transcript fixtures that try to override instructions or exfiltrate secrets.
- Tests should assert trust labels survive extraction, summarization, and replay.
- Tool tests should verify no ambient secrets are available to untrusted execution paths.

## Moderate Pitfalls

### 16. Modeling Streaming As Text Delta Only

**What goes wrong:** Long-running multimodal stages, file uploads, tool calls, generated artifacts, speech chunks, fallbacks, and warnings cannot be represented in a stream. Developers get a text stream but no usable execution lifecycle.

**Prevention strategy:** In Phase 5, define a typed event stream: `run.started`, `stage.started`, `context.packed`, `provider.attempt.started`, `token.delta`, `tool.call`, `artifact.created`, `warning`, `fallback`, `stage.finished`, `run.finished`, `run.failed`.

**Phase to address:** Phase 5: Replay And Observability.

**Testing and validation implication:** Simulate interrupted streams, fallback mid-run, artifact generation, and cancellation. Verify final result can be reconstructed from stream events.

### 17. No Idempotency Or Cleanup For Uploads And Retries

**What goes wrong:** Retries duplicate provider file uploads, stale uploaded files accumulate, and replay points at expired or deleted provider handles.

**Prevention strategy:** In Phase 2, key uploads by artifact hash plus provider target plus transport parameters, and track expiration/deletion status. In Phase 5, include cleanup hooks and replay warnings for expired handles.

**Phase to address:** Phase 2 and Phase 5.

**Testing and validation implication:** Retry tests should prove identical artifacts reuse upload metadata when policy allows; cleanup tests should delete or expire handles without deleting canonical artifacts.

### 18. Showcase Fixtures Are Too Happy-Path

**What goes wrong:** The work inbox demo proves only "text plus a clean PDF" and misses the hard cases that justify Lattice: screenshots, voice notes, bad scans, ambiguous routing, policy constraints, and replay after failure.

**Prevention strategy:** Phase 6 should be driven by adversarial fixtures from earlier phases: mixed screenshot plus PDF, audio plus transcript mismatch, dense PDF, chart-dependent answer, privacy-constrained route, context compaction, and fallback.

**Phase to address:** Phase 6: Work Inbox Showcase.

**Testing and validation implication:** UAT should require the showcase to expose the execution plan and prove artifact reuse, context packing, route choice, and replay on real mixed inputs.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Runtime Contracts | API looks tiny but hides no durable model | Define `Artifact`, output contracts, and `ExecutionPlan` before adapters |
| Provider Packaging | Adapter code becomes the product | Build conformance fixtures and transport planner first |
| Context And Sessions | Session becomes a mutable grab bag | Separate session, run, context pack, provider attempt, artifact store, and plan |
| Deterministic Routing | Fallbacks optimize availability at the cost of policy | Enforce fallback envelopes and route explanation snapshots |
| Replay And Observability | Debugging leaks sensitive multimodal payloads | Redacted-by-default traces and replay envelopes |
| Work Inbox Showcase | Demo bypasses runtime abstractions | Showcase must use public API and include adversarial multimodal fixtures |

## Roadmap Guardrails

1. Do not start the showcase until Phase 1 has a stable `Artifact` and `ExecutionPlan` schema.
2. Do not add broad provider coverage until two provider families pass the same adapter conformance suite.
3. Do not implement fallback without policy envelopes, visible attempt history, and no-route behavior.
4. Do not ship context compaction without provenance links and raw artifact rehydration.
5. Do not ship replay or telemetry without redaction tests.
6. Do not present "file support" as complete unless transport, MIME, visual preservation, provider retention, and cleanup are represented in the plan.

## Sources

Official documentation and current ecosystem sources used:

- [Lattice project context](../PROJECT.md) - HIGH confidence for product constraints and required runtime shape.
- [Vercel AI SDK Prompts](https://ai-sdk.dev/docs/foundations/prompts) - HIGH confidence for multimodal message parts, model capability caveats, and provider-option scopes.
- [Vercel AI SDK Provider & Model Management](https://ai-sdk.dev/docs/ai-sdk-core/provider-management) - HIGH confidence for provider registry, aliases, model limits, and fallback provider patterns.
- [Vercel AI SDK Image Generation](https://ai-sdk.dev/docs/ai-sdk-core/image-generation) - HIGH confidence for image outputs as files and provider/model-specific image settings.
- [Vercel AI SDK Telemetry](https://ai-sdk.dev/docs/ai-sdk-core/telemetry) and [DevTools](https://ai-sdk.dev/docs/ai-sdk-core/devtools) - HIGH confidence for opt-in telemetry and local-only DevTools constraints.
- [LiteLLM Router docs](https://docs.litellm.ai/docs/routing) - HIGH confidence for routing strategies, retries, cooldowns, rate-limit/latency/cost routing tradeoffs.
- [LiteLLM Fallbacks docs](https://docs.litellm.ai/docs/proxy/reliability) - HIGH confidence for distinct fallback categories and testing fallback paths.
- [OpenAI File Inputs](https://developers.openai.com/api/docs/guides/file-inputs) - HIGH confidence for file input transports, endpoint differences, document extraction behavior, and spreadsheet augmentation.
- [OpenAI Agents SDK Context Management](https://openai.github.io/openai-agents-js/guides/context/) - HIGH confidence for separating run context from conversation state and avoiding secrets in serialized state.
- [OpenAI Cookbook: Session Memory](https://developers.openai.com/cookbook/examples/agents_sdk/session_memory) - MEDIUM-HIGH confidence for practical trimming/compression risks and session-memory techniques.
- [OpenAI Agents SDK 2026 update](https://openai.com/index/the-next-evolution-of-the-agents-sdk/) - MEDIUM-HIGH confidence for harness/compute separation, controlled workspaces, snapshotting, and rehydration direction.
- [LangGraph Memory docs](https://docs.langchain.com/oss/python/langgraph/add-memory) - HIGH confidence for short-term vs long-term memory and checkpoint/history patterns.
- [Anthropic PDF support](https://platform.claude.com/docs/en/build-with-claude/pdf-support) - HIGH confidence for PDF size/page/context constraints, visual PDF behavior, Files API usage, and prompt caching recommendations.
- [Google Gemini API file limit update](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-api-new-file-limits/) - MEDIUM confidence for ecosystem trend that file transport is shifting toward URLs/cloud registration and larger inline files.

## Gaps And Follow-Up Research

- Context7 was not available in this runtime, so library-specific details were verified through official docs and current web search rather than Context7.
- Provider retention and deletion semantics should be researched per provider during Phase 2 before finalizing upload cleanup guarantees.
- MCP-specific tool/resource security should get its own phase research before implementing tool integration beyond basic MCP compatibility.
- Audio/video transport and speech output need deeper provider-by-provider research before the showcase commits to optional speech beyond a narrow supported path.
