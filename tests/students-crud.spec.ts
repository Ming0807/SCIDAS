import { test, expect } from '@playwright/test';

import { requireAuth } from './helpers';

/**
 * Student lifecycle: create → edit → archive.
 * Uses timestamped codes so reruns never collide; archived rows stay
 * in the database by design (no hard delete).
 */
test.describe('Student lifecycle', () => {
  // Order-dependent (create produces the detail URL the rest use).
  test.describe.configure({ mode: 'serial' });

  const code = `E2E${Date.now().toString().slice(-8)}`;
  const firstName = 'อีทูอี';
  const lastName = `ทดสอบ${Date.now().toString().slice(-4)}`;
  const nickname = `นิค${Date.now().toString().slice(-4)}`;
  let detailUrl = '';

  test('creates a student and lands on the detail page', async ({ page }) => {
    requireAuth();
    await page.goto('/students/new');

    await page.getByLabel('รหัสนักเรียน *').fill(code);
    await page.getByLabel('ชื่อ *').fill(firstName);
    await page.getByLabel('นามสกุล *').fill(lastName);
    await page.getByLabel('เพศ *').selectOption('male');
    await page.getByLabel('วันเกิด *').fill('2015-05-05');
    await page.getByRole('button', { name: 'บันทึก' }).click();

    await expect(page).toHaveURL(/\/students\/[0-9a-f-]{36}/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible({
      timeout: 20000,
    });
    detailUrl = page.url();
    expect(detailUrl).toContain('/students/');
  });

  test('edits the student nickname', async ({ page }) => {
    requireAuth();
    test.skip(!detailUrl, 'create step did not produce a detail URL');

    await page.goto(detailUrl);
    await page.getByRole('link', { name: /แก้ไขข้อมูล/ }).click();
    await expect(page.getByRole('heading', { name: 'แก้ไขข้อมูลนักเรียน' })).toBeVisible();

    await page.getByLabel('ชื่อเล่น').fill(nickname);
    await page.getByRole('button', { name: 'บันทึก', exact: true }).click();

    await expect(page.getByText(`ชื่อเล่น ${nickname}`, { exact: false })).toBeVisible({
      timeout: 20000,
    });
  });

  test('archives the student as transferred', async ({ page }) => {
    requireAuth();
    test.skip(!detailUrl, 'create step did not produce a detail URL');

    await page.goto(detailUrl);
    await page.getByRole('link', { name: /แก้ไขข้อมูล/ }).click();
    await page.getByRole('button', { name: 'ย้ายออก', exact: true }).click();
    await page.getByRole('button', { name: 'ยืนยันย้ายออก' }).click();

    await expect(page.getByText('ย้ายออก').first()).toBeVisible({ timeout: 20000 });
  });
});
