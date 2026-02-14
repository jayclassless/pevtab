import { test, expect } from './fixtures'

test('service worker registers successfully', async ({ context }) => {
  let [background] = context.serviceWorkers()
  if (!background) {
    background = await context.waitForEvent('serviceworker')
  }
  expect(background.url()).toContain('background')
})

test('visualizer page loads', async ({ context, extensionId }) => {
  const page = await context.newPage()
  await page.goto(`chrome-extension://${extensionId}/visualizer.html`)
  await expect(page.locator('#app')).toBeVisible()
})
