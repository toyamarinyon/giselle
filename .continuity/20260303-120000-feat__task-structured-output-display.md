# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Display structured end-node outputs from task detail pages for the `"object"` format path while preserving existing passthrough output behavior.
- Add this work on a branch created from `main`.

## Goal (incl. success criteria)

- Implement structured output rendering for `UITask["finalStep"]` with `outputType: "object"` and keep passthrough unchanged for `outputType: "passthrough"`.
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
- Both `task-data.ts` and `final-step-output.tsx` use exhaustive `switch` + `never` check on `outputType`.
- Renamed discriminator from `format` to `outputType` to align with API route layer naming (`route.ts` uses `outputType`).

## State

- Branch `feat/task-structured-output-display` is created from `main`.
- `task-data.ts`, `final-step-output.tsx`, `output-actions.tsx` updated.
- `ObjectOutputView` added in `internal-packages/workflow-designer-ui/src/ui/`.
- PR created and under review; applying review feedback.

## Done

- Updated `UITask["finalStep"]` type in `task-data.ts` as discriminated union with `FinalStepBase`.
- Added `buildObject`-based structured output derivation for `endNodeOutput.format === "object"`.
- Updated `FinalStepOutput` to use `switch` on `outputType` with exhaustive check.
- Extracted `RunningIndicator` sub-component to deduplicate shimmer animation.
- Created `ObjectOutputView` in `internal-packages/workflow-designer-ui` using `Streamdown` for JSON rendering.
- Renamed discriminator property from `format` to `outputType` in `PassthroughFinalStep`, `ObjectFinalStep`, and `FinalStepOutput` switch to align with API route naming.
- Fixed Tailwind CSS v3 syntax to v4 (`bg-size-[...]`, `bg-linear-to-r`, `**:`, `suffix!`).
- Moved `outputs` computation inside `passthrough` case to avoid unnecessary work for `object` format.
- Reordered download/copy buttons in `OutputActions`.

## Now

- Review feedback applied. Ready for re-review.

## Next

- Address any remaining review comments.

## Open questions (UNCONFIRMED if needed)

- None.

## Working set (files/ids/commands)

- `apps/studio.giselles.ai/app/(main)/tasks/[taskId]/ui/task-data.ts`
- `apps/studio.giselles.ai/app/(main)/tasks/[taskId]/ui/final-step-output.tsx`
- `internal-packages/workflow-designer-ui/src/ui/object-output-view.tsx`
