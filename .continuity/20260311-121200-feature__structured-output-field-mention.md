# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Implement structured output field selection: extend node references from `{{nodeId:outputId}}` to `{{nodeId:outputId:field.nested}}` so users can reference individual fields of structured outputs.

## Goal (incl. success criteria)

- All five plan steps complete: SourceExtension path attr, formatting utils, suggestion list expansion, regex/replaceKeyword at all callsites, generationContentResolver path-aware resolution.
- All validation passes: format, build-sdk, check-types, tidy, test.

## Constraints/Assumptions

- Backward compatible: references without a path segment continue to work as before.
- Only top-level structured output properties are surfaced in suggestion list (per plan).

## Key decisions

- `navigateObjectPath` extracted to `packages/giselle/src/structured-output/utils.ts` for reuse across `build-object.ts`, `use-generation-executor.ts`, `execute-query.ts`, `execute-data-query.ts`.
- Callback type signatures (`generationContentResolver`, `textGenerationResolver`) accept optional `path?: string[]`.

## State

- All plan steps implemented, reviewed, and validated.

## Done

- Step 1: Added `path?: string[]` to `SourceExtension` attrs, `renderHTML`, `renderText`.
- Step 2: Updated `formatNodeReference` and `containsSpecificNodeReference` in formatting.ts.
- Step 3: Expanded suggestion list to show per-field items for structured outputs; updated `suggestion.ts` items/command.
- Step 4: Updated regex pattern and replaceKeyword at all 5 callsites (generations/utils.ts ×3, execute-query.ts, execute-data-query.ts).
- Step 5: Path-aware `generationContentResolver` in `use-generation-executor.ts`, `execute-query.ts`, `execute-data-query.ts`.
- Step 5 (extra): Updated `textGenerationResolver` callback in `buildGenerationMessageForImageGeneration`.
- Extracted `navigateObjectPath` to shared utility.
- Fixed type errors: updated callback type signatures to include optional `path` param.
- Code review cleanup (post-implementation):
  - Removed `sourceKeyword.path` from non-structured-output node types (`query`, `dataQuery`, `trigger`, `action`, `appEntry`).
  - Renamed `extractFieldFromGeneratedText` → `resolveGeneratedTextContent` (definition + 3 import/usage files).
- Added field type icons to suggestion list (lucide-react icons with color scheme matching Structured Output Dialog).
- Bug fix: regex field-path character class `[a-zA-Z0-9_]+` → `[a-zA-Z0-9_.]+` to match dotted nested paths (e.g., `address.city`). All 5 regex instances updated. Without `.`, references like `{{nd-xxx:otp-yyy:address.city}}` failed to match entirely and remained as unresolved raw text in prompts.
- All validation passed: format, build-sdk, check-types, tidy, test (617 tests).

## Now

- Ready for review / commit.

## Next

- Commit changes when requested.
- Consider adding unit tests for path-based reference resolution.

## Open questions (UNCONFIRMED if needed)

- None.

## Working set (files/ids/commands)

- `packages/text-editor-utils/src/extensions/source-extension.ts`
- `packages/text-editor-utils/src/node-references/formatting.ts`
- `packages/text-editor/src/react/suggestion-list.tsx`
- `packages/text-editor/src/react/suggestion.ts`
- `packages/giselle/src/structured-output/utils.ts` (new)
- `packages/giselle/src/tasks/build-object.ts`
- `packages/giselle/src/generations/internal/use-generation-executor.ts`
- `packages/giselle/src/generations/utils.ts`
- `packages/giselle/src/operations/execute-query.ts`
- `packages/giselle/src/operations/execute-data-query.ts`
