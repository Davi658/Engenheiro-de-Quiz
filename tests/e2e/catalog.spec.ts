import { test, expect } from '@playwright/test';
import { SECOND, identify } from './helpers';

test('catálogo descobre os dois quizzes automaticamente', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Escolha um quiz' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Diagnóstico de Precificação/i })).toHaveAttribute('href', '?quiz=beleza-unhas');
  await page.getByRole('link', { name: 'Qual atendimento combina com você?' }).click();
  await expect(page).toHaveURL(/\?quiz=preferencia-atendimento$/);
});

test('segundo quiz: identificação só por nome e duas perguntas na mesma página', async ({ page }) => {
  await page.goto(SECOND);
  await expect(page.getByText('Página 1 de 1')).toBeVisible();
  await expect(page.getByText('Pequenas escolhas revelam o ritmo')).toBeVisible();
  await expect(page.getByRole('group')).toHaveCount(2);
  await page.getByLabel('Rápido e objetivo').check();
  await page.getByRole('button', { name: 'Ver prévia' }).click();
  await expect(page.getByText('Escolha uma alternativa.')).toHaveCount(1);
});

const combos = [
  ['rapido', 'discreto', 'Essencial Prático'],
  ['rapido', 'elaborado', 'Expressivo Prático'],
  ['detalhado', 'discreto', 'Cuidado Discreto'],
  ['detalhado', 'elaborado', 'Cuidado Elaborado'],
] as const;

for (const [ritmo, acabamento, label] of combos) {
  test(`segundo quiz: ${ritmo} + ${acabamento} = ${label}, sem interface financeira`, async ({ page }) => {
    await page.goto(SECOND);
    await page.locator(`#opcao-ritmo-${ritmo}`).check();
    await page.locator(`#opcao-acabamento-${acabamento}`).check();
    await page.getByRole('button', { name: 'Ver prévia' }).click();
    await expect(page.getByLabel('Seu nome')).toBeVisible();
    await expect(page.getByLabel('Seu email')).toHaveCount(0);
    await identify(page, 'Pessoa Teste', null);
    await expect(page.getByRole('heading', { name: 'Sua prévia' })).toBeVisible();
    await expect(page.locator('.profile-label')).toHaveText(label);
    await expect(page.getByText('Simulação com valores fictícios')).toBeVisible();
    await expect(page.getByText('versão 1.0.0')).toBeVisible();
    await expect(page.locator('main')).not.toContainText('R$');
    await expect(page.locator('main')).not.toContainText('minutos');
    await expect(page.getByRole('button', { name: 'Ver relatório de demonstração' })).toHaveCount(0);
  });
}
