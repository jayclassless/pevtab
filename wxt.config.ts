import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue', '@wxt-dev/auto-icons'],
  manifestVersion: 3,
  manifest: {
    name: 'PostgresExplainerTab',
    homepage_url: 'https://github.com/jayclassless/pevtab',
    permissions: ['storage'],
    action: {},
    incognito: 'split',
    browser_specific_settings: {
      gecko: {
        id: '@pevtab.classless.net',
        // @ts-expect-error WXT types don't include this valid Firefox manifest key
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
  },
  autoIcons: {
    developmentIndicator: 'overlay',
  },
  zip: {
    excludeSources: ['coverage/**', 'test-results/**', 'playwright-report/**', 'plans/**'],
  },
  vite: () => ({
    resolve: {
      alias: {
        // The default vue ESM build includes the runtime template compiler,
        // which uses new Function() — forbidden by MV3's CSP. Force the
        // runtime-only build that relies on pre-compiled templates.
        vue: 'vue/dist/vue.runtime.esm-bundler.js',
      },
    },
  }),
})
