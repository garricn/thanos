import { test, expect, type Page } from '@playwright/test';

test.describe('App', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/');
  });

  test('should display hello world', async ({ page }: { page: Page }) => {
    await expect(page.getByRole('heading', { name: 'Hello World' })).toBeVisible();
  });
});
