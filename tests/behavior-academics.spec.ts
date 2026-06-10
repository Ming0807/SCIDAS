import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];

const pagesToTest = [
  { path: '/behavior', name: 'Behavior' },
  { path: '/academics', name: 'Academics' },
  { path: '/home-visits', name: 'Home Visits' },
];

test.describe('Responsive Layout Tests for Behavior, Academics, and Home Visits pages', () => {
  for (const pageInfo of pagesToTest) {
    for (const viewport of viewports) {
      test(`Page ${pageInfo.name} should display correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000${pageInfo.path}`);

        // Wait for page to be ready
        await page.waitForLoadState('networkidle');

        // Check if there's any horizontal scrollbar (which usually indicates a layout issue)
        const isHorizontalScrollbarVisible = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(isHorizontalScrollbarVisible).toBeFalsy();

        // Optionally take a screenshot to track visual regression if needed
        // await expect(page).toHaveScreenshot(`${pageInfo.name.toLowerCase()}-${viewport.name.toLowerCase()}.png`, { fullPage: true });
      });
    }
  }
});
