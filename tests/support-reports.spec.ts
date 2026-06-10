import { test, expect } from '@playwright/test';

test.describe('Support & Reports Pages Responsiveness', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  const pages = [
    '/support',
    '/development-plans',
    '/reports',
    '/notifications'
  ];

  for (const pagePath of pages) {
    for (const viewport of viewports) {
      test(`Snapshots ${pagePath} at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000${pagePath}`);

        // Wait for network idle or main content to load if necessary
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot(`${pagePath.replace('/', '')}-${viewport.name.toLowerCase()}.png`, { fullPage: true });
      });
    }
  }
});
