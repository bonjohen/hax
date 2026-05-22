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

test.describe('Cluster Hub Pages', () => {
  test('body cluster hub renders intro, start here, and card grid', async ({ page }) => {
    await page.goto('/clusters/body/');

    await expect(page.locator('h1')).toContainText('Body');

    // Editorial intro from content body
    await expect(page.locator('.cluster-intro')).toContainText('Body cluster');

    // Start here strip
    const startHere = page.locator('.start-here');
    await expect(startHere).toBeVisible();
    await expect(startHere.locator('.experiment-card')).toHaveCount(3);

    // Card grids
    await expect(page.locator('#experiment-grid .experiment-card').first()).toBeVisible();
    await expect(page.locator('#talk-grid .talk-card').first()).toBeVisible();

    // Breadcrumbs
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toContainText('Clusters');
    await expect(breadcrumb).toContainText('Body');
  });

  test('all four cluster hubs are accessible', async ({ page }) => {
    for (const id of ['body', 'cognition', 'environment', 'social']) {
      await page.goto(`/clusters/${id}/`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.start-here')).toBeVisible();
      await expect(page.locator('#experiment-grid')).toBeVisible();
      await expect(page.locator('#talk-grid')).toBeVisible();
    }
  });

  test('related clusters section shows links', async ({ page }) => {
    await page.goto('/clusters/body/');
    const related = page.locator('.related-clusters');
    await expect(related).toBeVisible();
    await expect(related.locator('a')).toHaveCount(2); // cognition, environment
  });

  test('cross-cluster content appears on multiple hubs', async ({ page }) => {
    // Kelly McGonigal is tagged [cognition, body]
    await page.goto('/clusters/body/');
    await expect(page.locator('#talk-grid')).toContainText('How to make stress your friend');

    await page.goto('/clusters/cognition/');
    await expect(page.locator('#talk-grid')).toContainText('How to make stress your friend');
  });

  test('filter panel is visible', async ({ page }) => {
    await page.goto('/clusters/body/');
    // On desktop, filter panel desktop section should be visible
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator('.filter-panel__desktop')).toBeVisible();
  });
});
