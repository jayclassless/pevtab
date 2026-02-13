# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**pevtab** is a browser extension (Chrome/Firefox) for visualizing PostgreSQL EXPLAIN plans. Built with Vue 3, WXT (web extension framework), and the pev2 library. Uses Bootstrap 5 for styling.

## Commands

```bash
pnpm dev              # Start dev server (Chrome)
pnpm dev:firefox      # Start dev server (Firefox)
pnpm build            # Production build (Chrome)
pnpm build:firefox    # Production build (Firefox)
pnpm test             # Run tests once
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
pnpm lint             # Lint with oxlint
pnpm format           # Format with oxfmt
pnpm format:check     # Check formatting
pnpm compile          # Type-check with vue-tsc
```

Run a single test file: `npx vitest run components/__tests__/PlanForm.test.ts`

## Architecture

The extension opens a `/visualizer.html` tab when the extension button is clicked.

**Layers:**
- **Background script** (`entrypoints/background.ts`) — Listens for extension button click, opens the visualizer tab
- **Storage layer** (`utils/planStorage.ts`) — CRUD operations for saved plans using WXT's `storage` API (browser local storage). Key: `'local:plans'`
- **UI** (`entrypoints/visualizer/App.vue`) — Split layout: collapsible side panel (plan history + form) on the left, pev2 `<Plan>` visualization on the right
- **Components** (`components/`) — `PlanForm`, `PlanHistory`, `SidePanel`, and SVG icon components

**Data model** (`utils/types.ts`): `SavedPlan` has `id` (UUID), `name`, `planSource` (EXPLAIN JSON), `planQuery` (SQL), `savedAt` (timestamp).

**Theme system:** Three modes (light/dark/auto) persisted to `'local:themeMode'`, applied via Bootstrap's `data-bs-theme` attribute.

## Code Conventions

- Vue 3 `<script setup>` Composition API with TypeScript
- Formatting: no semicolons, single quotes, 2-space indentation, trailing commas (es5)
- `~/` path alias resolves to project root (configured by WXT)
- Tests colocated in `__tests__/` directories next to source files
- Testing: Vitest + happy-dom + @vue/test-utils; `fakeBrowser` from `wxt/testing` for browser API mocks

## Notable Details

- pev2 library has a custom patch (`patches/pev2@1.20.1.patch`) to fix CSP compatibility issues in Manifest V3 (removes template-based formatting)
- The WXT config aliases `vue` to the runtime-only build for MV3 CSP compliance

## Requirements

- No code change is considered complete unless tests have been added or updated to address the changes, the linter reports no errors, the code is property formatted, and the full unit test suite passes.
