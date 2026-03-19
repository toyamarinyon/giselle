# Continuity ledger (per-branch)

## Human intent (must not be overwritten)

- Add SSRF protection to `scrapeUrl` in the web-search package using `ipaddr.js` instead of hand-rolled IP range checks
- Use `ipaddr.js` `range()` API to block all non-unicast addresses (private, loopback, link-local, reserved, multicast, etc.)
- Allow IPv6 public addresses (unlike the existing `validate-connection-string.ts` which blocks all IPv6)
- Close SSRF TOCTOU gap by using undici `Agent` with `connect.lookup` to validate DNS results at connection time

## Goal (incl. success criteria)

- `scrapeUrl` rejects URLs pointing to private/internal IPs before making any HTTP request
- Validation uses `ipaddr.js` `range() !== "unicast"` for both IPv4 and IPv6
- IPv4-mapped IPv6 addresses (e.g. `::ffff:127.0.0.1`) are correctly handled via `ipaddr.process()`
- TOCTOU gap closed: DNS resolution and IP validation happen in the same callback via undici `connect.lookup`
- All quality checks pass: format, build-sdk, check-types, tidy, test

## Constraints/Assumptions

- Follow existing codebase patterns (reference: `validate-connection-string.ts`)
- IP range exhaustiveness is `ipaddr.js`'s responsibility; tests cover representative cases only
- undici `connect.lookup` is not called for IP literal hostnames, so `validateUrl` checks IP literals synchronously as a two-layer defense

## Key decisions

- Used `ipaddr.js@2.3.0` (added to pnpm catalog)
- Added `undici@7.24.4` to pnpm catalog and web-search dependencies
- `isPrivateIP` returns `true` for invalid strings (safe side)
- Renamed `validateUrlForFetch` (async) to `validateUrl` (sync): removed DNS lookup, keeps URL parse + scheme + IP literal checks only
- Added `createSsrfSafeAgent()` returning undici `Agent` with `connect.lookup` that validates resolved IPs against `isPrivateIP`
- `self-made.ts` uses `import { fetch } from "undici"` instead of global `fetch` to avoid type mismatch between undici@7.24.4 and Node's built-in undici-types
- `createSsrfSafeAgent()` is called per-fetch inside `scrapeUrl`'s redirect loop (each request gets a fresh agent)
- Redirect SSRF bypass fix: `redirect: "manual"` + re-validate each redirect target before following (max 10 redirects, specific status codes 301/302/303/307/308)
- Two-layer SSRF defense: (1) `validateUrl` sync check catches IP literal URLs before any network call; (2) `createSsrfSafeAgent` validates DNS-resolved IPs at connection time to close TOCTOU gap

## State

- Implementation complete, all checks pass (22 passed, 6 skipped in web-search)

## Done

- Added `ipaddr.js: 2.3.0` to pnpm catalog and `packages/web-search/package.json`
- Added `undici: 7.24.4` to pnpm catalog and `packages/web-search/package.json`
- Refactored `packages/web-search/src/validate-url.ts`:
  - Renamed `validateUrlForFetch` (async, DNS-resolving) → `validateUrl` (sync, URL parse + scheme + IP literal only)
  - Extracted `rejectPrivateIPLiteral` helper for IPv4/IPv6 literal hostname checks (strips `[` `]` brackets for IPv6)
  - Added `createSsrfSafeAgent()` returning undici `Agent` with `connect.lookup` callback for DNS-time IP validation
- Updated `packages/web-search/src/self-made.ts`:
  - Switched from global `fetch` to `import { fetch } from "undici"`
  - `scrapeUrl` calls `validateUrl(currentUrl)` synchronously + passes `dispatcher: createSsrfSafeAgent()` per fetch
  - Redirect loop uses `redirect: "manual"` and re-validates each hop
- Updated `packages/web-search/src/validate-url.test.ts` (12 tests across 3 describe blocks: `isPrivateIP`, `validateUrl` sync, `createSsrfSafeAgent`)
  - Mocks switched from `dns.promises.lookup` to `dns.lookup` (callback-based)
  - Tests now synchronous for `validateUrl` (no `async`/`rejects`)
  - Added `createSsrfSafeAgent` test using undici `fetch` + `dispatcher`
- Updated `packages/web-search/src/self-made.test.ts`:
  - DNS mock switched from `dns.promises.lookup` to `dns.lookup` (callback)
  - `global.fetch` mocks replaced with `vi.mock("undici")` partial mock via `mockFetch` variable
  - Mock responses include `status` field for redirect detection compatibility
- All quality checks pass: format, build-sdk, check-types, tidy, test

## Now

- Implementation complete; ready for PR / review

## Next

- Create PR for review
- Consider whether `createSsrfSafeAgent()` should be shared as a module-level singleton instead of being created per-fetch (current approach is simpler and avoids connection pooling across unrelated requests)

## Open questions (UNCONFIRMED if needed)

- Performance: creating a new undici `Agent` per fetch call is safe but may have overhead for high-throughput scenarios. Acceptable for now since `scrapeUrl` is not called at high frequency.

## Working set (files/ids/commands)

- `pnpm-workspace.yaml` (catalog entries: ipaddr.js, undici)
- `packages/web-search/package.json` (dependencies: ipaddr.js, undici)
- `packages/web-search/src/validate-url.ts` (isPrivateIP, validateUrl, createSsrfSafeAgent)
- `packages/web-search/src/validate-url.test.ts` (updated tests)
- `packages/web-search/src/self-made.ts` (uses validateUrl + undici fetch + dispatcher)
- `packages/web-search/src/self-made.test.ts` (updated mocks)
