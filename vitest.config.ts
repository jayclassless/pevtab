import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { WxtVitest } from 'wxt/testing/vitest-plugin'

export default defineConfig({
  plugins: [WxtVitest(), vue()],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      include: ['components/**/*.vue', 'entrypoints/**/*.{ts,vue}', 'utils/**/*.ts'],
      exclude: ['**/__tests__/**', '**/main.ts'],
    },
  },
})
