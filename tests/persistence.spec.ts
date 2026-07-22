import { test, expect } from './fixtures';

// ─── Equipment CRUD ─────────────────────────────────────────────────────────

test.describe('Equipment profile CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    // Clear any leftover custom equipment data
    await page.evaluate(() => {
      const raw = localStorage.getItem('cookingviz_equipment');
      if (!raw) return;
      try {
        const profiles = JSON.parse(raw);
        const defaults = profiles.filter((p: { isDefault: boolean }) => p.isDefault);
        localStorage.setItem('cookingviz_equipment', JSON.stringify(defaults));
      } catch {
        localStorage.removeItem('cookingviz_equipment');
      }
    });
    await page.reload();
  });

  test('can add a custom equipment profile', async ({ page }) => {
    // Open settings
    await page.getByTestId('equipment-settings-btn').click();
    await expect(page.getByText('⚙️ Equipment')).toBeVisible();

    // Open add form
    await page.getByTestId('add-device-btn').click();
    await expect(page.getByTestId('profile-name-input')).toBeVisible();

    // Fill in name
    await page.getByTestId('profile-name-input').fill('Test Toaster Oven');

    // Submit
    await page.getByTestId('profile-save-btn').click();

    // New profile appears in list
    await expect(page.getByText('Test Toaster Oven')).toBeVisible();
  });

  test('can edit a custom equipment profile', async ({ page }) => {
    // Seed a custom profile directly so we control its ID
    const customId = await page.evaluate(() => {
      const raw = localStorage.getItem('cookingviz_equipment');
      const profiles = raw ? JSON.parse(raw) : [];
      const custom = {
        id: 'custom_test_edit',
        name: 'Edit Me Device',
        type: 'custom',
        capacity: null,
        maxTemp: null,
        bowlCapacity: null,
        modes: [],
        icon: '⚙️',
        isDefault: false,
      };
      profiles.push(custom);
      localStorage.setItem('cookingviz_equipment', JSON.stringify(profiles));
      return custom.id;
    });
    await page.reload();

    // Open settings
    await page.getByTestId('equipment-settings-btn').click();
    await expect(page.getByText('Edit Me Device')).toBeVisible();

    // Click edit for the specific profile
    await page.getByTestId(`edit-btn-${customId}`).click();

    // Clear name and type new name
    const nameInput = page.getByTestId('profile-name-input');
    await nameInput.clear();
    await nameInput.fill('Renamed Device');

    // Save
    await page.getByTestId('profile-save-btn').click();

    // Updated name should appear
    await expect(page.getByText('Renamed Device')).toBeVisible();
    await expect(page.getByText('Edit Me Device')).not.toBeVisible();
  });

  test('can delete a custom equipment profile', async ({ page }) => {
    // Seed a deletable custom profile
    const customId = await page.evaluate(() => {
      const raw = localStorage.getItem('cookingviz_equipment');
      const profiles = raw ? JSON.parse(raw) : [];
      const custom = {
        id: 'custom_test_delete',
        name: 'Delete Me Device',
        type: 'custom',
        capacity: null,
        maxTemp: null,
        bowlCapacity: null,
        modes: [],
        icon: '⚙️',
        isDefault: false,
      };
      profiles.push(custom);
      localStorage.setItem('cookingviz_equipment', JSON.stringify(profiles));
      return custom.id;
    });
    await page.reload();

    // Open settings
    await page.getByTestId('equipment-settings-btn').click();
    await expect(page.getByText('Delete Me Device')).toBeVisible();

    // Click delete
    await page.getByTestId(`delete-btn-${customId}`).click();

    // Confirm deletion
    await page.getByTestId('confirm-delete-btn').click();

    // Profile should no longer be visible
    await expect(page.getByText('Delete Me Device')).not.toBeVisible();
  });

  test('built-in profiles cannot be deleted', async ({ page }) => {
    await page.getByTestId('equipment-settings-btn').click();

    // Built-in profiles have a lock icon but no delete button
    await expect(page.getByTestId('delete-btn-NinjaMAXPRO')).not.toBeVisible();
  });
});

// ─── Calibration persistence ─────────────────────────────────────────────────

test.describe('Calibration persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.evaluate(() => localStorage.removeItem('cookingviz_calibrations'));
    await page.reload();
  });

  test('calibration data persists across page reload', async ({ page }) => {
    // Go to Cooking Steps tab
    await page.getByRole('button', { name: 'Cooking Steps' }).click();

    // Expand step 7 (Preheating Air Fryer — first air-fryer step with calibration UI)
    const step7Card = page.locator('#step-card-7');
    await expect(step7Card).toBeVisible();
    await step7Card.getByRole('button', { name: /Show details/ }).click();

    // Fill in optimal time in the calibration form
    const calTimeInput = page.getByTestId('cal-time-input-7');
    await expect(calTimeInput).toBeVisible();
    await calTimeInput.fill('4 min');

    // Save calibration
    await page.getByTestId('cal-save-btn-7').click();

    // Verify the saved value is shown in read-only mode
    await expect(step7Card.getByText('4 min')).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await page.getByRole('button', { name: 'Cooking Steps' }).click();
    const step7Reloaded = page.locator('#step-card-7');
    await step7Reloaded.getByRole('button', { name: /Show details/ }).click();

    // Saved calibration value should still be present
    await expect(step7Reloaded.getByText('4 min')).toBeVisible();
  });
});
