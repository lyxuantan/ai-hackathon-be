import { test, expect } from '@playwright/test'
import { loginAs, TEST_CREDENTIALS } from './helpers/auth'

test.describe('Login', () => {
  test('đăng nhập thành công với đúng credentials', async ({ page }) => {
    await loginAs(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password)
    await expect(page).toHaveURL('/')
  })

  test('sai password hiển thị error toast', async ({ page }) => {
    await page.goto('/login')
    await page.fill('#email', TEST_CREDENTIALS.email)
    await page.fill('#password', 'wrong-password-xyz')
    await page.click('button[type="submit"]')
    // Radix Toast có role="alert" khi destructive
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 8_000 })
  })

  test('để trống fields hiển thị validation errors', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')
    // react-hook-form với zod sẽ render p.text-destructive cho cả 2 fields
    const errors = page.locator('p.text-xs.text-destructive')
    await expect(errors.first()).toBeVisible()
    await expect(errors).toHaveCount(2)
  })

  test('truy cập route protected khi chưa login redirect về /login', async ({ page }) => {
    // Xóa token nếu có
    await page.goto('/login')
    await page.evaluate(() => localStorage.removeItem('accessToken'))

    await page.goto('/system-parameters')
    await expect(page).toHaveURL('/login')
  })
})
