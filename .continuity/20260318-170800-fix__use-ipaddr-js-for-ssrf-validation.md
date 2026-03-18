# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Add SSRF protection to `scrapeUrl` in the web-search package using `ipaddr.js` instead of hand-rolled IP range checks
- Use `ipaddr.js` `range()` API to block all non-unicast addresses (private, loopback, link-local, reserved, multicast, etc.)
- Allow IPv6 public addresses (unlike the existing `validate-connection-string.ts` which blocks all IPv6)

## Goal (incl. success criteria)

- `scrapeUrl` rejects URLs pointing to private/internal IPs before making any HTTP request
- Validation uses `ipaddr.js` `range() !== "unicast"` for both IPv4 and IPv6
- IPv4-mapped IPv6 addresses (e.g. `::ffff:127.0.0.1`) are correctly handled via `ipaddr.process()`
- All quality checks pass: format, build-sdk, check-types, tidy, test

## Constraints/Assumptions

- Follow existing codebase patterns (reference: `validate-connection-string.ts`)
- IP range exhaustiveness is `ipaddr.js`'s responsibility; tests cover representative cases only
- DNS lookup uses `{ all: true }` to check all resolved addresses

## Key decisions

- Used `ipaddr.js@2.3.0` (added to pnpm catalog)
- `isPrivateIP` returns `true` for invalid strings (safe side)
- `validateUrlForFetch` throws errors (not result types) to match `scrapeUrl`'s existing error handling style; caller `addWebPage` catches via `try/catch` and re-throws with context
- Replaced the inline `try { new URL(url) } catch` block in `scrapeUrl` with `await validateUrlForFetch(url)`
- Redirect SSRF bypass fix: `redirect: "manual"` + re-validate each redirect target before following (max 10 redirects, specific status codes 301/302/303/307/308)

## State

- Implementation complete, all checks pass (20 passed, 6 skipped in web-search)

## Done

- Added `ipaddr.js: 2.3.0` to pnpm catalog and `packages/web-search/package.json`
- Created `packages/web-search/src/validate-url.ts` with `isPrivateIP` and `validateUrlForFetch`
- Updated `packages/web-search/src/self-made.ts` to call `validateUrlForFetch` before fetching
- Created `packages/web-search/src/validate-url.test.ts` (10 tests: isPrivateIP + validateUrlForFetch)
- Added SSRF smoke tests to `packages/web-search/src/self-made.test.ts`
- Fixed redirect-based SSRF bypass: `scrapeUrl` now uses `redirect: "manual"` and re-validates each redirect target via `validateUrlForFetch` before following it (max 10 redirects)
- Added redirect SSRF tests: block redirect to private IP (169.254.169.254), block redirect to loopback (127.0.0.1), follow safe redirects, reject too many redirects
- All quality checks pass: format, build-sdk, check-types, tidy, test

## Now

- Implementation complete

## Next

- (none)

## Open questions (UNCONFIRMED if needed)

- (none)

## Working set (files/ids/commands)

- `pnpm-workspace.yaml` (catalog entry)
- `packages/web-search/package.json` (dependency)
- `packages/web-search/src/validate-url.ts` (new)
- `packages/web-search/src/validate-url.test.ts` (new)
- `packages/web-search/src/self-made.ts` (modified)
- `packages/web-search/src/self-made.test.ts` (modified)
