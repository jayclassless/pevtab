# PostgresExplainerTab

A browser extension (for both [Chrome](https://chromewebstore.google.com/detail/postgresexplainertab/jhldnmgncdpleodjciaalhnkajebojpg) & [Firefox](https://addons.mozilla.org/en-US/firefox/addon/postgresexplainertab/)) for visualizing PostgreSQL EXPLAIN plans. Click the extension icon to open a new tab where you can paste your EXPLAIN output and get an interactive visualization powered by [pev2](https://github.com/dalibo/pev2).

## Prerequisites

- [Node.js](https://nodejs.org/) v24.13.0
- [pnpm](https://pnpm.io/) v10.28.2 — after installing Node.js, enable pnpm via [Corepack](https://nodejs.org/api/corepack.html): `corepack enable`

If you have `asdf` available, you can run `asdf install` to activate the necessary tools.

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev              # Start dev server (Chrome)
pnpm dev:firefox      # Start dev server (Firefox)
```

## Building

```bash
pnpm build            # Production build (Chrome)
pnpm build:firefox    # Production build (Firefox)
pnpm zip              # Package for Chrome
pnpm zip:firefox      # Package for Firefox
```

## Testing

```bash
pnpm test             # Run unit tests
pnpm test:watch       # Run unit tests in watch mode
pnpm test:coverage    # Run unit tests with coverage
pnpm test:e2e         # Run Playwright e2e tests (requires build first)
```

## Tech Stack

- [Vue 3](https://vuejs.org/)
- [WXT](https://wxt.dev/)
- [pev2](https://github.com/dalibo/pev2)
- [Bootstrap 5](https://getbootstrap.com/)
- [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

## License

MIT
