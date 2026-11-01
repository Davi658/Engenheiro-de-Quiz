import { describe, it, expect } from 'vitest';
import { validateQuiz } from '../../Engine/core/validate';
import { fixture } from '../fixtures/invalid-quizzes';
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
