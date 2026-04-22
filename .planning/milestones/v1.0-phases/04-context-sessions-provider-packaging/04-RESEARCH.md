# Phase 4 Research: Context, Sessions & Provider Packaging

## Implementation Notes

- Sessions should be explicit records with isolated mutation through a store interface.
- Context packs can start with deterministic token estimates and inspectable inclusion decisions, then become richer later.
- Provider adapters should be factories over generic client/fetch objects so core stays dependency-light.
- Packaging must record transport choices and lineage even when the provider call remains fake or wrapped.

## Validation Architecture

- Tests verify session persistence, context pack records, provider packaging decisions, and OpenAI-compatible adapter wrapping.
