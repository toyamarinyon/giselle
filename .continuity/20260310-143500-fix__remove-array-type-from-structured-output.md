# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Remove array type from End Node structured output type dropdown because UI/runtime semantics mismatch: UI shows per-item mapping but runtime only supports direct array mapping.

## Goal (incl. success criteria)

- Hide `array` from the End Node structured output type picker (same mechanism as `enum`).
- Remove the `items` path fallback in `buildValueFromSubSchema` `case "array"`.
- Delete the corresponding test for items path mapping.
- All existing tests pass; no type errors introduced.

## Constraints/Assumptions

- Existing data with items path mappings will stop working, but this is acceptable because the feature was already broken (type mismatch caused silent `{}` output).
- `convertFieldSourceMappingToPropertyMappings` array branches are kept for backward compatibility.

## Key decisions

- Array type hidden via `excludeTypes` prop (same pattern as enum).
- Items path fallback removed entirely rather than deprecated.

## State

- All three changes implemented and verified.

## Done

- Added `"array"` to `excludeTypes` in `structured-output-dialog.tsx`.
- Simplified `case "array"` in `build-object.ts` to direct mapping only.
- Removed `"maps array values from mapping path ending with items"` test.
- `pnpm format` — clean.
- `pnpm build-sdk` — success.
- `pnpm check-types` — success (31/31 packages).
- `vitest run build-object.test.ts` — 25 tests passed.

## Now

- Implementation complete. Ready for commit.

## Next

- (none)

## Open questions (UNCONFIRMED if needed)

- (none)

## Working set (files/ids/commands)

- `internal-packages/workflow-designer-ui/src/editor/properties-panel/end-node-properties-panel/structured-output-dialog.tsx`
- `packages/giselle/src/tasks/build-object.ts`
- `packages/giselle/src/tasks/build-object.test.ts`
