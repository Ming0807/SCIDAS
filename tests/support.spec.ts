import { test, expect } from '@playwright/test';

import { requireAuth } from './helpers';

/**
 * Support case flow: open a case for a seeded student and land on
 * the created case detail page.
 * Requires seeded students (tests/seed-local.mjs).
 */
test.describe('Support case flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('opens a support case and shows it on the detail page', async ({ page }) => {
    requireAuth();
    await page.goto('/support/new');

    const title = `E2E ทุนอาหารกลางวัน ${Date.now()}`;

    await page.getByLabel('นักเรียน').click();
    await page.getByRole('option', { name: /อีทูอี แอทวัน/ }).first().click();

    await page.getByLabel('หมวดหมู่ความช่วยเหลือ').click();
    await page.getByRole('option', { name: 'ด้านวิชาการ' }).click();

    await page.getByLabel('หัวข้อ / สรุปเคสโดยย่อ').fill(title);
    await page.getByLabel('รายละเอียดเพิ่มเติม').fill('E2E ขอทุนอาหารกลางวันภาคเรียนนี้');
    await page.getByRole('button', { name: 'เปิดเคส' }).click();

    await expect(page).toHaveURL(/\/support\/[0-9a-f-]{36}/, { timeout: 20000 });
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 20000 });
  });
});
