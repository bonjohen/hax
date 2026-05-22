import { test, expect } from '@playwright/test';

test.describe('Print Layout', () => {
  test('experiment page hides nav and footer in print', async ({ page }) => {
    await page.goto('/experiments/power-pose/');

    // Emulate print media
    await page.emulateMedia({ media: 'print' });

    // Nav and footer should be hidden
    await expect(page.locator('.site-header')).toBeHidden();
    await expect(page.locator('.site-footer')).toBeHidden();
  });

  test('print button is hidden in print media', async ({ page }) => {
    await page.goto('/experiments/power-pose/');
    await page.emulateMedia({ media: 'print' });

    // Print button has no-print class
    const printBtn = page.locator('.print-btn');
    await expect(printBtn).toBeHidden();
  });

  test('evidence details element exists for print', async ({ page }) => {
    await page.goto('/experiments/power-pose/');

    // Verify evidence details section exists (will be expanded by print dialog JS)
    const details = page.locator('.evidence-details');
    await expect(details).toBeVisible();
    await expect(details).toContainText('Evidence');
  });
});
