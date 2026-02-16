import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'pev2/dist/pev2.css'
import { devSeedPlans } from '~/utils/devSeedPlans'
import { getPlans, setPlans } from '~/utils/planStorage'

import App from './App.vue'

document.title = browser.runtime.getManifest().name ?? ''

async function init() {
  if (import.meta.env.MODE === 'development') {
    const existing = await getPlans()
    if (existing.length === 0) {
      await setPlans(devSeedPlans)
    }
  }
  createApp(App).mount('#app')
}

init()
