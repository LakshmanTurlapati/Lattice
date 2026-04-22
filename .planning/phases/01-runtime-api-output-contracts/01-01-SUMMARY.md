---
phase: 01-runtime-api-output-contracts
plan: 01
subsystem: package-scaffold
tags: [typescript, pnpm, tsdown, vitest, esm, package-contracts]

# Dependency graph
requires: []
provides:
  - Local pnpm workspace package named lattice
  - ESM-first package export map targeting dist/index.js and dist/index.d.ts
  - Strict TypeScript 6 configuration and scaffold source entrypoint
  - Repeatable build, typecheck, runtime test, type-test, and package-lint scripts
affects: [runtime-api-output-contracts, artifact-lifecycle-storage, deterministic-planning-execution]

# Tech tracking
tech-stack:
  added: [pnpm, typescript, tsdown, vitest, tsd, publint, attw, changesets, standard-schema]
  patterns:
    - ESM-first package with explicit exports
    - Strict shared tsconfig inherited by package configs
    - Package declaration verification through tsd

key-files:
  created:
    - package.json
    - pnpm-workspace.yaml
    - pnpm-lock.yaml
    - tsconfig.base.json
    - .gitignore
    - packages/lattice/package.json
    - packages/lattice/tsconfig.json
    - packages/lattice/tsdown.config.ts
    - packages/lattice/vitest.config.ts
    - packages/lattice/src/index.ts
    - packages/lattice/test/scaffold.test.ts
    - packages/lattice/test-d/index.test-d.ts
  modified: []

key-decisions:
  - "Use local package name lattice with named exports prepared through an explicit ESM export map."
  - "Set tsdown fixedExtension to false so emitted files match the package export contract."
  - "Use Vitest runtime/typecheck plus tsd declaration tests for repeatable scaffold verification."

patterns-established:
  - "Root workspace scripts delegate package checks through pnpm recursive/filter commands."
  - "Generated dependency and build output is ignored; pnpm-lock.yaml is tracked."

requirements-completed: [API-01]

# Metrics
duration: 6min
completed: 2026-04-22
---

# Phase 01 Plan 01: TypeScript Package Scaffold Summary

**ESM-first pnpm workspace package named `lattice` with strict TypeScript 6, tsdown build output, Vitest smoke coverage, and package declaration checks**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-22T15:33:38Z
- **Completed:** 2026-04-22T15:39:21Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Created the root pnpm workspace metadata, catalogs, Node `>=24` engine constraint, and root scripts.
- Created the local `lattice` package with ESM-only exports, `@standard-schema/spec`, strict package scripts, and no provider SDK dependencies.
- Added strict TypeScript, tsdown, Vitest, runtime smoke test, and tsd declaration smoke test scaffolding.
- Verified package build output resolves through `packages/lattice/dist/index.js` and `packages/lattice/dist/index.d.ts`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create workspace and package metadata** - `0ddf145` (feat)
2. **Task 2: Create TypeScript, build, and test scaffold** - `ecac2af` (feat)

## Files Created/Modified

- `package.json` - Root workspace metadata, scripts, engine, package manager, and dev dependencies.
- `pnpm-workspace.yaml` - Workspace package discovery and dependency catalog.
- `pnpm-lock.yaml` - Locked dependency graph for repeatable installs.
- `tsconfig.base.json` - Shared strict TypeScript 6 compiler settings.
- `.gitignore` - Generated dependency, build, and coverage output ignores.
- `packages/lattice/package.json` - Local package manifest, ESM export map, dependencies, and package scripts.
- `packages/lattice/tsconfig.json` - Package TypeScript config covering source, runtime tests, and type tests.
- `packages/lattice/tsdown.config.ts` - ESM build and declaration configuration.
- `packages/lattice/vitest.config.ts` - Node runtime test and typecheck configuration.
- `packages/lattice/src/index.ts` - Temporary public scaffold entrypoint exporting `latticeVersion`.
- `packages/lattice/test/scaffold.test.ts` - Runtime smoke test for the public scaffold export.
- `packages/lattice/test-d/index.test-d.ts` - Declaration smoke test for the built package entrypoint.

## Decisions Made

- Kept the local package name `lattice` to satisfy Phase 1 imports and D-01, leaving public npm name conflict resolution for a later publishing decision.
- Added `fixedExtension: false` to tsdown so the emitted ESM files match the planned export map instead of defaulting to `.mjs` and `.d.mts`.
- Changed the type-test command to `vitest --typecheck --run && tsd` because Vitest 4 treats `vitest typecheck --run` as a test filter, not a typecheck subcommand.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ignored generated install and build output**
- **Found during:** Task 2 (Create TypeScript, build, and test scaffold)
- **Issue:** `pnpm install` generated `node_modules/` directories, and builds generate `dist/`; leaving those untracked would block a clean task commit.
- **Fix:** Added `.gitignore` entries for `node_modules/`, `dist/`, and `coverage/`.
- **Files modified:** `.gitignore`
- **Verification:** `git status --short` no longer reports generated install/build output.
- **Committed in:** `ecac2af`

**2. [Rule 1 - Bug] Matched tsdown output filenames to package exports**
- **Found during:** Plan-level verification
- **Issue:** tsdown emitted `dist/index.mjs` and `dist/index.d.mts`, while the package export map promised `dist/index.js` and `dist/index.d.ts`.
- **Fix:** Added `fixedExtension: false` to `packages/lattice/tsdown.config.ts`.
- **Files modified:** `packages/lattice/tsdown.config.ts`
- **Verification:** `pnpm --filter lattice build && test -f packages/lattice/dist/index.js && test -f packages/lattice/dist/index.d.ts`
- **Committed in:** `ecac2af`

**3. [Rule 1 - Bug] Made the type-test script executable with Vitest 4**
- **Found during:** Additional script verification
- **Issue:** `vitest typecheck --run` was parsed as a file/name filter and exited with no matching tests.
- **Fix:** Changed the script to `vitest --typecheck --run && tsd`, added a `tsd` declaration smoke test, and excluded `test-d` from Vitest runtime discovery.
- **Files modified:** `packages/lattice/package.json`, `packages/lattice/vitest.config.ts`, `packages/lattice/test-d/index.test-d.ts`
- **Verification:** `pnpm --filter lattice test:types`
- **Committed in:** `ecac2af`

---

**Total deviations:** 3 auto-fixed (1 Rule 3, 2 Rule 1)
**Impact on plan:** All fixes preserve the planned scaffold intent and make the declared scripts/export map actually work.

## Issues Encountered

- tsdown's default Node fixed extensions did not match the planned export map. Resolved with `fixedExtension: false`.
- Vitest 4 did not support the planned `vitest typecheck --run` command shape. Resolved by using the supported `--typecheck` flag form.

## Verification

- `pnpm install`
- `pnpm --filter lattice typecheck`
- `pnpm --filter lattice test`
- `pnpm --filter lattice build`
- `test -f packages/lattice/dist/index.js`
- `test -f packages/lattice/dist/index.d.ts`
- `pnpm --filter lattice test:types`
- `pnpm --filter lattice lint:packages`

## Known Stubs

None. `latticeVersion` is an intentional scaffold export from this plan and does not block the package foundation goal.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The `lattice` workspace package is ready for Phase 1 follow-up plans to replace the scaffold entrypoint with public runtime API, output contract, and validation types. No blockers remain for API-02/API-03 or output contract implementation.

## Self-Check: PASSED

- Verified all created key files exist.
- Verified task commits `0ddf145` and `ecac2af` exist in git history.

---
*Phase: 01-runtime-api-output-contracts*
*Completed: 2026-04-22*
