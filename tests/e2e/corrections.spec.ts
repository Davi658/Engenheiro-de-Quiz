import { test, expect } from '@playwright/test';
import { PILOT } from './helpers';

test('validação de entrada numérica, dinheiro com vírgula e recálculo dinâmico', async ({ page }) => {
  await page.goto(PILOT);

  // Seleciona tradicional
  await page.getByLabel('Manicure tradicional', { exact: false }).check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 2
  await page.locator('#opcao-exp-cuticula-russa-nunca').check();
  await page.locator('#opcao-interesse-cuticula-russa-nao').check();
  await page.locator('#opcao-exp-gel-aprendendo').check();
  await page.locator('#opcao-interesse-gel-sim').check();
  await page.locator('#opcao-exp-alongamento-nunca').check();
  await page.locator('#opcao-interesse-alongamento-nao').check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 3: Testa validação de preço
  const inputPreco = page.locator('#campo-preco-tradicional');
  await inputPreco.fill('invalido');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(inputPreco).toHaveAttribute('aria-invalid', 'true');

  // Preenche preço válido com vírgula
  await inputPreco.fill('65,50');
  await page.locator('#campo-tempo-tradicional').fill('45');
  await page.locator('#campo-material-tradicional').fill('10,00');
  await page.locator('#campo-qtd-tradicional').fill('30');
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 4: Testa validação de horas
  await expect(page.getByText('Página 4 de 9')).toBeVisible();
  const inputDias = page.locator('#campo-dias-semana');
  await inputDias.fill('0'); // min 1
  await page.locator('#opcao-modalidade-espaco-proprio').check();
  await page.locator('#campo-horas-dia').fill('8');
  await page.locator('#campo-horas-apoio').fill('5');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(inputDias).toHaveAttribute('aria-invalid', 'true');
});
