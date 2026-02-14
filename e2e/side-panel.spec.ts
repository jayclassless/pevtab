import { test, expect } from './fixtures'

test.describe('side panel', () => {
  test('collapses when toggle is clicked', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    // Panel starts open with form visible
    await expect(page.locator('#plan-source')).toBeVisible()

    // Click collapse toggle (« button)
    await page.locator('button:has-text("«")').click()

    // Panel content should be hidden
    await expect(page.locator('#plan-source')).not.toBeVisible()
  })

  test('re-expands when toggle is clicked again', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    // Collapse
    await page.locator('button:has-text("«")').click()
    await expect(page.locator('#plan-source')).not.toBeVisible()

    // Re-expand (» button)
    await page.locator('button:has-text("»")').click()
    await expect(page.locator('#plan-source')).toBeVisible()
  })
})
