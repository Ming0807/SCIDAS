import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 },
];

const pagesToTest = [
  '/academics',
  '/home-visits',
  '/support',
];

for (const pagePath of pagesToTest) {
  test.describe(`Responsive Layout Tests for ${pagePath}`, () => {
    for (const vp of viewports) {
      test(`should display correctly on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`http://localhost:3000${pagePath}`);

        // Wait for network idle to ensure content is loaded
        await page.waitForLoadState('networkidle');

        // Check for specific elements or just take a screenshot
        await expect(page).toHaveScreenshot(`${pagePath.replace('/', '')}-${vp.name.toLowerCase()}.png`, {
          fullPage: true,
          maxDiffPixels: 100, // allow small diffs for rendering
        });
      });
    }
  });
}
