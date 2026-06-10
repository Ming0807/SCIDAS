import { test, expect } from '@playwright/test';

test.describe('Risk Analysis Page Responsiveness', () => {
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ];

  for (const viewport of viewports) {
    test(`Snapshots at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/risk-analysis');
      await expect(page).toHaveScreenshot(`risk-analysis-${viewport.name.toLowerCase()}.png`, { fullPage: true });
    });
  }
});
