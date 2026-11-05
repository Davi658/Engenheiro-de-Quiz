import { test, expect } from '@playwright/test';
import { PILOT, completePilot, identify } from './helpers';

test.describe('US1 — responder o quiz piloto de diagnóstico de negócio', () => {
  test('bloqueia avanço sem resposta, preserva escolhas ao voltar e avança para identificação final', async ({ page }) => {
    await page.goto(PILOT);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Diagnóstico de Precificação e Saúde do Negócio para Nail Designers');
    await expect(page.getByText('Página 1 de 9')).toBeVisible();

    // Bloqueia avanço sem selecionar serviço
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByText('Selecione pelo menos uma alternativa.')).toBeVisible();
    await expect(page.getByText('Página 1 de 9')).toBeVisible();

    // Seleciona manicure tradicional e continua
    await page.getByLabel('Manicure tradicional', { exact: false }).check();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Página 2: volta e verifica se opção permaneceu marcada
    await expect(page.getByText('Página 2 de 9')).toBeVisible();
    await page.getByRole('button', { name: 'Anterior' }).click();
    await expect(page.getByLabel('Manicure tradicional', { exact: false })).toBeChecked();
  });

  test('identificação ao final valida campos obrigatórios e formato de email antes do resultado', async ({ page }) => {
    await page.goto(PILOT);

    // Etapa 1
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

    // Etapa 3
    await page.locator('#campo-tempo-tradicional').fill('40');
    await page.locator('#campo-preco-tradicional').fill('50,00');
    await page.locator('#campo-material-tradicional').fill('8,50');
    await page.locator('#campo-qtd-tradicional').fill('40');
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Etapa 4
    await page.locator('#opcao-modalidade-espaco-proprio').check();
    await page.locator('#campo-dias-semana').fill('5');
    await page.locator('#campo-horas-dia').fill('8');
    await page.locator('#campo-horas-apoio').fill('5');
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Etapa 5
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

    // Etapa 6
    await page.locator('#opcao-preencher-pessoal-pular').check();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Etapa 7
    await page.locator('#opcao-canais-mkt-instagram').check();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Etapa 8
    await page.locator('#opcao-preencher-reservas-pular').check();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // Etapa 9
    await page.locator('#opcao-preencher-historico-pular').check();
    await page.getByRole('button', { name: 'Ver prévia' }).click();

    // Tela de identificação
    await expect(page.getByRole('heading', { name: 'Quase lá!' })).toBeVisible();
    await page.getByRole('button', { name: 'Ver diagnóstico completo' }).click();
    await expect(page.getByText('Preencha este campo.')).toHaveCount(2);

    await page.getByLabel('Seu nome ou do seu espaço').fill('   ');
    await page.getByLabel('Seu email de contato').fill('invalido');
    await page.getByRole('button', { name: 'Ver diagnóstico completo' }).click();
    await expect(page.getByLabel('Seu nome ou do seu espaço')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Informe um email válido')).toBeVisible();

    await identify(page);
    await expect(page.getByRole('heading', { name: 'Sua prévia de diagnóstico do negócio' })).toBeVisible();
    await expect(page.getByTestId('total-atendimentos')).toHaveText('40');
    await expect(page.getByTestId('faturamento-mensal')).toHaveText('R$ 2.000,00');
    await expect(page.getByTestId('diagnostico-capacidade')).toBeVisible();
  });

  test('reiniciar limpa identificação e respostas', async ({ page }) => {
    await completePilot(page);
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(page.getByText('Página 1 de 9')).toBeVisible();
    await expect(page.getByLabel('Manicure tradicional', { exact: false })).not.toBeChecked();
  });

  test('quiz inexistente mostra mensagem amigável com link para a seleção', async ({ page }) => {
    await page.goto('/?quiz=inexistente');
    await expect(page.getByRole('heading', { name: 'Quiz não encontrado' })).toBeVisible();
    await page.getByRole('link', { name: 'Ver quizzes disponíveis' }).click();
    await expect(page.getByRole('heading', { name: 'Escolha um quiz' })).toBeVisible();
  });
});
