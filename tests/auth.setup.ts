import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

/**
 * One-time login producing a reusable storage state.
 * Requires E2E_TEST_EMAIL / E2E_TEST_PASSWORD; skips otherwise so local
 * runs and CI without secrets stay green.
 */
setup('authenticate once', async ({ page }) => {
  setup.skip(
    !process.env.E2E_TEST_EMAIL || !process.env.E2E_TEST_PASSWORD,
    'E2E_TEST_EMAIL/PASSWORD not set — skipping authenticated setup',
  );

  await page.goto('/login');
  await page.getByLabel('อีเมล').fill(process.env.E2E_TEST_EMAIL as string);
  await page.getByLabel('รหัสผ่าน').fill(process.env.E2E_TEST_PASSWORD as string);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

  await expect(page).toHaveURL(/\/$/, { timeout: 20000 });
  await expect(page.getByRole('heading', { name: 'ภาพรวมดูแลนักเรียน' })).toBeVisible({
    timeout: 20000,
  });

  await page.context().storageState({ path: authFile });
});
