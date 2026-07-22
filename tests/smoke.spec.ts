import { test, expect } from './fixtures';

test.describe('Smoke', () => {
  test('app loads from index.html', async ({ page }) => {
    await page.goto('/index.html');

    // Root div must be present and contain rendered content
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();

    // No fatal JS errors — app title is visible
    await expect(page).toHaveTitle(/Cooking Visualizer/);
  });

  test('Ingredients and Cooking Steps tabs are visible', async ({ page }) => {
    await page.goto('/index.html');

    const ingredientsTab = page.getByRole('button', { name: 'Ingredients' });
    const stepsTab = page.getByRole('button', { name: 'Cooking Steps' });

    await expect(ingredientsTab).toBeVisible();
    await expect(stepsTab).toBeVisible();
  });

  test('tabs are switchable', async ({ page }) => {
    await page.goto('/index.html');

    // Ingredients panel visible by default
    await expect(page.getByRole('button', { name: 'Ingredients' })).toBeVisible();

    // Switch to Cooking Steps
    await page.getByRole('button', { name: 'Cooking Steps' }).click();
    // Wait for tab content to appear (step 1 card)
    await expect(page.locator('#step-card-1')).toBeVisible();

    // Switch back to Ingredients
    await page.getByRole('button', { name: 'Ingredients' }).click();
    // Ingredient content visible: first ingredient is Dried Chickpeas
    await expect(page.getByText('Dried Chickpeas')).toBeVisible();
  });
});
