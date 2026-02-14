import { test, expect } from './fixtures'

test.describe('theme switching', () => {
  test('switches to light theme', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    await page.locator('button[title="Light"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'light')
  })

  test('switches to dark theme', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    await page.locator('button[title="Dark"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark')
  })

  test('theme persists across page reload', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/visualizer.html`)

    await page.locator('button[title="Dark"]').click()
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark')
  })
})
