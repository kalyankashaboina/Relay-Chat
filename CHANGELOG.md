# Changelog

## [2.0.0] — 2025-06

### Removed
- **E2E tests** — `e2e/` directory and Playwright removed
- **eventLogger** — `shared/services/eventLogger.ts` removed; replaced with `console.warn/error` only where needed
- **debugUtils** — `shared/services/debugUtils.ts` removed
- **`any` types** — zero `any` types remain across all source files

### Changed
- **`main.tsx`** — removed `initDebugUtils()` call and Replay Sentry integration (lightweight)
- **`chatSlice.ts`** — all `eventLogger.log()` calls removed; cleaner thunks
- **`useChat.ts`** — all `eventLogger.log()` calls removed
- **`config/index.ts`** — no hardcoded URLs; all from `import.meta.env`
- **`socketClient.ts`** — fetches short-lived socket token from `/api/auth/socket-token` on connect
- **`shared/api/client.ts`** — clean Axios instance; no Sentry in request path
- **ESLint** — `no-explicit-any` upgraded to `error`
- **TypeScript** — `strict: true`, `noImplicitAny: true` enforced
- **CI** — E2E test step removed

### Fixed
- `ForwardMessageModal.tsx` — `displayName` null-coalescing to prevent undefined passed to string fns
- `chatSlice.ts` — `foundConvId` typed as `string | undefined` (was `string | null`)
- `useChat.ts` — `convId` null coalescence fixed
- `apiSlice.ts` — `baseQueryWithLog` properly typed with RTK Query generics
