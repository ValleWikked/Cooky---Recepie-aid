import { test, expect } from './fixtures';

test.describe('localStorage corruption recovery', () => {
  test('app renders when cookingviz_equipment contains invalid JSON', async ({ page }) => {
    // Pre-seed invalid JSON before loading the app
    await page.addInitScript(() => {
      localStorage.setItem('cookingviz_equipment', '{bad-json');
    });

    await page.goto('/index.html');

    // App must still render tabs — not a blank screen
    await expect(page.getByRole('button', { name: 'Ingredients' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cooking Steps' })).toBeVisible();

    // A toast warning about corruption should appear (deferred until App mounts)
    await expect(page.getByText(/corrupted/i)).toBeVisible({ timeout: 5000 });
  });

  test('app renders when cookingviz_calibrations contains invalid JSON', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookingviz_calibrations', '[[[[not json');
    });

    await page.goto('/index.html');

    // App must still render tabs
    await expect(page.getByRole('button', { name: 'Ingredients' })).toBeVisible();

    // Calibration store initialises lazily when Cooking Steps tab is opened
    await page.getByRole('button', { name: 'Cooking Steps' }).click();
    await expect(page.locator('#step-card-1')).toBeVisible();

    // A toast warning about calibration corruption should appear
    await expect(page.getByText(/corrupted/i)).toBeVisible({ timeout: 5000 });
  });

  test('app renders when both localStorage keys contain invalid JSON', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookingviz_equipment', '{bad');
      localStorage.setItem('cookingviz_calibrations', '{bad');
    });

    await page.goto('/index.html');

    // App must still render core UI
    await expect(page.getByRole('button', { name: 'Ingredients' })).toBeVisible();

    // Equipment corruption toast appears automatically
    await expect(page.getByText(/corrupted/i)).toBeVisible({ timeout: 5000 });
  });

  test('equipment settings panel shows profiles after corruption recovery', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('cookingviz_equipment', 'not-valid-json-at-all');
    });

    await page.goto('/index.html');

    // Open settings — should show default profiles (not a broken state)
    await page.getByTestId('equipment-settings-btn').click();
    // Ninja MAX PRO is a built-in default device
    await expect(page.getByText('Ninja MAX PRO')).toBeVisible();
  });
});
