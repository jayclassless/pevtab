import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'PostgresExplainerTab',
    homepage_url: 'https://github.com/jayclassless/pevtab',
    permissions: ['storage'],
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
