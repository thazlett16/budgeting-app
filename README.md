# budgeting-app

An app to create and track a budget and to track personal net worth.

Tauri v2 + React + TypeScript + Vite frontend, Rust/Tauri backend, CSV file
storage. See `plans/` for the full design docs — start with
`plans/00-overview-and-decisions.md`.

## Stack

- Tauri v2 (desktop now, mobile-ready later)
- React 19 + Vite + TypeScript, tooling via `vite-plus` (`vp`)
- TanStack Router / Query / Table / Virtual / Form (v2 alpha) / Pacer / Charts
- Tailwind CSS v4, React Aria Components
- `@thaz/typescript-config`, `@thaz/oxlint-config`, `@thaz/oxfmt-config`, `@thaz/temporal-util`, `@thaz/form-util`, `@thaz/network-util`
- Valibot for schema validation (frontend boundary), `csv` + `serde` (Rust boundary)
- Vitest (node + real-browser-via-Playwright projects) for frontend tests, mocking `invoke()` via `@tauri-apps/api/mocks` (see `mock/`)

## Project structure

- `src/services/<domain>/` — one folder per backend domain (`schema.ts` the
  Valibot shapes, `contract.ts` the typed `command` → input/output map,
  `client.ts` the validated `invoke()` wrapper, `options.ts` the TanStack
  Query `queryOptions`/`mutationOptions`). Components call `options.ts`,
  never `invoke()` directly.
- `src/lib/` — small framework-agnostic utilities with no service/component
  home of their own (currently just `dateRanges.ts`; `chartFormatting.ts`
  will land here per `plans/04-charts-plan.md`).
- `mock/` — Tauri IPC mocks for tests: `handlers/<domain>.ts` maps command
  names to canned responses, `tauri-ipc.ts` installs them via
  `@tauri-apps/api/mocks` (msw doesn't apply here — `invoke()` isn't HTTP).
- `test/` — Vitest setup + shared test utilities (`*.node.test.ts` for pure
  logic, `*.browser.test.tsx` for anything touching React/the mocked IPC
  layer, `*.test-d.ts` for type-only tests).
- No global state store yet (no TanStack Store) — holding off until a
  concrete cross-page state need shows up; local component state / route
  search params first.

## Getting started

Not yet installed — this is scaffolding only. Once ready:

```sh
pnpm install
pnpm playwright:setup
pnpm tauri:dev
```

## Status / open items

- Dependencies are declared in `package.json` / `Cargo.toml` but **not installed**.
- `src-tauri/icons/` has generated placeholder art (solid-color "$" icon) —
  swap for real icons via `pnpm tauri icon <path-to-1024-png>` before shipping.
- Rust crate versions in `Cargo.toml` are unpinned majors, not checked against
  crates.io yet (see `plans/02-backend-plan.md` §1) — validate before Phase 1.
- Only the `accounts` domain has a Rust command stub (`list_accounts`) and a
  full frontend service (`src/services/accounts/`), enough to prove the
  `invoke()` round-trip end-to-end per `plans/03-frontend-architecture.md`
  build order step 1. Everything else in `02-backend-plan.md` (CRUD,
  rollups, export) and the other domains (lookups, investments, expenses,
  income) still need their own `commands/*.rs` + `src/services/*/` pair.
