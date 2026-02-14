import { test, expect } from './fixtures'
import { samplePlanJson, samplePlanName, sampleQuery } from './helpers/plan-data'

test.describe('visualizer', () => {
  test('shows empty state with side panel open', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    await expect(page.locator('#plan-source')).toBeVisible()
    await expect(page.getByText('Paste an EXPLAIN plan to visualize it.')).toBeVisible()
  })

  test('submits a plan and shows visualization', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    await page.locator('#plan-source').fill(samplePlanJson)
    await page.locator('#plan-query').fill(sampleQuery)
    await page.locator('#plan-name').fill(samplePlanName)
    await page.getByRole('button', { name: 'Visualize' }).click()

    await expect(page.locator('.list-group-item')).toHaveCount(1)
    await expect(page.locator('.list-group-item')).toContainText(samplePlanName)
    await expect(page.getByText('Paste an EXPLAIN plan to visualize it.')).not.toBeVisible()
  })

  test('selects a plan from history', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    // Submit first plan
    await page.locator('#plan-source').fill(samplePlanJson)
    await page.locator('#plan-name').fill('Plan A')
    await page.getByRole('button', { name: 'Visualize' }).click()
    await expect(page.locator('.list-group-item')).toHaveCount(1)

    // Expand side panel to submit second plan
    await page.locator('button:has-text("»")').click()

    // Submit second plan
    await page.locator('#plan-source').fill(samplePlanJson)
    await page.locator('#plan-name').fill('Plan B')
    await page.getByRole('button', { name: 'Visualize' }).click()
    await expect(page.locator('.list-group-item')).toHaveCount(2)

    // Expand side panel again
    await page.locator('button:has-text("»")').click()

    // The most recently submitted plan should be active
    // Click the non-active plan by its name
    const nonActiveItem = page.locator('.list-group-item:not(.active)').first()
    const itemName = await nonActiveItem.locator('.fw-bold').textContent()
    await nonActiveItem.click()
    // Verify it is now active
    const clickedItem = page.locator('.list-group-item', {
      hasText: itemName!,
    })
    await expect(clickedItem).toHaveClass(/active/)
  })

  test('deletes a plan', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    // Submit a plan
    await page.locator('#plan-source').fill(samplePlanJson)
    await page.locator('#plan-name').fill(samplePlanName)
    await page.getByRole('button', { name: 'Visualize' }).click()
    await expect(page.locator('.list-group-item')).toHaveCount(1)

    // Expand side panel
    await page.locator('button:has-text("»")').click()

    // Click close button to start delete confirmation
    await page.locator('.btn-close').click()
    // Confirm deletion
    await page.locator('.btn-danger').click()

    await expect(page.locator('.list-group-item')).toHaveCount(0)
    await expect(page.getByText('Paste an EXPLAIN plan to visualize it.')).toBeVisible()
  })

  test('deleting non-active plan preserves active selection', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    // Submit first plan
    await page.locator('#plan-source').fill(samplePlanJson)
    await page.locator('#plan-name').fill('Plan A')
    await page.getByRole('button', { name: 'Visualize' }).click()
    await expect(page.locator('.list-group-item')).toHaveCount(1)

    // Expand and submit second plan
    await page.locator('button:has-text("»")').click()
    await page.locator('#plan-source').fill(samplePlanJson)
    await page.locator('#plan-name').fill('Plan B')
    await page.getByRole('button', { name: 'Visualize' }).click()
    await expect(page.locator('.list-group-item')).toHaveCount(2)

    // Expand side panel
    await page.locator('button:has-text("»")').click()

    // Delete the non-active plan
    const nonActiveItem = page.locator('.list-group-item:not(.active)').first()
    const nonActiveName = await nonActiveItem.locator('.fw-bold').textContent()
    await nonActiveItem.locator('.btn-close').click()
    await nonActiveItem.getByRole('button', { name: 'Delete' }).click()

    await expect(page.locator('.list-group-item')).toHaveCount(1)
    // The remaining item should still be active
    await expect(page.locator('.list-group-item.active')).toHaveCount(1)
    // The remaining item should NOT be the one we deleted
    await expect(page.locator('.list-group-item.active .fw-bold')).not.toHaveText(nonActiveName!)
  })
})
