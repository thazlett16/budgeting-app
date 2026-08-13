# Testing & Packaging Plan

## 1. Testing strategy (not yet confirmed with Tim — proposed default)

Since testing wasn't discussed in planning, here's a proposed baseline. Revisit
before Phase 1 of the backend plan if there's a different preference.

- **Rust unit tests** (`#[test]`, colocated with the modules they test):
  highest priority on the rollup/calculation logic (`commands/summary.rs`,
  `commands/investments.rs`'s gain math) and CSV round-tripping
  (`storage/csv_store.rs`). These are the places where a subtle bug produces a
  wrong number that's easy to miss visually — worth the most test investment.
- **Frontend unit tests** (Vitest): Valibot schema edge cases, date-range
  helper functions (`lib/dateRanges.ts`), and any non-trivial derived-state
  logic in the TanStack Query hooks (e.g. anything that transforms backend
  data client-side rather than just displaying it).
- **End-to-end smoke tests** (Playwright, or Tauri's WebDriver-based testing
  if it's in a good state for the Tauri v2 version being used — check current
  support before committing): a handful of "does the app still basically work"
  flows — add an account, log an investment snapshot, see it reflected on the
  dashboard, export a CSV. Not exhaustive coverage, just a tripwire against
  totally broken builds.
- Component-level UI tests (React Testing Library) are optional/lower
  priority given this is a single-user personal app, not a product with many
  contributors — lean more on the Rust-side correctness tests where the real
  risk (wrong financial numbers) actually lives.

## 2. Packaging (v1: Arch Linux desktop only)

- Standard Tauri v2 build: `pnpm tauri build`, native to Arch, no Flatpak
  packaging.
- Confirm the standard Tauri Linux system dependencies are present
  (`webkit2gtk`, `libayatana-appindicator`, build tooling) — install via
  `pacman`, not Flatpak, per the corrected environment note.
- Output artifact: whatever `cargo tauri build` produces natively for Arch
  (a binary + optionally an AppImage if that's configured in `tauri.conf.json`)
  — no additional packaging work planned for v1 beyond Tauri's defaults.

## 3. Packaging (later: mobile expansion)

Not scoped for v1, but since Tauri v2 was chosen specifically to keep mobile
open:

- `pnpm tauri android init` / `pnpm tauri ios init` when that phase starts.
- Mobile will need its own pass on responsive layout (the dashboard's
  multi-chart, multi-table layout is designed assuming a desktop-width
  viewport) — flag this as real design work, not just a build-target flip.
- File storage location differs on mobile (app sandbox conventions differ from
  desktop) — `app_data_dir()` should resolve correctly automatically via
  Tauri's path APIs, but verify on a real device/simulator rather than
  assuming.

## 4. CI (optional, not discussed)

If Tim wants CI at some point: a GitHub Actions workflow running
`cargo test`, `pnpm test` (Vitest), and `pnpm tauri build` on push would catch
regressions early. Not required for a personal single-developer project, but
cheap to add once the project structure stabilizes. Not planned as part of the
initial build — mentioned here so it's not forgotten entirely.
