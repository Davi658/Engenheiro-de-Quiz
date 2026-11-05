import { test, expect, type Locator, type Page } from '@playwright/test';
import { PILOT, SECOND, completePilot, identify } from './helpers';

async function tabTo(page: Page, target: Locator, max = 25) {
  for (let i = 0; i < max; i++) {
    if (await target.evaluate(el => el === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Elemento não alcançado por teclado.');
}

const noHorizontalOverflow = (page: Page) =>
  expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

test('fluxo do piloto acessível por teclado', async ({ page }) => {
  await page.goto(PILOT);
  await expect(page.getByText('Página 1 de 9')).toBeVisible();
  await expect(page.locator('#titulo-etapa')).toBeFocused();

  // Tab até o primeiro checkbox
  await page.keyboard.press('Tab');
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await expect(firstCheckbox).toBeFocused();
  await page.keyboard.press('Space');
  await expect(firstCheckbox).toBeChecked();

  // Continuar para página 2
  await tabTo(page, page.getByRole('button', { name: 'Continuar' }));
  await page.keyboard.press('Enter');

  // Página 2
  await expect(page.getByText('Página 2 de 9')).toBeVisible();
  await expect(page.locator('#titulo-etapa')).toBeFocused();
});

test('erro de página foca a primeira pergunta inválida e é associado a ela', async ({ page }) => {
  await page.goto(PILOT);
  await page.getByRole('button', { name: 'Continuar' }).click();
  const first = page.locator('input[type="checkbox"]').first();
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-describedby', 'erro-servicos');
  await expect(page.locator('#erro-servicos')).toHaveText('Selecione pelo menos uma alternativa.');
});

test.describe('360 px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('piloto e relatório sem rolagem horizontal', async ({ page }) => {
    await page.goto('/');
    await noHorizontalOverflow(page);
    await page.goto(PILOT);
    await noHorizontalOverflow(page);
    await completePilot(page);
    await noHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Ver relatório completo' }).click();
    await noHorizontalOverflow(page);
  });

  test('segundo quiz sem rolagem horizontal', async ({ page }) => {
    await page.goto(SECOND);
    await noHorizontalOverflow(page);
  });
});

test('perfil tem texto equivalente e não depende só de cor', async ({ page }) => {
  await completePilot(page);
  await expect(page.locator('.profile')).toContainText('Perfil do negócio');
  await expect(page.locator('.profile-label')).toBeVisible();
});

test('nenhum armazenamento, identificação fora da URL e nenhum recurso externo', async ({ page, baseURL }) => {
  const requests: { url: string; body: string | null }[] = [];
  page.on('request', r => requests.push({ url: r.url(), body: r.postData() }));
  await completePilot(page);
  await page.getByRole('button', { name: 'Ver relatório completo' }).click();
  await expect(page.locator('.dre-overview')).toBeVisible();

  const storage = await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookie: document.cookie }));
  expect(storage).toEqual({ local: 0, session: 0, cookie: '' });
  expect(await page.context().cookies()).toEqual([]);
  expect(new URL(page.url()).search).toBe('?quiz=beleza-unhas');

  const origin = new URL(baseURL!).origin;
  expect(requests.length).toBeGreaterThan(0);
  for (const r of requests) {
    expect(new URL(r.url).origin, r.url).toBe(origin);
    const data = decodeURIComponent(r.url) + (r.body ?? '');
    expect(data).not.toContain('Pessoa Teste');
    expect(data).not.toContain('teste@example.com');
  }
});
