import { test, expect } from '@playwright/test';

/**
 * Public authentication flows — no session required.
 * Safe against production: failed logins and reset requests for
 * non-existent accounts have no side effects.
 */
test.describe('Authentication flows', () => {
  test('login page shows email form, Google button, and forgot link', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('SCIDAS', { exact: true })).toBeVisible();
    await expect(page.getByLabel('อีเมล')).toBeVisible();
    await expect(page.getByLabel('รหัสผ่าน')).toBeVisible();
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /เข้าสู่ระบบด้วย Google/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ลืมรหัสผ่าน?' })).toBeVisible();
  });

  test('empty login submit shows Thai validation', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    await expect(page.getByText('กรุณากรอกอีเมลและรหัสผ่าน', { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('wrong credentials show Thai error and stay on login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('อีเมล').fill('no-such-user-zzz@example.com');
    await page.getByLabel('รหัสผ่าน').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    await expect(page.getByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง', { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page).toHaveURL(/\/login/);
  });

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    for (const path of ['/', '/students', '/risk-analysis', '/settings/staff']) {
      await page.goto(path);
      await expect(page, `expected ${path} to bounce to login`).toHaveURL(/\/login/);
    }
  });

  test('forgot page validates empty email', async ({ page }) => {
    await page.goto('/login/forgot');

    await expect(page.getByText('ลืมรหัสผ่าน', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'ส่งลิงก์รีเซ็ตรหัสผ่าน' }).click();
    await expect(page.getByText('กรุณากรอกอีเมลที่ใช้สมัคร', { exact: true })).toBeVisible();
  });

  test('forgot page accepts a well-formed email', async ({ page }) => {
    await page.goto('/login/forgot');
    await page.getByLabel('อีเมล').fill('no-such-user-zzz@example.com');
    await page.getByRole('button', { name: 'ส่งลิงก์รีเซ็ตรหัสผ่าน' }).click();

    await expect(page.getByText('ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว')).toBeVisible({ timeout: 15000 });
  });

  test('back links return to login', async ({ page }) => {
    await page.goto('/login/forgot');
    await page.getByRole('link', { name: 'กลับไปหน้าเข้าสู่ระบบ' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
