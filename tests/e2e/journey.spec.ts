import { test, expect } from '@playwright/test';
import { PILOT, answerAll, completePilot, goBackTo, identify, reference } from './helpers';

test.describe('US1 — responder o quiz piloto', () => {
  test('bloqueia avanço sem resposta, preserva escolhas ao voltar e avança para identificação final', async ({ page }) => {
    await page.goto(PILOT);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Diagnóstico de Precificação e Estilo para Nail Designers');
    await expect(page.getByText('Página 1 de 6')).toBeVisible();

    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByText('Escolha uma alternativa.')).toBeVisible();
    await expect(page.getByText('Página 1 de 6')).toBeVisible();

    await page.getByLabel('Manicure tradicional', { exact: false }).check();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Anterior' }).click();
    await expect(page.getByLabel('Manicure tradicional', { exact: false })).toBeChecked();
  });

  test('identificação ao final valida campos obrigatórios e formato de email antes do resultado', async ({ page }) => {
    await page.goto(PILOT);
    await answerAll(page, reference);
    await expect(page.getByRole('heading', { name: 'Quase lá!' })).toBeVisible();

    await page.getByRole('button', { name: 'Ver diagnóstico completo' }).click();
    await expect(page.getByText('Preencha este campo.')).toHaveCount(2);
    await expect(page.getByLabel('Seu nome ou do seu espaço')).toBeFocused();
    await expect(page.getByLabel('Seu nome ou do seu espaço')).toHaveAttribute('aria-describedby', 'erro-nome');

    await page.getByLabel('Seu nome ou do seu espaço').fill('   ');
    await page.getByLabel('Seu email de contato').fill('invalido');
    await page.getByRole('button', { name: 'Ver diagnóstico completo' }).click();
    await expect(page.getByLabel('Seu nome ou do seu espaço')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Informe um email válido')).toBeVisible();

    await identify(page);
    await expect(page.getByRole('heading', { name: 'Sua prévia de atendimento' })).toBeVisible();
    await expect(page.getByText('Metodologia técnica baseada em custos reais')).toBeVisible();
    await expect(page.getByText('Minimalista Elegante')).toBeVisible();
    await expect(page.getByTestId('duracao')).toHaveText('40 minutos');
    await expect(page.getByTestId('minimo')).toHaveText('R$ 34,22');
    await expect(page.getByTestId('diagnostico-preco')).toContainText('Margem Saudável e Sustentável');
    await expect(page.getByText('Compatível')).toBeVisible();
  });

  test('reiniciar limpa identificação e respostas', async ({ page }) => {
    await completePilot(page);
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(page.getByText('Página 1 de 6')).toBeVisible();
    await expect(page.getByLabel('Manicure tradicional', { exact: false })).not.toBeChecked();
  });

  test('quiz inexistente mostra mensagem amigável com link para a seleção', async ({ page }) => {
    await page.goto('/?quiz=inexistente');
    await expect(page.getByRole('heading', { name: 'Quiz não encontrado' })).toBeVisible();
    await page.getByRole('link', { name: 'Ver quizzes disponíveis' }).click();
    await expect(page.getByRole('heading', { name: 'Escolha um quiz' })).toBeVisible();
  });
});

test.describe('US2 — resultados coerentes após alterações', () => {
  test('alongamento + nail art + remoção com preço baixo: 160 min, aviso e alerta de prejuízo', async ({ page }) => {
    await completePilot(page);
    await page.getByRole('button', { name: 'Editar respostas' }).click();
    await goBackTo(page, 1);
    await page.getByLabel('Alongamento completo', { exact: false }).check();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByLabel('Nail art elaborada', { exact: false }).check();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByLabel('Necessita remoção', { exact: false }).check();
    await page.getByRole('button', { name: 'Continuar' }).click(); // para página 4 (prioridade)
    await page.getByRole('button', { name: 'Continuar' }).click(); // para página 5 (disponibilidade)
    await page.getByRole('button', { name: 'Continuar' }).click(); // para página 6 (preço)
    await page.getByLabel('Até R$ 35,00').check();
    await page.getByRole('button', { name: 'Ver prévia' }).click();

    await expect(page.getByTestId('duracao')).toHaveText('160 minutos (2 h 40 min)');
    await expect(page.getByText('supera o tempo disponível (60 minutos)')).toBeVisible();
    await expect(page.getByText('Nail Artist Exclusiva')).toBeVisible();
    await expect(page.getByTestId('diagnostico-preco')).toContainText('Prejuízo Operacional');
    await expect(page.getByText('versão 2.0.0')).toBeVisible();
  });

  test('prioridade altera somente o texto explicativo', async ({ page }) => {
    await completePilot(page);
    const minimum = await page.getByTestId('minimo').textContent();
    await expect(page.getByText('Sua cliente busca máxima durabilidade')).toBeVisible();
    await page.getByRole('button', { name: 'Editar respostas' }).click();
    await goBackTo(page, 4);
    await page.getByLabel('Exclusividade e impacto', { exact: false }).check();
    for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Ver prévia' }).click();
    await expect(page.getByText('A cliente deseja unhas que chamem atenção')).toBeVisible();
    await expect(page.getByTestId('minimo')).toHaveText(minimum!);
  });
});

