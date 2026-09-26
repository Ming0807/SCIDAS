import { test, expect } from '@playwright/test';

import { requireAuth } from './helpers';

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
    // Dedicated user: revoking this session can never poison the shared
    // storage state other tests rely on.
    test.skip(
      !process.env.E2E_LOGOUT_EMAIL || !process.env.E2E_LOGOUT_PASSWORD,
      'E2E_LOGOUT_EMAIL/PASSWORD required for an isolated logout',
    );
    await page.goto('/login');
    await page.getByLabel('อีเมล').fill(process.env.E2E_LOGOUT_EMAIL as string);
    await page.getByLabel('รหัสผ่าน').fill(process.env.E2E_LOGOUT_PASSWORD as string);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await expect(page).toHaveURL(/\/$/, { timeout: 20000 });

    await page.goto('/settings');
    await page.getByRole('button', { name: 'เมนูผู้ใช้งาน' }).click();
    const logout = page.getByLabel('ตัวเลือกผู้ใช้งาน').getByRole('button', { name: 'ออกจากระบบ' });
    await logout.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
  });
});
