# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Implement the AI-assisted structured output schema generation feature from the approved plan and keep it behind the existing `structuredOutput` feature flag.

## Goal (incl. success criteria)

- Add a `generateObject` API across Giselle core, HTTP routing, React client, and Studio internal actions.
- Expose a “Generate” flow in both Structured Output dialogs so users can create schemas from prompt text.
- Reuse `Schema` protocol type and existing structured output integration paths with minimal UI friction.

## Constraints/Assumptions

- Keep changes feature-flagged by `structuredOutputFlag`.
- Use AI SDK v5 `generateObject` via `@ai-sdk/gateway` with the existing JSON schema shape.
- Follow existing architecture and naming conventions without broad refactors.

## Key decisions

- Moved generation logic to `packages/giselle/src/structured-output/generate-object.ts` (from `generate-object/index.ts`). Directory name `structured-output/` aligns with `packages/protocol/src/structured-output.ts` for codebase-wide naming consistency.
- Gateway headers are intentionally hardcoded without user billing (`stripe-customer-id`) — schema generation is billed to Giselle, not the user.
- Function intentionally does not use `context` since it needs no storage, callbacks, or config.
- Reused existing `Schema` protocol model as the structured schema contract for both server and client layers.

## State

- Core API entrypoints and wiring are added through to Studio client plumbing.
- UI Generate button moved to footer-left with Popover-based prompt input in both dialogs.

## Done

- Added `generateObject` export on `Giselle` in `packages/giselle/src/giselle.ts`.
- Added `generateObject` JSON route in `packages/http/src/router.ts`.
- Extended `packages/react/src/giselle-client.ts` with a `generateObject` method signature.
- Added Studio server action `apps/studio.giselles.ai/lib/internal-api/generate-object.ts` with feature flag gating.
- Re-exported and wired new action in:
  - `apps/studio.giselles.ai/lib/internal-api/index.ts`
  - `apps/studio.giselles.ai/lib/internal-api/create-giselle-client.ts`
- Updated `internal-packages/workflow-designer-ui/src/editor/properties-panel/structured-output/structured-output-dialog.tsx` with:
  - Generate button (with Sparkles icon) in footer-left
  - Popover with prompt textarea + Create button (opens on Generate click)
  - Schema population from generated result
- Updated end-node structured output dialog with identical Generate/Popover UX:
  - `internal-packages/workflow-designer-ui/src/editor/properties-panel/end-node-properties-panel/structured-output-dialog.tsx`
- Moved `generate-object/index.ts` → `structured-output/generate-object.ts` to align with protocol naming.
- Renamed "Title" label to "Name" in the simple structured output dialog for consistency with end-node dialog.
- Extracted shared `SchemaGeneratePopover` component from duplicated Popover code in both dialogs:
  - New file: `structured-output/schema-generate-popover.tsx` — encapsulates prompt state, popover open state, and all Popover UI.
  - Both dialogs now pass only `isGenerating` and `onGenerate` callback.
  - Removed ~70 lines of duplicated JSX from each dialog.

## Now

- Quality checks passed (`pnpm format`, `pnpm build-sdk`, `pnpm check-types`).

## Next

- Verify the generate flow end-to-end.

## Open questions (UNCONFIRMED if needed)

- None blocking for implementation completion.

## Working set (files/ids/commands)

- `packages/giselle/src/giselle.ts`
- `packages/http/src/router.ts`
- `packages/react/src/giselle-client.ts`
- `apps/studio.giselles.ai/lib/internal-api/generate-object.ts`
- `apps/studio.giselles.ai/lib/internal-api/index.ts`
- `apps/studio.giselles.ai/lib/internal-api/create-giselle-client.ts`
- `internal-packages/workflow-designer-ui/src/editor/properties-panel/structured-output/structured-output-dialog.tsx`
- `internal-packages/workflow-designer-ui/src/editor/properties-panel/structured-output/schema-generate-popover.tsx`
- `internal-packages/workflow-designer-ui/src/editor/properties-panel/end-node-properties-panel/structured-output-dialog.tsx`
- `packages/giselle/src/structured-output/generate-object.ts`
