import type { Page } from '@playwright/test'

export const TEST_CREDENTIALS = {
  email: process.env.E2E_EMAIL ?? 'admin@example.com',
  password: process.env.E2E_PASSWORD ?? 'Admin@123',
}

export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/', { timeout: 10_000 })
}
