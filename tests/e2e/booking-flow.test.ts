import { test, expect } from '@playwright/test';

// Public booking flow E2E: navigate to a service detail and submit the
// booking form. Requires seeded services to exist.

test.describe('Public booking flow', () => {
  test('user can create a booking from service page', async ({ page }) => {
    // navigate to services index (language-agnostic path)
    await page.goto('/fr/services');

    // assume at least one service card exists, click the first
    const firstCard = page.locator('.service-card a').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // now on a service detail page - wait for booking form
    const form = page.locator('form.booking-form');
    await expect(form).toBeVisible();

    // fill date as tomorrow, time 12:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isoDate = tomorrow.toISOString().split('T')[0];

    await form.locator('input[name="bookingDate"]').fill(isoDate);
    await form.locator('input[name="bookingTime"]').fill('12:00');
    await form.locator('textarea[name="customerMessage"]').fill('Testing booking flow');

    await form.locator('button[type="submit"]').click();

    // Expect feedback message to appear
    const success = page.locator('.booking-feedback.success');
    await expect(success).toBeVisible();
    await expect(success).toContainText(/Réservation envoyée|success/i);
  });
});
