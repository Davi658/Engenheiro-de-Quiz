import { test, expect } from '@playwright/test';
import { PILOT, answerAll, completePilot, goBackTo, identify, reference } from './helpers';

test.describe('US1 — responder o quiz piloto', () => {
  test('identificação valida campos obrigatórios e formato de email', async ({ page }) => {
    await page.goto(PILOT);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seu talento merece um preço à altura.');
    await expect(page.getByText('Use apenas dados de teste')).toBeVisible();

    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByText('Preencha este campo.')).toHaveCount(2);
    await expect(page.getByLabel('Seu nome')).toBeFocused();
    await expect(page.getByLabel('Seu nome')).toHaveAttribute('aria-describedby', 'erro-nome');

    await page.getByLabel('Seu nome').fill('   ');
    await page.getByLabel('Seu email').fill('invalido');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByLabel('Seu nome')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Informe um email válido')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Antes de começar' })).toBeVisible();

    await identify(page);
    await expect(page.getByText('Página 1 de 5')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'O atendimento' })).toBeFocused();
  });

  test('bloqueia avanço sem resposta, preserva escolhas ao voltar e mostra a prévia', async ({ page }) => {
    await page.goto(PILOT);
    await identify(page);
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByText('Escolha uma alternativa.')).toBeVisible();
    await expect(page.getByText('Página 1 de 5')).toBeVisible();

    await page.getByLabel('Manicure tradicional').check();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Anterior' }).click();
    await expect(page.getByLabel('Manicure tradicional')).toBeChecked();

    // Back to identification keeps the typed values.
    await page.getByRole('button', { name: 'Anterior' }).click();
    await expect(page.getByLabel('Seu email')).toHaveValue('teste@example.com');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await answerAll(page, reference);
    await expect(page.getByText('Simulação com valores fictícios')).toBeVisible();
    await expect(page.getByText('Minimalista Elegante')).toBeVisible();
    await expect(page.getByTestId('duracao')).toHaveText('40 minutos');
    await expect(page.getByTestId('minimo')).toHaveText('R$ 33,69');
    await expect(page.getByText('Compatível')).toBeVisible();
    await expect(page.getByText('Premissas fictícias')).toBeVisible();
    await expect(page.getByText('não cobre os custos e a remuneração considerados')).toBeVisible();
  });

  test('reiniciar limpa identificação e respostas', async ({ page }) => {
    await completePilot(page);
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await expect(page.getByLabel('Seu nome')).toHaveValue('');
    await identify(page);
    await expect(page.getByLabel('Manicure tradicional')).not.toBeChecked();
  });

  test('quiz inexistente mostra mensagem amigável com link para a seleção', async ({ page }) => {
    await page.goto('/?quiz=inexistente');
    await expect(page.getByRole('heading', { name: 'Quiz não encontrado' })).toBeVisible();
    await page.getByRole('link', { name: 'Ver quizzes disponíveis' }).click();
    await expect(page.getByRole('heading', { name: 'Escolha um quiz' })).toBeVisible();
  });
});

test.describe('US2 — resultados coerentes após alterações', () => {
  test('alongamento + nail art + remoção em 60 min: 160 minutos e aviso, sem valores antigos', async ({ page }) => {
    await completePilot(page);
    await page.getByRole('button', { name: 'Editar respostas' }).click();
    await goBackTo(page, 1);
    await page.getByLabel('Alongamento').check();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByLabel('Nail art elaborada').check();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByLabel('Precisa remover o produto anterior').check();
    for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Ver prévia' }).click();

    await expect(page.getByTestId('duracao')).toHaveText('160 minutos (2 h 40 min)');
    await expect(page.getByText('supera o tempo disponível (60 minutos)')).toBeVisible();
    await expect(page.getByText('Arte em Destaque')).toBeVisible();
    await expect(page.getByText('R$ 33,69')).toHaveCount(0);
    await expect(page.getByText('Minimalista Elegante')).toHaveCount(0);
    await expect(page.getByText('versão 1.0.0')).toBeVisible();
  });

  test('prioridade altera somente o texto explicativo', async ({ page }) => {
    await completePilot(page);
    const minimum = await page.getByTestId('minimo').textContent();
    await expect(page.getByText('A praticidade é a prioridade.')).toBeVisible();
    await page.getByRole('button', { name: 'Editar respostas' }).click();
    await goBackTo(page, 4);
    await page.getByLabel('Visual marcante').check();
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.getByRole('button', { name: 'Ver prévia' }).click();
    await expect(page.getByText('Um visual marcante pede atenção')).toBeVisible();
    await expect(page.getByText('A praticidade é a prioridade.')).toHaveCount(0);
    await expect(page.getByTestId('minimo')).toHaveText(minimum!);
  });
});

