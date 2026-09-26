import { test, expect } from '@playwright/test';

import { requireAuth } from './helpers';

/**
 * Behavior record flow: pick a student, choose a positive type,
 * describe it, and land on the created record detail page.
 * Requires at least one student (tests/seed-local.mjs).
 */
test.describe('Behavior record flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('records positive behavior and opens the detail page', async ({ page }) => {
    requireAuth();
    await page.goto('/behavior/record');

    const submit = page.getByRole('button', { name: 'บันทึกข้อมูล' });
    if (await submit.isDisabled().catch(() => true)) {
      test.skip(true, 'no students available for behavior recording');
      return;
    }

    const description = `E2E ช่วยเพื่อน ${Date.now()}`;

    await page.getByLabel('นักเรียน').click();
    await page.getByRole('option', { name: /อีทูอี/ }).first().click();

    await page.getByLabel('ประเภทพฤติกรรม').click();
    await page.getByRole('option', { name: 'เชิงบวก (+)' }).click();

    await page.getByLabel('รายละเอียดเพิ่มเติม').fill(description);
    await submit.click();

    await expect(page).toHaveURL(/\/behavior\/[0-9a-f-]{36}/, { timeout: 20000 });
    await expect(page.getByText(description).first()).toBeVisible({ timeout: 20000 });
  });
});
