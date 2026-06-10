import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 375, height: 667 }
];

const pages = ['/students', '/attendance', '/behavior'];

for (const p of pages) {
  test.describe(`Responsive layout tests for ${p}`, () => {
    for (const v of viewports) {
      test(`Viewport ${v.name}`, async ({ page }) => {
        await page.setViewportSize({ width: v.width, height: v.height });
        await page.goto(p);

        // Wait for page load
        await page.waitForLoadState('networkidle');

        // Assert no horizontal scroll (responsive issue check)
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(hasHorizontalScroll, `Horizontal scroll detected on ${v.name} for ${p}`).toBe(false);
      });
    }
  });
}
