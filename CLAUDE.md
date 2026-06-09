# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

AstroLog is an astrophotography logging desktop app: a **Tauri v2 (Rust) backend** with a **Next.js 16 / React 19 frontend**. The UI is designed externally in [v0](https://v0.app) and must keep running there (in the browser, without Tauri) — see "The dual-runtime contract" below, it is the single most important constraint in this repo.

## Commands

```bash
# desktop app (Tauri spawns `next dev` and opens the native window)
npm run tauri dev

# frontend only, in the browser — runs against the MOCK api (no Rust)
npm run dev                      # http://localhost:3000

# production desktop bundle (runs `next build` static export, then bundles)
npm run tauri build

npm run lint                     # eslint (eslint-config-next)

# rust backend — always pass the manifest path from the repo root
cargo check --manifest-path src-tauri/Cargo.toml
cargo test  --manifest-path src-tauri/Cargo.toml   # no tests exist yet
```

There is no frontend test runner configured.

## The dual-runtime contract (read before touching frontend ↔ backend)

The frontend runs in **two** environments: the real Tauri desktop app and the browser/v0 design environment. To make this work, **components never call Tauri `invoke` directly.** All backend access goes through the `api` abstraction in `src/lib/api/`:

- **`types.ts`** — `AppApi`, the interface every backend capability is declared on. This is the contract.
- **`tauri.ts`** — real implementation; each method is a thin `invoke("command_name", { args })`.
- **`mock.ts`** — in-memory implementation with static sample data, so the UI renders in the browser/v0 with no Rust.
- **`index.ts`** — `resolveApi()` picks real vs mock via `NEXT_PUBLIC_APP_ENV` (`"tauri"`/`"web"`), falling back to runtime detection of `__TAURI_INTERNALS__`.

**Adding a backend feature is therefore an end-to-end change. To add one command you touch, in order:**
1. `src-tauri/src/models/` — the Rust struct (derive `Serialize`/`Deserialize`)
2. `src-tauri/src/db.rs` — the DB method on `Database`
3. `src-tauri/src/commands.rs` — a `#[tauri::command]` wrapper
4. `src-tauri/src/lib.rs` — register it in the `invoke_handler!` list
5. `src/lib/api/types.ts` — add it to the `AppApi` interface
6. `src/lib/api/tauri.ts` **and** `src/lib/api/mock.ts` — implement it in **both** (a missing mock impl breaks v0)
7. `src/types/` — the matching TypeScript type (snake_case fields, mirroring serde)

Because Next is configured for static export (`output: 'export'`, `frontendDist: ../out`), there is **no Next.js server at runtime** — all data fetching is client-side (`"use client"`) through `api`. Do not use RSC data fetching, server actions, or route handlers for app data.

## Rust backend architecture

- **`state.rs`** — `AppState` holds `Mutex<Database>` plus configs and `root_directory`. Built once in `lib.rs`'s `.setup()` and shared via `app.manage()`. Commands receive it as `State<AppState>`.
- **`db.rs`** — owns the single `rusqlite` connection. Schema is managed by `rusqlite_migration`: the `Migrations::new(vec![...])` list is **append-only** — add new `M::up(...)` entries at the end, never edit or reorder existing ones. The DB lives at `<root_directory>/.astrolog/astrolog.db`. Persistence methods follow a per-entity pattern (`insert_*` via `INSERT OR REPLACE` upsert, `remove_*`, `get_*`).
- **`commands.rs`** — thin wrappers only. The convention: `log::debug!` on entry, then `.map_err(|e| { log::error!(...); e.to_string() })` so errors reach the frontend as strings.
- **`models/`** — `equipment.rs` (telescopes, cameras, mounts, filters, flatteners) and `imaging_frames/`.

### Data-loading models differ by data size
- **Equipment** is small and bounded → loaded *entirely* at startup. `get_app_state` returns the whole `EquipmentList`; `StateProvider` holds it in React context.
- **Imaging frames** are unbounded and grow forever → **queried on demand** (paginated/filtered/sorted in SQL), never loaded wholesale. Frames use storage-model-vs-view-model separation: one row per physical frame for storage (enables dedup/regex/sort), aggregated into group rows at query time via `GROUP BY`. Sort columns are passed as whitelisted enums (never raw column strings) to prevent SQL injection; regex search uses a `REGEXP` UDF registered on the connection.

## Conventions

- **Comments start lowercase and have no trailing period.** Applies to all comments, including Rust `//` and `///`.
- **UUIDs**: the TS `UUID` type is imported from `"crypto"`; generate new ids client-side with `crypto.randomUUID() as UUID`. The Rust backend does not generate ids — it stores whatever id it receives.
- **Validation**: frontend form schemas use Zod, in `src/schemas/`.
- **UI components**: shadcn (style `radix-nova`, base color `neutral`, icons `lucide`). Add via `npx shadcn@latest add <name>`; generated components land in `src/components/ui/`.
- Path alias `@/*` → `src/*`.
