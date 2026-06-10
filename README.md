<div align="center">

# AstroLog

**A desktop app for logging, organizing and analyzing your astrophotography.**

Classify and log all your imaging frames automatically - or manually.

[![Tauri](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Rust](https://img.shields.io/badge/Rust-1.96+-000000?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![License](https://img.shields.io/badge/license-Source%20First%201.1-blue)](./LICENSE.md)

</div>

> ⚠️ **Early development.** AstroLog is under active construction and not yet feature-complete. Things will change.

---

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/astrolog-app/astrolog/main/.github/screenshots_dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/astrolog-app/astrolog/main/.github/screenshots_light.png">
    <img alt="AstroLog screenshots">
</picture>

## Tech stack

| Layer | Tech |
|------|------|
| Desktop shell | [Tauri v2](https://tauri.app) (Rust) |
| Backend | Rust, `rusqlite` + `rusqlite_migration` (SQLite) |
| Frontend | [Next.js 16](https://nextjs.org) (static export), React 19, TypeScript |
| UI | [shadcn/ui](https://ui.shadcn.com), Tailwind CSS, lucide icons |
| Validation | Zod |

The frontend talks to the Rust backend exclusively through a small `api` abstraction, which has a real (Tauri) implementation and an in-memory mock - so the entire UI can run in a plain browser with no Rust at all.

## Getting started as a developer

### Prerequisites

- [Node.js](https://nodejs.org) 24+
- [Rust](https://www.rust-lang.org/tools/install) 1.96+
- Tauri's system dependencies for your OS, see the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Development

```bash
# install frontend dependencies
npm install

# run the full desktop app (Tauri spawns the dev server and opens the native window)
npm run tauri dev
```

To work on the **UI only**, in a normal browser against the in-memory mock (no Rust required):

```bash
npm run dev          # http://localhost:3000
```

### Build

```bash
# produces a native desktop bundle for your platform
npm run tauri build
```

## License

AstroLog is **source-available** under the [**FUTO Source First License 1.1**](./LICENSE.md). You may read, build and use the software, and modify it for your own non-commercial purposes. Distribution is only permitted free of charge for non-commercial purposes, and you may not remove or alter the licensing/payment functionality. This is **not** an OSI-approved open-source license. See [`LICENSE.md`](./LICENSE.md) for the exact terms.

## Author

Built by **Rouven Spaar**.
