import { test, expect } from '@playwright/test';

import { requireAuth } from './helpers';

/**
 * Attendance daily save flow.
 * Requires seeded classroom data (tests/seed-local.mjs); skips gracefully
 * when no classroom form is available.
 */
test.describe('Attendance save flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('marks a student absent and saves', async ({ page }) => {
    requireAuth();
    await page.goto('/attendance');

    const saveButton = page.getByRole('button', { name: 'บันทึกข้อมูล' });
    if (!(await saveButton.isVisible().catch(() => false))) {
      test.skip(true, 'no attendance form available (no classroom access)');
      return;
    }

    const classroomSelect = page.getByLabel('เลือกห้องเรียน');
    if (await classroomSelect.isVisible().catch(() => false)) {
      const options = await classroomSelect.locator('option').allTextContents().catch(() => []);
      const target = options.find((t) => t.includes('E2E')) ?? options[1];
      if (target) {
        await classroomSelect.selectOption({ label: target.trim() });
      }
    }

    // Mobile and desktop lists both mount (CSS hides one); scope to visible.
    const firstGroup = page.locator('[role="radiogroup"]:visible').first();
    await firstGroup.getByRole('radio', { name: 'ขาด' }).click();
    await saveButton.click();

    await expect(page.getByText('บันทึกการมาเรียนเรียบร้อยแล้ว')).toBeVisible({
      timeout: 20000,
    });
  });
});
