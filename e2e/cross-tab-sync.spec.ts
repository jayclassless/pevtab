import { test, expect } from './fixtures'
import { samplePlanJson } from './helpers/plan-data'

test.describe('cross-tab sync', () => {
  test('plan saved in one tab appears in the other', async ({ context, extensionId }) => {
    const url = `chrome-extension://${extensionId}/visualizer.html`

    const page1 = await context.newPage()
    await page1.goto(url)

    const page2 = await context.newPage()
    await page2.goto(url)

    // Both tabs start empty
    await expect(page1.locator('.list-group-item')).toHaveCount(0)
    await expect(page2.locator('.list-group-item')).toHaveCount(0)

    // Submit a plan in page1
    await page1.locator('#plan-source').fill(samplePlanJson)
    await page1.locator('#plan-name').fill('Synced Plan')
    await page1.getByRole('button', { name: 'Visualize' }).click()
    await expect(page1.locator('.list-group-item')).toHaveCount(1)

    // page2 should pick up the new plan via storage watcher
    await expect(page2.locator('.list-group-item')).toHaveCount(1)
    await expect(page2.locator('.list-group-item')).toContainText('Synced Plan')
  })

  test('plan deleted in one tab is removed from the other', async ({ context, extensionId }) => {
    const url = `chrome-extension://${extensionId}/visualizer.html`

    const page1 = await context.newPage()
    await page1.goto(url)

    // Submit two plans
    await page1.locator('#plan-source').fill(samplePlanJson)
    await page1.locator('#plan-name').fill('Plan A')
    await page1.getByRole('button', { name: 'Visualize' }).click()
    await expect(page1.locator('.list-group-item')).toHaveCount(1)

    await page1.locator('button:has-text("»")').click()
    await page1.locator('#plan-source').fill(samplePlanJson)
    await page1.locator('#plan-name').fill('Plan B')
    await page1.getByRole('button', { name: 'Visualize' }).click()
    await expect(page1.locator('.list-group-item')).toHaveCount(2)

    // Open page2 — it should see both plans
    const page2 = await context.newPage()
    await page2.goto(url)
    await expect(page2.locator('.list-group-item')).toHaveCount(2)

    // Delete a plan in page1
    await page1.locator('button:has-text("»")').click()
    await page1.locator('.list-group-item').first().locator('.btn-close').click()
    await page1.locator('.btn-danger').click()
    await expect(page1.locator('.list-group-item')).toHaveCount(1)

    // page2 should reflect the deletion
    await expect(page2.locator('.list-group-item')).toHaveCount(1)
  })

  test('active plan removed externally falls back to another plan', async ({
    context,
    extensionId,
  }) => {
    const url = `chrome-extension://${extensionId}/visualizer.html`

    const page1 = await context.newPage()
    await page1.goto(url)

    // Submit two plans from page1
    await page1.locator('#plan-source').fill(samplePlanJson)
    await page1.locator('#plan-name').fill('Plan A')
    await page1.getByRole('button', { name: 'Visualize' }).click()
    await expect(page1.locator('.list-group-item')).toHaveCount(1)

    await page1.locator('button:has-text("»")').click()
    await page1.locator('#plan-source').fill(samplePlanJson)
    await page1.locator('#plan-name').fill('Plan B')
    await page1.getByRole('button', { name: 'Visualize' }).click()
    await expect(page1.locator('.list-group-item')).toHaveCount(2)

    // Open page2 — it sees both plans, with the most recent active
    const page2 = await context.newPage()
    await page2.goto(url)
    await expect(page2.locator('.list-group-item')).toHaveCount(2)
    await expect(page2.locator('.list-group-item.active')).toContainText('Plan B')

    // Delete Plan B (the active plan on page2) from page1
    await page1.locator('button:has-text("»")').click()
    const planBItem = page1.locator('.list-group-item', { hasText: 'Plan B' })
    await planBItem.locator('.btn-close').click()
    await planBItem.getByRole('button', { name: 'Delete' }).click()
    await expect(page1.locator('.list-group-item')).toHaveCount(1)

    // page2 should fall back to Plan A and still show a visualization
    await expect(page2.locator('.list-group-item')).toHaveCount(1)
    await expect(page2.locator('.list-group-item.active')).toContainText('Plan A')
    await expect(page2.getByText('Paste an EXPLAIN plan to visualize it.')).not.toBeVisible()
  })

  test('all plans removed externally clears the view', async ({ context, extensionId }) => {
    const url = `chrome-extension://${extensionId}/visualizer.html`

    const page1 = await context.newPage()
    await page1.goto(url)

    // Submit a plan from page1
    await page1.locator('#plan-source').fill(samplePlanJson)
    await page1.locator('#plan-name').fill('Only Plan')
    await page1.getByRole('button', { name: 'Visualize' }).click()
    await expect(page1.locator('.list-group-item')).toHaveCount(1)

    // Open page2 — it sees the plan
    const page2 = await context.newPage()
    await page2.goto(url)
    await expect(page2.locator('.list-group-item')).toHaveCount(1)

    // Delete the only plan from page1
    await page1.locator('button:has-text("»")').click()
    await page1.locator('.btn-close').click()
    await page1.locator('.btn-danger').click()
    await expect(page1.locator('.list-group-item')).toHaveCount(0)

    // page2 should show empty state
    await expect(page2.locator('.list-group-item')).toHaveCount(0)
    await expect(page2.getByText('Paste an EXPLAIN plan to visualize it.')).toBeVisible()
  })
})
