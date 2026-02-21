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
pnpm test             # Run unit tests once
pnpm test:watch       # Run unit tests in watch mode
pnpm test:coverage    # Run unit tests with coverage (95% threshold)
pnpm lint             # Lint with oxlint
pnpm format           # Format with oxfmt
pnpm format:check     # Check formatting
pnpm compile          # Type-check with vue-tsc
pnpm test:e2e         # Build extension then run Playwright e2e tests
```

Run a single test file: `npx vitest run components/__tests__/PlanForm.test.ts`

## File Structure

```
components/             # Vue UI components
  __tests__/            # Component unit tests
  PlanForm.vue          # Plan input form (name, SQL, EXPLAIN JSON)
  PlanHistory.vue       # List of saved plans with sort/delete
  SidePanel.vue         # Collapsible wrapper for form + history
  Icon*.vue             # SVG icon components (7 files)
entrypoints/
  background.ts         # Service worker: opens visualizer tab on click
  __tests__/            # Background script tests
  visualizer/
    index.html          # HTML entrypoint
    main.ts             # Vue app bootstrap
    App.vue             # Root component: side panel + pev2 Plan viewer
    __tests__/          # App component tests
utils/
  types.ts              # SavedPlan type definition
  planStorage.ts        # CRUD for plans via WXT storage API (key: 'local:plans')
  __tests__/            # Storage utility tests
e2e/                    # Playwright e2e tests (excluded from vitest)
patches/                # pnpm patches (pev2 CSP fix)
```

## Architecture

The extension opens a `/visualizer.html` tab when the extension button is clicked.

**Layers:**

- **Background script** (`entrypoints/background.ts`) — Listens for extension button click, opens the visualizer tab
- **Storage layer** (`utils/planStorage.ts`) — CRUD operations for saved plans using WXT's `storage` API (browser local storage). Key: `'local:plans'`
- **UI** (`entrypoints/visualizer/App.vue`) — Split layout: collapsible side panel (plan history + form) on the left, pev2 `<Plan>` visualization on the right
- **Components** (`components/`) — `PlanForm`, `PlanHistory`, `SidePanel`, and SVG icon components

**Data model** (`utils/types.ts`): `SavedPlan` has `id` (UUID via `uuid` package), `name`, `planSource` (EXPLAIN JSON), `planQuery` (SQL), `savedAt` (Unix timestamp in milliseconds via `Date.now()`).

**Theme system:** Three modes (light/dark/auto) persisted to `'local:themeMode'`, applied via Bootstrap's `data-bs-theme` attribute.

## Code Conventions

- Vue 3 `<script setup>` Composition API with TypeScript
- Formatting (configured in `.oxfmtrc.json`): no semicolons, single quotes, 2-space indentation, trailing commas (es5), imports auto-sorted
- `~/` path alias resolves to project root (also `@/`, `~~/`, `@@/`)
- Source imports use `~/`: `import PlanForm from '~/components/PlanForm.vue'`
- Test imports use relative paths for the module under test, `~/` for other imports
- Tests colocated in `__tests__/` directories next to source files, named `*.test.ts`
- Testing: Vitest + happy-dom + @vue/test-utils; `fakeBrowser` from `wxt/testing` for browser API mocks
- Linting (configured in `.oxlintrc.json`): oxlint with eslint, typescript, unicorn, oxc, react, import, promise plugins

## Notable Details

- pev2 library has a custom patch (`patches/pev2@1.20.1.patch`) to fix CSP compatibility issues in Manifest V3 (removes `Function("return this")()` and lodash templates)
- The WXT config aliases `vue` to the runtime-only build (`vue/dist/vue.runtime.esm-bundler.js`) for MV3 CSP compliance — do not use Vue template compilation at runtime
- Coverage thresholds are 95% for lines, functions, branches, and statements
- E2E tests use a custom Playwright fixture that loads the built extension into a persistent Chromium context

## Verification Checklist

No code change is considered complete unless all of the following pass:

```bash
pnpm compile          # No type errors
pnpm lint             # No lint errors
pnpm format:check     # Properly formatted (run `pnpm format` to fix)
pnpm test             # All unit tests pass
```

If any tests were added or changed, also run `pnpm test:coverage` to verify the 95% coverage threshold is maintained.
