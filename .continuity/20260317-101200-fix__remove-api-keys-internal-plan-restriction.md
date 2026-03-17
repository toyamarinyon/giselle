# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Remove `isInternalPlan` restriction from API Keys feature so it is available to all plans, not just internal (issue #5378).

## Goal (incl. success criteria)

- API Keys sidebar link, management pages, and Code tab in the workflow editor are accessible to all plans.
- `isInternalPlan` checks and `sdkAvailability` feature flag are removed from the API Keys flow.
- All quality checks pass (format, build-sdk, check-types, tidy, test).

## Constraints/Assumptions

- Server-side API endpoints are already protected by API key auth + rate limiting; those remain unchanged.
- The `isInternalPlan` utility function itself is removed since it has no remaining callers.

## Key decisions

- Removed `sdkAvailability` from the feature flag system entirely (context, provider, data-loader) rather than flipping it to `true`, since it was solely gated on `isInternalPlan`.
- Removed `isInternalPlan` utility function from `services/teams/utils.ts` as dead code.

## State

- All changes implemented and verified.

## Done

- Removed `isInternalPlan` guard from sidebar (`sidebar.tsx`): API keys link always shown.
- Removed `isInternalPlan` guard from `settings/team/api-keys/page.tsx`: page accessible to all plans.
- Removed `isInternalPlan` guard from `manage/api-keys/page.tsx`: redirect works for all plans.
- Removed `sdkAvailability` from `FeatureFlagContextValue`, `WorkspaceProvider`, and `data-loader.ts`.
- Removed `sdkAvailability` conditional from `dialog.tsx`: Code tab always visible.
- Removed unused `isInternalPlan` function from `services/teams/utils.ts`.
- All quality checks pass: format, build-sdk, check-types, tidy, test.

## Now

- Ready for commit and PR.

## Next

- N/A

## Open questions (UNCONFIRMED if needed)

- N/A

## Working set (files/ids/commands)

- `apps/studio.giselles.ai/app/(main)/ui/sidebar/sidebar.tsx`
- `apps/studio.giselles.ai/app/(main)/settings/team/api-keys/page.tsx`
- `apps/studio.giselles.ai/app/(main)/manage/api-keys/page.tsx`
- `apps/studio.giselles.ai/app/workspaces/[workspaceId]/data-loader.ts`
- `apps/studio.giselles.ai/services/teams/utils.ts`
- `packages/react/src/feature-flags/context.ts`
- `packages/react/src/workspace/provider.tsx`
- `internal-packages/workflow-designer-ui/src/app/app-entry-input-dialog/dialog.tsx`
