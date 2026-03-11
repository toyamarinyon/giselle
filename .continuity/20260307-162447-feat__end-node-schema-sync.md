# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- When the output schema of a text generation node changes, synchronize the End node's mapping target schema accordingly.
- Introduce a robust update process that is compatible with the existing behavior of `use-update-node-output-and-sync-end-node.ts`.

## Goal (incl. success criteria)

- Implement `syncEndNodeOutput` with recursive synchronization based on the traversal logic from `build-object.ts`.
- Ensure source property renames, type updates, and mapping removal on missing sources are covered by tests.
- From the caller's perspective, update the End node when changes exist and return `null` when there are no changes.

## Constraints/Assumptions

- Respect the existing `EndOutput`, `PropertyMapping`, `Schema`, and `SubSchema` types.
- Only target source mappings where `sourceNodeId` matches.
- Do not modify existing UI or persistence logic.

## Key decisions

- Reuse `isEqualPath` and `findMappingAtSchemaPath` similar to `build-object.ts`.
- For each mapping, determine whether the source schema matches and update `subSchema` / `mappings` accordingly (equivalent to `resolveSubSchema`).
- Incrementally update the mappings array during recursion; `syncEndNodeOutput` returns the updated result only when there is a diff, otherwise `null`.

## State

- No existing ledger was found for this branch, so a new branch ledger was created.

## Done

- Implemented `sync-end-node-output.ts` (formerly `sync-end-node-schema.ts`).
- Verified `sync-end-node-output.test.ts` and implemented logic covering 4 specification cases.
- Added `sync-end-node-output` and `use-update-node-output-and-sync-end-node` exports to `usecases/index.ts`.
- Fixed TS7022 by adding `SubSchema | undefined` type annotation to the `next` variable in `navigateSchemaPath`.
- Added `array` type + `"items"` segment handling to `navigateSchemaPath` (equivalent coverage to `navigateObjectPath` in `build-object.ts`).
- Aligned the `array` case in `syncSubSchema` with `buildValueFromSubSchema` in `build-object.ts`: use `findMappingAtSchemaPath` for a single-level items mapping lookup instead of recursive traversal.
- Ran `pnpm format` / `pnpm build-sdk` / `pnpm check-types` / `pnpm tidy` / `pnpm test` — all branch changes passed.
  - `check-types` for `studio.giselles.ai` failed due to pre-existing unresolved module errors for `@giselles-ai/agent-builder/next-server` and `@giselles-ai/agent-runtime` (unrelated to this change).
- Extended the return value of `syncEndNodeOutput` to `SyncEndNodeOutputResult = { output, removedMappings }`.
- Added `useToasts` to `useUpdateNodeOutputAndSyncEndNode` to display a warning toast when `removedMappings.length > 0`.
- Updated tests for the new return value. Added `removedMappings` assertions to mapping removal tests.
- Added concise comments to `resolveSubSchema` (whole object / single property / stale mapping removal / source found).
- Renamed `syncEndNodeSchema` → `syncEndNodeOutput` and `SyncEndNodeSchemaResult` → `SyncEndNodeOutputResult`. Also renamed files from `sync-end-node-schema.*` → `sync-end-node-output.*`.
- Updated both `advanced-options.tsx` files (for `text-generation-node-properties-panel` and `text-generation-node-properties-panel-v2`) to replace `useUpdateNodeDataContent` with `useUpdateNodeOutputAndSyncEndNode`, wiring the new sync hook into the output format change handler.
- When a stale single-property mapping is removed, reset `subSchema` to `{ type: "string" }` only for upstream-only types (enum and array). User-configurable types (`number`, `boolean`, plain `string`, `object`) are preserved as-is. Added tests: enum resets, array resets, number stays.

## Now

- When a single-property mapping becomes stale, enum and array types (upstream-only) are reset to `{ type: "string" }`. User-configurable types are preserved.
- Refactored JSON→text format switch handler to reuse `syncEndNodeOutput` with an empty schema instead of inline stale-mapping cleanup. Added empty-source guard to whole node mapping branch in `resolveSubSchema` so it removes the mapping and resets to string.

## Next

- Awaiting commit.

## Open questions (UNCONFIRMED if needed)

- Behavior when `source.path` points to elements inside arrays is out of scope for now. Extend in the future if needed.
- If existing workspace data has End node schemas without `properties`, a data-mod migration may be required.

## Working set (files/ids/commands)

- `internal-packages/workflow-designer-ui/src/app-designer/store/usecases/sync-end-node-output.ts`
- `internal-packages/workflow-designer-ui/src/app-designer/store/usecases/sync-end-node-output.test.ts`
- `internal-packages/workflow-designer-ui/src/app-designer/store/usecases/index.ts`
- `internal-packages/workflow-designer-ui/src/app-designer/store/usecases/use-update-node-output-and-sync-end-node.ts`
- `internal-packages/workflow-designer-ui/src/editor/properties-panel/text-generation-node-properties-panel/advanced-options.tsx`
- `internal-packages/workflow-designer-ui/src/editor/properties-panel/text-generation-node-properties-panel-v2/advanced-options.tsx`
