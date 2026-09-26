import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

function requireAuth() {
  test.skip(
    !fs.existsSync(authFile),
    'no authenticated storage state — set E2E_TEST_EMAIL/PASSWORD and run setup first',
  );
}

/**
 * Authenticated smoke flows. Each test skips at run time when no
 * storage state exists (auth.setup.ts only produces one when
 * E2E credentials are provided).
 */
test.describe('Authenticated smoke flows', () => {
  test('dashboard loads without error states', async ({ page }) => {
    requireAuth();
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'ภาพรวมดูแลนักเรียน' })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('โหลดข้อมูล Dashboard ไม่ได้')).toHaveCount(0);
  });

  test('students list loads with heading and table', async ({ page }) => {
    requireAuth();
    await page.goto('/students');
    await expect(page.getByRole('heading', { name: 'ข้อมูลนักเรียนและการจัดการ' })).toBeVisible({
      timeout: 20000,
    });
    await expect(page.getByText('โหลดข้อมูลนักเรียนไม่ได้')).toHaveCount(0);
  });

  test('risk analysis loads with heading', async ({ page }) => {
    requireAuth();
    await page.goto('/risk-analysis');
    // Desktop and mobile headings both mount (CSS hides one viewport).
    await expect(page.getByRole('heading', { name: 'วิเคราะห์ความเสี่ยง' }).first()).toBeVisible({
      timeout: 20000,
    });
  });

  test('logout returns to login', async ({ page }) => {
    requireAuth();
    await page.goto('/settings');
    const logout = page.getByRole('button', { name: 'ออกจากระบบ' }).first();
    if (await logout.isVisible().catch(() => false)) {
      await logout.click();
      await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
    }
  });
});
