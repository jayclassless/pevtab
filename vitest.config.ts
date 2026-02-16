import vue from '@vitejs/plugin-vue'
import { configDefaults, defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

export default defineConfig({
  plugins: [WxtVitest(), vue()],
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**'],
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      include: ['components/**/*.vue', 'entrypoints/**/*.{ts,vue}', 'utils/**/*.ts'],
      exclude: ['**/__tests__/**', '**/main.ts', '**/devSeedPlans.ts'],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
})
