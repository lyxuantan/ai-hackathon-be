import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'off',
    headless: true,
  },
  reporter: [
    ['json', { outputFile: 'test-results/failures.json' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
})
