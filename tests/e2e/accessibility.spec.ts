import { test, expect, type Locator, type Page } from '@playwright/test';
import { PILOT, SECOND, completePilot, identify } from './helpers';

async function tabTo(page: Page, target: Locator, max = 15) {
  for (let i = 0; i < max; i++) {
    if (await target.evaluate(el => el === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Elemento não alcançado por teclado.');
}

const noHorizontalOverflow = (page: Page) =>
  expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

test('fluxo completo do piloto somente por teclado', async ({ page }) => {
  await page.goto(PILOT);
  await tabTo(page, page.getByLabel('Seu nome'));
  await page.keyboard.type('Pessoa Teste');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Seu email')).toBeFocused();
  await page.keyboard.type('teste@example.com');
  await page.keyboard.press('Enter');

  for (let i = 1; i <= 5; i++) {
    await expect(page.getByText(`Página ${i} de 5`)).toBeVisible();
    await expect(page.locator('#titulo-etapa')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="radio"]').first()).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.locator('input[type="radio"]').first()).toBeChecked();
    await tabTo(page, page.getByRole('button', { name: i === 5 ? 'Ver prévia' : 'Continuar' }));
    await page.keyboard.press('Enter');
  }
  await expect(page.getByRole('heading', { name: 'Sua prévia' })).toBeFocused();
  await expect(page.getByTestId('minimo')).toHaveText('R$ 33,69');
  await tabTo(page, page.getByRole('button', { name: 'Ver relatório de demonstração' }));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Relatório de demonstração' })).toBeFocused();
});

test('erro de página foca a primeira pergunta inválida e é associado a ela', async ({ page }) => {
  await page.goto(PILOT);
  await identify(page);
  await page.getByRole('button', { name: 'Continuar' }).click();
  const first = page.locator('input[type="radio"]').first();
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-describedby', 'erro-servico');
  await expect(page.locator('#erro-servico')).toHaveText('Escolha uma alternativa.');
});

test.describe('360 px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('piloto e relatório sem rolagem horizontal', async ({ page }) => {
    await page.goto('/');
    await noHorizontalOverflow(page);
    await page.goto(PILOT);
    await noHorizontalOverflow(page);
    await identify(page);
    await noHorizontalOverflow(page);
    await completePilot(page, ['Alongamento', 'Nail art elaborada', 'Precisa remover o produto anterior', 'Visual marcante', 'Até 60 minutos']);
    await noHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Ver relatório de demonstração' }).click();
    await noHorizontalOverflow(page);
  });

  test('segundo quiz sem rolagem horizontal', async ({ page }) => {
    await page.goto(SECOND);
    await identify(page, 'Pessoa Teste', null);
    await noHorizontalOverflow(page);
  });
});

test('perfil tem texto equivalente e não depende só de cor', async ({ page }) => {
  await completePilot(page);
  await expect(page.locator('.profile')).toContainText('Perfil de estilo');
  await expect(page.locator('.profile-label')).toHaveText('Minimalista Elegante');
});

test('nenhum armazenamento, identificação fora da URL e nenhum recurso externo', async ({ page, baseURL }) => {
  const requests: { url: string; body: string | null }[] = [];
  page.on('request', r => requests.push({ url: r.url(), body: r.postData() }));
  await completePilot(page);
  await page.getByRole('button', { name: 'Ver relatório de demonstração' }).click();
  await expect(page.getByTestId('custo')).toBeVisible();

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
