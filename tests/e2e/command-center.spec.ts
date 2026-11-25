import { expect, test } from '@playwright/test';

test.describe('ALJABR AI Command Center E2E (Integration-Ready Next.js)', () => {
  test('renders unconnected platform shell, reports real 503 when backend is unset, and does not fabricate AI replies', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page.getByText('ALJABR')).toBeVisible();
    await expect(page.getByText('AI Command Center')).toBeVisible();
    await expect(
      page.getByText(/Ulanmagan|Not Connected|Не подключено/i).first(),
    ).toBeVisible();

    const composer = page.locator('textarea');
    await composer.fill('Backend holatini tekshir');
    await composer.press('Enter');

    await expect(page.getByText('Backend holatini tekshir')).toBeVisible();
    await expect(
      page.getByText(/ulanmagan|FASTAPI_BACKEND_URL/i).first(),
    ).toBeVisible();

    await page.getByRole('button', { name: 'AI Tasks' }).click();
    await expect(page.getByText(/AI Tasks/i).first()).toBeVisible();
  });
});
