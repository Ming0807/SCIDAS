import { test, expect } from '@playwright/test';

test.describe('Batch 3 Pages Responsiveness', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  const pages = [
    { path: '/development-plans', name: 'development-plans' },
    { path: '/reports', name: 'reports' },
    { path: '/notifications', name: 'notifications' },
    { path: '/settings', name: 'settings' },
  ];

  for (const pageInfo of pages) {
    for (const viewport of viewports) {
      test(`${pageInfo.name} - Snapshots at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000${pageInfo.path}`);
        await expect(page).toHaveScreenshot(`${pageInfo.name}-${viewport.name.toLowerCase()}.png`, { fullPage: true });
      });
    }
  }
});
