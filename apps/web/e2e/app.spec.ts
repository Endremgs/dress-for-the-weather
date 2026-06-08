import { test, expect } from '@playwright/test';

test.describe('Kledningsapp', () => {
  test.beforeEach(async ({ page }) => {
    // Mock geolocation to Oslo so tests don't depend on real location
    await page.context().setGeolocation({ latitude: 59.9139, longitude: 10.7522 });
    await page.context().grantPermissions(['geolocation']);
  });

  test('homepage loads with title and controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Kle deg riktig' })).toBeVisible();
    await expect(page.getByText('Basert på lokalt vær og aktivitet')).toBeVisible();
  });

  test('all activity buttons are visible', async ({ page }) => {
    await page.goto('/');
    const activities = ['Rusling', 'Løping', 'Sykling', 'Fjelltur', 'Langrenn', 'Alpint', 'Klatring', 'Svømming'];
    for (const activity of activities) {
      await expect(page.getByText(activity)).toBeVisible();
    }
  });

  test('clicking an activity selects it', async ({ page }) => {
    await page.goto('/');
    const løpingBtn = page.getByRole('button', { name: /Løping/ });
    await løpingBtn.click();
    await expect(løpingBtn).toHaveClass(/border-blue-500/);
  });

  test('duration buttons are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '15 min' })).toBeVisible();
    await expect(page.getByRole('button', { name: '1 t' })).toBeVisible();
    await expect(page.getByRole('button', { name: '4 t' })).toBeVisible();
  });

  test('clicking a duration selects it', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByRole('button', { name: '2 t' });
    await btn.click();
    await expect(btn).toHaveClass(/bg-blue-500/);
  });

  test('sensitivity slider is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('slider')).toBeVisible();
    await expect(page.getByText('Normal')).toBeVisible();
  });

  test('shows loading state while fetching weather', async ({ page }) => {
    // Intercept to slow down the API
    await page.route('/api/recommend', async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.continue();
    });
    await page.goto('/');
    await expect(page.getByText(/Henter/)).toBeVisible();
  });

  test('api/recommend returns valid result for Oslo', async ({ request }) => {
    const res = await request.post('/api/recommend', {
      data: {
        lat: 59.9139,
        lon: 10.7522,
        activity: { type: 'rusling', durationMinutes: 60 },
        user: { sensitivity: 0 },
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('summary');
    expect(body).toHaveProperty('garments');
    expect(body).toHaveProperty('targetClo');
    expect(body).toHaveProperty('weather');
  });

  test('api/recommend returns 400 for missing lat/lon', async ({ request }) => {
    const res = await request.post('/api/recommend', {
      data: { activity: { type: 'rusling', durationMinutes: 60 } },
    });
    expect(res.status()).toBe(400);
  });

  test('api/recommend returns 400 for missing activity', async ({ request }) => {
    const res = await request.post('/api/recommend', {
      data: { lat: 59.9139, lon: 10.7522 },
    });
    expect(res.status()).toBe(400);
  });

  test('footer links to api.met.no', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'api.met.no' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://api.met.no');
  });
});
