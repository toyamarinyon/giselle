# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Display structured end-node outputs from task detail pages for the `"object"` format path while preserving existing passthrough output behavior.
- Add this work on a branch created from `main`.

## Goal (incl. success criteria)

- Implement structured output rendering for `UITask["finalStep"]` with `format: "object"` and keep passthrough unchanged for `format: "passthrough"`.
- Show object outputs as prettified JSON in task detail page.
- Ensure the branch is based on the latest `main`.

## Constraints/Assumptions

- Use existing `buildObject` and `EndOutput` conventions from `@giselles-ai/giselle` / route API behavior.
- Do not run validation, tests, or checks unless explicitly requested.

## Key decisions

- Changed `UITask["finalStep"]` to a discriminated union (`PassthroughFinalStep | ObjectFinalStep`) with shared `FinalStepBase` interface.
- Reused API route object-output construction logic to build node-id keyed completed generations.
- Created `ObjectOutputView` component in `internal-packages/workflow-designer-ui` to keep `streamdown` dependency in its own package.
- `OutputActions` remains unchanged (generation-based); no separate object actions needed.
- Object format waits for all generations to complete before displaying results (`finishedStepItemsCount < totalStepItemsCount`).
- Both `task-data.ts` and `final-step-output.tsx` use exhaustive `switch` + `never` check on format.

## State

- Branch `feat/task-structured-output-display` is created from `main`.
- `task-data.ts`, `final-step-output.tsx`, `output-actions.tsx` updated.
- `ObjectOutputView` added in `internal-packages/workflow-designer-ui/src/ui/`.

## Done

- Updated `UITask["finalStep"]` type in `task-data.ts` as discriminated union with `FinalStepBase`.
- Added `buildObject`-based structured output derivation for `endNodeOutput.format === "object"`.
- Updated `FinalStepOutput` to use `switch` on `format` with exhaustive check.
- Extracted `RunningIndicator` sub-component to deduplicate shimmer animation.
- Created `ObjectOutputView` in `internal-packages/workflow-designer-ui` using `Streamdown` for JSON rendering.

## Now

- Committed and ready for review.

## Next

- Push and create PR.

## Open questions (UNCONFIRMED if needed)

- None.

## Working set (files/ids/commands)

- `apps/studio.giselles.ai/app/(main)/tasks/[taskId]/ui/task-data.ts`
- `apps/studio.giselles.ai/app/(main)/tasks/[taskId]/ui/final-step-output.tsx`
- `internal-packages/workflow-designer-ui/src/ui/object-output-view.tsx`
