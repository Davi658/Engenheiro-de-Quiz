import { test, expect } from '@playwright/test';
import { completePilot, goBackTo } from './helpers';

test('relatório de demonstração: custos, três cenários, dois pacotes e nenhuma cobrança', async ({ page }) => {
  await completePilot(page);
  await page.getByRole('button', { name: 'Ver relatório de demonstração' }).click();
  await expect(page.getByRole('heading', { name: 'Relatório de demonstração' })).toBeFocused();
  await expect(page.getByText('Simulação com valores fictícios')).toBeVisible();
  await expect(page.getByText('não é uma compra, não solicita pagamento')).toBeVisible();

  const costs = page.locator('table.costs');
  await expect(costs.getByRole('row', { name: /Materiais/ })).toContainText('R$ 8,00');
  await expect(costs.getByRole('row', { name: /Despesas operacionais/ })).toContainText('R$ 8,00');
  await expect(costs.getByRole('row', { name: /Remuneração/ })).toContainText('R$ 16,00');
  await expect(page.getByTestId('custo')).toHaveText('R$ 32,00');

  const scenarios = page.getByTestId('cenario');
  await expect(scenarios).toHaveCount(3);
  await expect(scenarios.locator('.price')).toHaveText(['R$ 33,69', 'R$ 40,00', 'R$ 45,72']);
  await expect(scenarios.first()).toContainText('Taxa (5%)');
  await expect(scenarios.first()).toContainText('R$ 1,68');

  const packages = page.getByTestId('pacote');
  await expect(packages).toHaveCount(2);
  await expect(packages.first()).toContainText('Essencial · acabamento discreto (igual à sua escolha)');
  await expect(packages.nth(1)).toContainText('80 minutos');
  await expect(packages.nth(1)).toContainText('Supera o tempo disponível');

  await expect(page.getByRole('button', { name: /comprar|pagar|enviar/i })).toHaveCount(0);
  await expect(page.locator('input')).toHaveCount(0);
});

test('editar respostas invalida o relatório e recalcula sem valores antigos', async ({ page }) => {
  await completePilot(page);
  await page.getByRole('button', { name: 'Ver relatório de demonstração' }).click();
  await page.getByRole('button', { name: 'Editar respostas' }).click();
  await goBackTo(page, 2);
  await page.getByLabel('Decoração simples').check();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Ver prévia' }).click();
  await expect(page.locator('.profile-label')).toHaveText('Criativa Versátil');
  await page.getByRole('button', { name: 'Ver relatório de demonstração' }).click();
  await expect(page.getByTestId('custo')).toHaveText('R$ 49,00');
  await expect(page.getByTestId('cenario').locator('.price')).not.toContainText(['R$ 33,69']);
  await expect(page.getByTestId('pacote').first()).not.toContainText('igual à sua escolha');
});

