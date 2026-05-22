import { test, expect } from '@playwright/test';

test.describe('Talk Detail Pages', () => {
  test('talk page renders all required elements', async ({ page }) => {
    await page.goto('/talks/amy-cuddy-body-language/');

    // Title
    await expect(page.locator('h1')).toContainText('Your body language may shape who you are');

    // Speaker
    await expect(page.locator('.talk-speaker')).toContainText('Amy Cuddy');

    // Evidence badge
    await expect(page.locator('.evidence-badge')).toBeVisible();

    // TED embed or link
    const tedLink = page.locator('a[href*="ted.com"]');
    await expect(tedLink.first()).toBeVisible();

    // Related experiments in sidebar
    await expect(page.locator('.sidebar-section')).toContainText('Related Experiments');
    await expect(page.locator('.sidebar-list a')).toContainText('Two-Minute Power Pose');

    // Evidence details (collapsible)
    const evidenceDetails = page.locator('.evidence-details');
    await expect(evidenceDetails).toBeVisible();
    await expect(evidenceDetails.locator('summary')).toBeVisible();

    // Breadcrumbs
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Talks');

    // Last reviewed date
    await expect(page.locator('.content-footer')).toContainText('Last reviewed');
  });

  test('talk page has transcript link', async ({ page }) => {
    await page.goto('/talks/amy-cuddy-body-language/');
    const transcriptLink = page.locator('a:has-text("Read transcript")');
    await expect(transcriptLink).toBeVisible();
    await expect(transcriptLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('Experiment Detail Pages', () => {
  test('experiment page renders all required elements', async ({ page }) => {
    await page.goto('/experiments/power-pose/');

    // Title
    await expect(page.locator('h1')).toContainText('Two-Minute Power Pose');

    // One-line claim
    await expect(page.locator('.experiment-claim')).toBeVisible();

    // Instructions (ordered list)
    const instructions = page.locator('.instructions-list li');
    await expect(instructions).toHaveCount(4);

    // Evidence badge
    await expect(page.locator('.evidence-badge')).toBeVisible();

    // Time cost and effort
    await expect(page.locator('.experiment-meta')).toContainText('2 min');
    await expect(page.locator('.experiment-meta')).toContainText('Low effort');

    // Source talks in sidebar
    await expect(page.locator('.sidebar-section')).toContainText('Source Talks');

    // Evidence details (collapsible)
    const evidenceDetails = page.locator('.evidence-details');
    await expect(evidenceDetails).toBeVisible();

    // Breadcrumbs
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('Experiments');

    // Last reviewed date
    await expect(page.locator('.content-footer')).toContainText('Last reviewed');
  });

  test('experiment page shows contraindications when present', async ({ page }) => {
    await page.goto('/experiments/power-pose/');
    const contra = page.locator('.contraindications');
    await expect(contra).toBeVisible();
    await expect(contra).toContainText('Not recommended as a substitute');
  });
});
