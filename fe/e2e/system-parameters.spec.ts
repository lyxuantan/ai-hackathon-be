// fe/e2e/system-parameters.spec.ts
import { test, expect } from '@playwright/test'
import { loginAs, TEST_CREDENTIALS } from './helpers/auth'

const TEST_PARAM = {
  name: 'E2E Test Param',
  key: 'E2E_TEST_PARAM',
  value: '12345',
  description: 'Created by Playwright E2E test',
}

test.describe('System Parameters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_CREDENTIALS.email, TEST_CREDENTIALS.password)
    await page.goto('/system-parameters')
    await expect(page.locator('h1')).toHaveText('Danh mục tham số')
  })

  test('hiển thị danh sách params', async ({ page }) => {
    // Table header phải render đủ 5 cột
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('thead th')).toHaveCount(5)
  })

  test('tạo param mới thành công', async ({ page }) => {
    // Mở modal tạo mới
    await page.click('button:has-text("Thêm mới")')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('text=Thêm mới cấu hình hệ thống')).toBeVisible()

    // Điền form
    await page.fill('#name', TEST_PARAM.name)
    await page.fill('#key', TEST_PARAM.key)
    await page.fill('#value', TEST_PARAM.value)
    await page.fill('#description', TEST_PARAM.description)

    // Submit
    await page.click('button:has-text("Lưu")')

    // Modal đóng sau khi success
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 8_000 })

    // Row mới xuất hiện trong table
    await expect(page.locator(`td:has-text("${TEST_PARAM.key}")`)).toBeVisible()
  })

  test('edit param thành công', async ({ page }) => {
    // Tìm row của E2E_TEST_PARAM (phải tạo trước — chạy sau task create)
    const row = page.locator('tr', { has: page.locator(`td:has-text("${TEST_PARAM.key}")`) })
    await expect(row).toBeVisible({ timeout: 8_000 })

    // Click nút Chỉnh sửa (title="Chỉnh sửa")
    await row.locator('button[title="Chỉnh sửa"]').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('text=Chỉnh sửa cấu hình hệ thống')).toBeVisible()

    // Sửa value
    await page.fill('#value', '99999')
    await page.click('button:has-text("Lưu")')

    // Modal đóng
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 8_000 })
  })

  test('xóa param thành công', async ({ page }) => {
    // Tìm row của E2E_TEST_PARAM
    const row = page.locator('tr', { has: page.locator(`td:has-text("${TEST_PARAM.key}")`) })
    await expect(row).toBeVisible({ timeout: 8_000 })

    // Click nút Xoá (title="Xoá")
    await row.locator('button[title="Xoá"]').click()

    // Confirm dialog xuất hiện
    await expect(page.locator('text=Xác nhận xóa')).toBeVisible()

    // Click "Xác nhận"
    await page.click('button:has-text("Xác nhận")')

    // Row biến mất
    await expect(
      page.locator(`td:has-text("${TEST_PARAM.key}")`),
    ).not.toBeVisible({ timeout: 8_000 })
  })

  test('search filter lọc đúng kết quả', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Tìm theo tên tham số hoặc mô tả..."]')
    await searchInput.fill('không_tồn_tại_xyz_abc')

    // Debounce 300ms + API call
    await page.waitForTimeout(600)
    await expect(page.locator('text=Không có kết quả phù hợp')).toBeVisible()

    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(600)
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })
})
