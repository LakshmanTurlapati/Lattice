# Phase 3 Research: Deterministic Planning & Execution Spine

## Implementation Notes

- Deterministic routing can be implemented with an explicit capability catalog derived from configured provider refs/adapters.
- Hard filters should cover modalities, structured output support, context window, provider allow/deny policy, privacy, latency class, and forced provider/model overrides.
- Stable execution plans should be plain JSON: route candidates, selected route, fallback chain, context/packaging warnings, stages, attempts, usage, and artifact refs.
- Fake providers should be first-class provider adapters so tests and examples use the same runtime path as real adapters.

## Validation Architecture

- Unit tests verify `ai.plan(...)`, no-route outcomes, fallback chains, fake execution, and event emission.
- Existing runtime tests remain regression coverage for output validation, artifacts, policy merging, and abort behavior.
