# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Add Standard Schema v1 validation support to SDK `runAndWait` method.
- Update App Entry dialog to show validation library-specific sample code.
- Address all PR review feedback from automated reviewers.

## Goal (incl. success criteria)

- Standard Schema v1 validation on `runAndWait` with typed output.
- Code generators for Zod, Valibot, ArkType, Effect in App Entry dialog.
- All review comments from Codex, Copilot, and CodeRabbit addressed.

## Constraints/Assumptions

- Only include validation libraries confirmed to support Standard Schema v1.
- Follow codebase conventions (Symbol-based error branding, escaping in code gen).

## Key decisions

- Removed Yup and Joi from library options (not confirmed Standard Schema v1 support).
- Schema validation only runs on completed tasks (not failed/cancelled).
- Added `formatPropertyKey` and `formatStringLiteral` helpers for safe code generation.
- Each library generator respects `subSchema.required` for optional field markers.

## State

- All review feedback addressed, all quality checks pass.

## Done

- P1: Skip schema validation when task is not completed (failed/cancelled).
- Fix JSDoc "Zod v4" to "Zod".
- Add Symbol-based branding for `SchemaValidationError`.
- Remove Yup and Joi options.
- Guard `onValueChange` with runtime type check instead of force-cast.
- Escape property keys and enum literals in generated code.
- Respect `subSchema.required` for optional fields in all code generators.
- Add 4 unit tests for schema validation behavior.
- All quality checks pass: format, build-sdk, check-types, tidy, test.

## Now

- Ready for commit and push.

## Next

- None; review fixes complete.

## Open questions (UNCONFIRMED if needed)

- None.

## Working set (files/ids/commands)

- `packages/sdk/src/sdk.ts`
- `packages/sdk/src/errors.ts`
- `packages/sdk/src/sdk.test.ts`
- `internal-packages/workflow-designer-ui/src/app/app-entry-input-dialog/dialog.tsx`
- `internal-packages/workflow-designer-ui/src/app/app-entry-input-dialog/generate-sample-code.ts`
