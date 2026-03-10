# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Remove array type from End Node structured output type dropdown because UI/runtime semantics mismatch: UI shows per-item mapping but runtime only supports direct array mapping.

## Goal (incl. success criteria)

- Hide `array` from the End Node structured output type picker (same mechanism as `enum`).
- Remove the `items` path fallback in `buildValueFromSubSchema` `case "array"`.
- Delete the corresponding test for items path mapping.
- Remove dead array-items-level code from dialog utility functions.
- All existing tests pass; no type errors introduced.

## Constraints/Assumptions

- No legacy data with items-path mappings exists; backward compatibility is not required.

## Key decisions

- Array type hidden via `excludeTypes` prop (same pattern as enum).
- Items path fallback removed entirely rather than deprecated.
- Dead array-items branches removed from dialog utility functions since arrays are only created via direct mapping (always type-locked, ArrayItems never renders, items never independently mapped).

## State

- All changes implemented and verified.

## Done

- Added `"array"` to `excludeTypes` in `structured-output-dialog.tsx`.
- Simplified `case "array"` in `build-object.ts` to direct mapping only.
- Removed `"maps array values from mapping path ending with items"` test.
- Removed 6 dead array-items branches from `structured-output-dialog.tsx`:
  - `convertFieldSourceMappingToPropertyMappings`: items recursion
  - `convertPropertyMappingsToFieldSourceMapping`: items recursion
  - `hasUnmappedFields`: `field.type === "array"` branch
  - `findFieldById`: items search
  - `replaceFieldById`: items replacement
  - `handleFieldDelete` `collectIds`: items id collection
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
