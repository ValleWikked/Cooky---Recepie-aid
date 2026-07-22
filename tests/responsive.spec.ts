import { test, expect } from './fixtures';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test.describe(`Responsive — ${vp.name} (${vp.width}×${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('tabs are visible and usable', async ({ page }) => {
      await page.goto('/index.html');

      const ingredientsTab = page.getByRole('button', { name: 'Ingredients' });
      const stepsTab = page.getByRole('button', { name: 'Cooking Steps' });

      await expect(ingredientsTab).toBeVisible();
      await expect(stepsTab).toBeVisible();

      // Tabs must be within the visible viewport (no horizontal overflow needed)
      const ingBox = await ingredientsTab.boundingBox();
      const stepsBox = await stepsTab.boundingBox();
      expect(ingBox).not.toBeNull();
      expect(stepsBox).not.toBeNull();
      expect(ingBox!.x).toBeGreaterThanOrEqual(0);
      expect(stepsBox!.x).toBeGreaterThanOrEqual(0);
    });

    test('tab switch works', async ({ page }) => {
      await page.goto('/index.html');

      await page.getByRole('button', { name: 'Cooking Steps' }).click();
      await expect(page.locator('#step-card-1')).toBeVisible();

      await page.getByRole('button', { name: 'Ingredients' }).click();
      await expect(page.getByText('Dried Chickpeas')).toBeVisible();
    });

    test('equipment settings button is visible and tappable', async ({ page }) => {
      await page.goto('/index.html');

      const settingsBtn = page.getByTestId('equipment-settings-btn');
      await expect(settingsBtn).toBeVisible();

      // Button must be within viewport horizontally
      const box = await settingsBtn.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1); // +1 for rounding

      // Open and close settings
      await settingsBtn.click();
      await expect(page.getByText('⚙️ Equipment')).toBeVisible();
      await page.getByTestId('close-settings-btn').click();
    });

    test('no horizontal overflow on the ingredients panel', async ({ page }) => {
      await page.goto('/index.html');

      // scrollWidth should not exceed clientWidth
      const overflows = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflows).toBe(false);
    });
  });
}
