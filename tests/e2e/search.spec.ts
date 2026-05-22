import { test, expect } from '@playwright/test';

test.describe('Search', () => {
  test('search input is visible and has accessible label', async ({ page }) => {
    await page.goto('/search/');
    const input = page.locator('input[type="search"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('aria-label', 'Search experiments and talks');
  });

  test('search input is keyboard accessible', async ({ page }) => {
    await page.goto('/search/');
    const input = page.locator('input[type="search"]');

    // Tab to skip link, then through nav items, eventually reach search input
    await input.focus();
    await expect(input).toBeFocused();

    // Type into it
    await input.fill('stress');
    await expect(input).toHaveValue('stress');
  });

  test('searching "stress" returns results', async ({ page }) => {
    await page.goto('/search/');
    const input = page.locator('input[type="search"]');
    await input.fill('stress');

    // Wait for results to appear (debounce + search)
    const results = page.locator('.search-results .search-result');
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('searching "meeting" returns results', async ({ page }) => {
    await page.goto('/search/');
    const input = page.locator('input[type="search"]');
    await input.fill('meeting');

    const results = page.locator('.search-results .search-result');
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('searching nonsense shows zero-results message', async ({ page }) => {
    await page.goto('/search/');
    const input = page.locator('input[type="search"]');
    await input.fill('xyzzy123notaword');

    // Wait for empty state
    const emptyMsg = page.locator('.search-empty');
    await expect(emptyMsg).toBeVisible({ timeout: 5000 });
    await expect(emptyMsg).toContainText('No results');

    // Should have browse suggestions
    await expect(emptyMsg).toContainText('Browse Clusters');
  });

  test('search results show type chips', async ({ page }) => {
    await page.goto('/search/');
    const input = page.locator('input[type="search"]');
    await input.fill('pose');

    const results = page.locator('.search-results .search-result');
    await expect(results.first()).toBeVisible({ timeout: 5000 });

    // At least one result should have a type chip
    const typeChip = page.locator('.result-type');
    await expect(typeChip.first()).toBeVisible();
  });
});
