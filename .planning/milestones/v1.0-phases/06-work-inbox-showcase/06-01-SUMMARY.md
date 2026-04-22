---
phase: 06-work-inbox-showcase
plan: 01
requirements-completed: [DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05]
completed: 2026-04-22
---

# Phase 06 Plan 01 Summary

- Added `examples/work-inbox/index.mjs`, an executable public API example.
- Added fixtures for customer message, package photo evidence, call transcript, return policy PDF text, dense policy, and privacy-constrained replay cases.
- Added root `pnpm example:work-inbox` script that builds `lattice` and runs the example.
- The example prints selected route, context pack, packaging warnings, run result, and offline replay outputs.

## Verification

- `pnpm example:work-inbox` passed.
- `pnpm --filter lattice lint:packages` passed.
