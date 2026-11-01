import { expect, type Page } from '@playwright/test';

export const PILOT = '/?quiz=beleza-unhas';
export const SECOND = '/?quiz=preferencia-atendimento';
export const reference = [
  'Manicure tradicional (cutilagem e esmaltação comum)',
  'Discreto e uniforme (cor única ou francesinha clássica)',
  'Unha limpa, pronta para o procedimento',
  'Agilidade e durabilidade para a rotina',
  'Até 60 minutos (1 hora)',
  'R$ 50,00'
];

export async function identify(page: Page, name = 'Pessoa Teste', email: string | null = 'teste@example.com') {
  await page.getByLabel('Seu nome').fill(name);
  if (email !== null) await page.getByLabel('Seu email').fill(email);
  await page.getByRole('button', { name: 'Continuar' }).click();
}

/** Answers one option per page, in order, finishing on the preview. */
export async function answerAll(page: Page, labels: string[]) {
  for (const [i, label] of labels.entries()) {
    await expect(page.getByText(`Página ${i + 1} de ${labels.length}`)).toBeVisible();
    await page.getByLabel(label, { exact: true }).check();
    await page.getByRole('button', { name: i === labels.length - 1 ? 'Ver prévia' : 'Continuar' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Sua prévia' })).toBeVisible();
}

export async function goBackTo(page: Page, pageNumber: number) {
  while (!(await page.getByText(`Página ${pageNumber} de`).isVisible())) await page.getByRole('button', { name: 'Anterior' }).click();
}

export async function completePilot(page: Page, labels = reference) {
  await page.goto(PILOT);
  await identify(page);
  await answerAll(page, labels);
}

