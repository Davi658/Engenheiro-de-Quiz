import { test, expect } from '@playwright/test';
import { completePilot } from './helpers';

test('relatório executivo demonstrativo: DRE, serviços, capacidade e plano 30/60/90 dias sem cobrança', async ({ page }) => {
  await completePilot(page);
  await page.getByRole('button', { name: 'Ver relatório completo' }).click();
  await expect(page.getByRole('heading', { name: 'Seu Plano de Evolução Profissional e Financeira' })).toBeFocused();
  await expect(page.getByText('Protótipo demonstrativo')).toBeVisible();

  // DRE simples
  const dre = page.locator('table.dre-table');
  await expect(dre).toBeVisible();
  await expect(dre.getByRole('row', { name: /Faturamento Bruto/ })).toContainText('R$ 2.000,00');
  await expect(dre.getByRole('row', { name: /Insumos e Materiais/ })).toContainText('-R$ 340,00');
  await expect(dre.getByRole('row', { name: /Margem de Contribuição Total/ })).toContainText('R$ 1.560,00');

  // Tabela de serviços e preços Sebrae
  const servicesTable = page.locator('table.services-table');
  await expect(servicesTable).toBeVisible();
  await expect(servicesTable.getByRole('row', { name: /Manicure tradicional/ })).toBeVisible();

  // Plano de ação
  const plan = page.locator('.action-plan');
  await expect(plan).toBeVisible();
  await expect(page.locator('.plan-card')).toHaveCount(3);

  // Sem botões de pagamento ou cobrança
  await expect(page.getByRole('button', { name: /comprar|pagar|checkout|pix/i })).toHaveCount(0);
});

test('editar respostas invalida o relatório e recalcula sem dados antigos', async ({ page }) => {
  await completePilot(page);
  await page.getByRole('button', { name: 'Ver relatório completo' }).click();
  await page.getByRole('button', { name: 'Editar respostas' }).click();

  // Volta para página 3 e altera quantidade para 50
  while (!(await page.getByText('Página 3 de 9').isVisible())) {
    await page.getByRole('button', { name: 'Anterior' }).click();
  }
  await page.locator('#campo-qtd-tradicional').fill('50');

  // Avança até o final
  for (let i = 3; i < 9; i++) {
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
  await page.getByRole('button', { name: 'Ver prévia' }).click();

  // Verifica que o faturamento na prévia mudou para 50 x 50 = 2500
  await expect(page.getByTestId('total-atendimentos')).toHaveText('50');
  await expect(page.getByTestId('faturamento-mensal')).toHaveText('R$ 2.500,00');

  // Abre o relatório novamente
  await page.getByRole('button', { name: 'Ver relatório completo' }).click();
  const dre = page.locator('table.dre-table');
  await expect(dre.getByRole('row', { name: /Faturamento Bruto/ })).toContainText('R$ 2.500,00');
});
