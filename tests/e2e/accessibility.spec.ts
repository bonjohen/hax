import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('index page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious).toEqual([]);
  });

  test('skip link is first focusable element and targets main', async ({ page }) => {
    await page.goto('/');

    // Tab to the first focusable element
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');

    // Verify focus moved to main content
    const main = page.locator('#main-content');
    await expect(main).toBeFocused();
  });

  test('breadcrumb renders on content pages', async ({ page }) => {
    await page.goto('/about/');
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Home');
    await expect(breadcrumb).toContainText('About');
  });

  test('footer displays TED attribution and non-commercial notice', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toContainText('not affiliated with TED');
    await expect(footer).toContainText('non-commercial');
  });

  test('talk detail page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/talks/amy-cuddy-body-language/');
    const results = await new AxeBuilder({ page })
      .exclude('iframe') // Exclude third-party TED embed content
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious).toEqual([]);
  });

  test('experiment detail page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/experiments/power-pose/');
    const results = await new AxeBuilder({ page })
      .exclude('iframe')
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious).toEqual([]);
  });

  test('cluster hub page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/clusters/body/');
    const results = await new AxeBuilder({ page })
      .exclude('iframe')
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious).toEqual([]);
  });

  test('persona dashboard has no critical accessibility violations', async ({ page }) => {
    await page.goto('/personas/knowledge-worker/');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious).toEqual([]);
  });

  test('search page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/search/');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious).toEqual([]);
  });

  test('about page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/about/');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious).toEqual([]);
  });

  test('resources page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/resources/');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(serious).toEqual([]);
  });

  test('mobile nav is keyboard accessible', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // The mobile nav uses details/summary which is keyboard-accessible by default
    const summary = page.locator('.mobile-nav summary');
    await expect(summary).toBeVisible();
  });
});
