# Phase 6 Research: Work Inbox Showcase

## Implementation Notes

- The showcase should import from the built public package entrypoint to prove exports.
- A fake provider keeps CI and local execution deterministic.
- Fixtures can stand in for image/audio/PDF bytes while preserving artifact modality, metadata, privacy, and routing behavior.

## Validation Architecture

- `pnpm example:work-inbox` builds the package and runs the example.
- The output includes selected route, context pack, packaging warnings, run result, and offline replay.
