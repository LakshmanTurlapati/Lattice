# Phase 5 Research: Tools, Replay & Observability

## Implementation Notes

- Standard Schema is enough for local tool input validation without requiring users to learn AJV.
- Tool result artifacts preserve auditability and match earlier artifact requirements.
- Replay should prefer plans/events/artifact refs over raw provider bodies and raw artifact bytes.
- Redaction must be default-on for credentials, signed URLs, transcripts, and raw bodies.

## Validation Architecture

- Tests cover local tools, MCP-like imports, replay envelope creation, offline replay, and redaction.
