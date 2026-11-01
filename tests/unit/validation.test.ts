import { describe, it, expect } from 'vitest';
import { validateQuiz } from '../../Engine/core/validate';
import { fixture } from '../fixtures/invalid-quizzes';
import raw from '../../data/beleza-unhas/quiz.json';
import { buildCatalog, catalog } from '../../Engine/content/catalog';
describe('contrato de autoria', () => {
 it('aceita quiz categórico completo', () => expect(validateQuiz(fixture()).success).toBe(true));
 it.each([
  ['chave desconhecida', (q: any) => q.execute = 'alert(1)'],
  ['opções insuficientes', (q: any) => q.pages[0].blocks[0].options.pop()],
  ['id duplicado', (q: any) => q.pages.push(q.pages[0])],
  ['opção duplicada', (q: any) => q.pages[0].blocks[0].options[1].id = 'a'],
  ['referência inválida', (q: any) => q.result.questionIds = ['desconhecida']],
  ['tabela incompleta', (q: any) => q.result.rows.pop()],
  ['linha duplicada', (q: any) => q.result.rows.push(q.result.rows[0])],
  ['regra opcional', (q: any) => q.pages[0].blocks[0].required = false],
  ['negativo', (q: any) => q.pages[0].blocks[0].options[0].values = { cost: '-1' }],
  ['protótipo', (q: any) => q.id = '__proto__'],
 ])('rejeita %s', (_, mutate) => { const q = fixture(); mutate(q); expect(validateQuiz(q).success).toBe(false); });
});
describe('regras numéricas do piloto', () => {
 const pilot = () => structuredClone(raw) as any;
 it('aceita o piloto', () => expect(validateQuiz(pilot()).success).toBe(true));
 it.each([
  ['taxa + margem >= 1', (q: any) => q.result.scenario.targetMargins[2] = '0.95'],
  ['taxa >= 1', (q: any) => q.result.scenario.feeRate = '1'],
  ['custo/hora negativo', (q: any) => q.result.scenario.operatingHourly = '-1.00'],
  ['minutos fracionários', (q: any) => q.pages[0].blocks[1].options[0].values.minutes = '40.5'],
  ['métrica ausente', (q: any) => delete q.pages[0].blocks[1].options[0].values.materials],
  ['dinheiro com três casas', (q: any) => q.pages[0].blocks[1].options[0].values.materials = '8.001'],
  ['perfil sem cobertura', (q: any) => delete q.result.profiles.simples],
  ['pacote com alternativa inexistente', (q: any) => q.result.packages[0].overrides.acabamento = 'nenhum'],
  ['disponibilidade zero', (q: any) => q.pages[4].blocks[0].options[0].values.minutes = '0'],
  ['actualPriceQuestion sem actualPriceKey', (q: any) => { q.result.actualPriceQuestion = 'servico'; delete q.result.actualPriceKey; }],
  ['actualPriceKey com valor não positivo', (q: any) => {
    q.result.actualPriceQuestion = 'servico';
    q.result.actualPriceKey = 'price';
    q.pages[0].blocks[1].options[0].values = { minutes: '40', materials: '8', price: '-10' };
  }],
 ])('rejeita %s com caminho útil', (_, mutate) => {
  const q = pilot(); mutate(q); const r = validateQuiz(q);
  expect(r.success).toBe(false); if (!r.success) expect(r.errors[0].path).not.toBe('');
 });
});
describe('catálogo', () => {
 it('indisponibiliza arquivos inválidos, slug divergente e colisões', () => {
  const broken = fixture() as any; broken.result.rows.pop();
  const c = buildCatalog({ '/data/teste/quiz.json': fixture(), '/data/quebrado/quiz.json': { ...broken, id: 'quebrado' }, '/data/outro/quiz.json': fixture() });
  expect([...c.quizzes.keys()]).toEqual(['teste']);
  expect([...c.invalid].sort()).toEqual(['outro', 'quebrado']);
 });
 it('descobre automaticamente os quizzes em data/', () => {
  expect([...catalog.quizzes.keys()].sort()).toEqual(['beleza-unhas', 'preferencia-atendimento']);
  expect(catalog.invalid.size).toBe(0);
 });
});
