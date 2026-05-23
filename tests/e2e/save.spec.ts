import { test, expect } from '@playwright/test';

test.describe('Save Feature', () => {
  test('save button toggles on experiment page', async ({ page }) => {
    await page.goto('experiments/power-pose/');
    const saveBtn = page.locator('.save-btn');
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toContainText('Save');

    // Save
    await saveBtn.click();
    await expect(saveBtn).toContainText('Saved');

    // Unsave
    await saveBtn.click();
    await expect(saveBtn).toContainText('Save');
  });

  test('saved experiment appears on /saved/ page', async ({ page }) => {
    // Save an experiment
    await page.goto('experiments/stress-reframe/');
    await page.locator('.save-btn').click();
    await expect(page.locator('.save-btn')).toContainText('Saved');

    // Navigate to saved page
    await page.goto('saved/');
    const savedItem = page.locator('.save-item');
    await expect(savedItem).toBeVisible();
    await expect(savedItem).toContainText('Stress Reframe');
  });

  test('remove from saved page works', async ({ page }) => {
    // Save an experiment
    await page.goto('experiments/walking-meeting/');
    await page.locator('.save-btn').click();

    // Go to saved page and remove
    await page.goto('saved/');
    await expect(page.locator('.save-item')).toBeVisible();
    await page.locator('.remove-btn').first().click();

    // Should show empty state
    await expect(page.locator('.save-manager--empty')).toBeVisible();
  });

  test('empty state shows browse link', async ({ page }) => {
    await page.goto('saved/');
    const emptyState = page.locator('.save-manager--empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No saved experiments');
    await expect(page.locator('.browse-link')).toBeVisible();
  });
});
