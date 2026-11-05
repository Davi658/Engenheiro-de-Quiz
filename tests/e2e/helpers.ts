import { expect, type Page } from '@playwright/test';

export const PILOT = '/?quiz=beleza-unhas';
export const SECOND = '/?quiz=preferencia-atendimento';

export async function identify(page: Page, name = 'Pessoa Teste', email: string | null = 'teste@example.com') {
  await page.getByLabel('Seu nome', { exact: false }).fill(name);
  if (email !== null) await page.getByLabel('Seu email', { exact: false }).fill(email);
  await page.getByRole('button', { name: /Ver diagnóstico|Continuar/i }).click();
}

export async function goBackTo(page: Page, pageNumber: number) {
  while (!(await page.getByText(`Página ${pageNumber} de 9`).isVisible())) {
    await page.getByRole('button', { name: 'Anterior' }).click();
  }
}

/** Preenche o piloto completo de 9 etapas do diagnóstico */
export async function completePilot(page: Page) {
  await page.goto(PILOT);

  // Etapa 1: Serviços
  await expect(page.getByText('Página 1 de 9')).toBeVisible();
  await page.getByLabel('Manicure tradicional', { exact: false }).check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 2: Experiência
  await expect(page.getByText('Página 2 de 9')).toBeVisible();
  await page.locator('#opcao-exp-cuticula-russa-nunca').check();
  await page.locator('#opcao-interesse-cuticula-russa-nao').check();
  await page.locator('#opcao-exp-gel-aprendendo').check();
  await page.locator('#opcao-interesse-gel-sim').check();
  await page.locator('#opcao-exp-alongamento-nunca').check();
  await page.locator('#opcao-interesse-alongamento-nao').check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 3: Dados dos serviços
  await expect(page.getByText('Página 3 de 9')).toBeVisible();
  await page.locator('#campo-tempo-tradicional').fill('40');
  await page.locator('#campo-preco-tradicional').fill('50,00');
  await page.locator('#campo-material-tradicional').fill('8,50');
  await page.locator('#campo-qtd-tradicional').fill('40');
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 4: Capacidade
  await expect(page.getByText('Página 4 de 9')).toBeVisible();
  await page.locator('#opcao-modalidade-espaco-proprio').check();
  await page.locator('#campo-dias-semana').fill('5');
  await page.locator('#campo-horas-dia').fill('8');
  await page.locator('#campo-horas-apoio').fill('5');
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 5: Despesas
  await expect(page.getByText('Página 5 de 9')).toBeVisible();
  await page.locator('#campo-despesa-espaco').fill('600,00');
  await page.locator('#campo-despesa-energia-contas').fill('200,00');
  await page.locator('#campo-despesa-descartaveis-limpeza').fill('150,00');
  await page.locator('#campo-despesa-equipamentos').fill('100,00');
  await page.locator('#campo-despesa-transporte').fill('100,00');
  await page.locator('#campo-despesa-sistemas-mei').fill('75,00');
  await page.locator('#campo-taxa-cartao').fill('100,00');
  await page.locator('#campo-retirada-atual').fill('1500,00');
  await page.locator('#campo-retirada-desejada').fill('2000,00');
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 6: Finanças pessoais
  await expect(page.getByText('Página 6 de 9')).toBeVisible();
  await page.locator('#opcao-preencher-pessoal-pular').check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 7: Divulgação
  await expect(page.getByText('Página 7 de 9')).toBeVisible();
  await page.locator('#opcao-canais-mkt-instagram').check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 8: Reservas
  await expect(page.getByText('Página 8 de 9')).toBeVisible();
  await page.locator('#opcao-preencher-reservas-pular').check();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Etapa 9: Histórico
  await expect(page.getByText('Página 9 de 9')).toBeVisible();
  await page.locator('#opcao-preencher-historico-pular').check();
  await page.getByRole('button', { name: 'Ver prévia' }).click();

  // Identificação final
  await identify(page);
  await expect(page.getByRole('heading', { name: 'Sua prévia' })).toBeVisible();
}
