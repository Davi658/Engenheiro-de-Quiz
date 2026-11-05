import { it, expect } from 'vitest';
import Decimal from 'decimal.js';
import raw from '../fixtures/pricing-v1-beleza.json';
import second from '../../data/preferencia-atendimento/quiz.json';
import { validateQuiz, questions } from '../../Engine/core/validate';
import { evaluateQuiz } from '../../Engine/core/evaluate';
import { priceScenario } from '../../Engine/core/pricing';
const checked = validateQuiz(raw);
if (!checked.success) throw Error('Fixture inválida');
const quiz = checked.data;
export const base = {
  servico: 'tradicional',
  acabamento: 'discreto',
  remocao: 'nao',
  prioridade: 'praticidade',
  disponibilidade: '60',
  'preco-praticado': '50'
};
it('calcula caso de referência', () => {
 const r = evaluateQuiz(quiz, base); expect(r.kind).toBe('pricing-v1');
 if (r.kind !== 'pricing-v1') throw Error();
 expect(r.minutes).toBe(40); expect(r.cost).toBe('32.5'); expect(r.profile.label).toBe('Minimalista Elegante');
 expect(r.scenarios.map(s => s.price)).toEqual(['34.22','40.63','46.43']);
 expect(r.actualPriceDiagnosis?.actualPrice).toBe('50');
 expect(r.actualPriceDiagnosis?.status).toBe('healthy');
});
it('rejeita respostas ausentes e manipuladas', () => { expect(() => evaluateQuiz(quiz, {})).toThrow(); expect(() => evaluateQuiz(quiz, {...base, servico:'invalido'})).toThrow(); expect(() => evaluateQuiz(quiz, {...base, extra:'x'})).toThrow(); });
it('valida todas as combinações (3x3x2x3x3x5 = 810) e a margem efetiva', () => {
 let cases: Record<string,string>[] = [{}];
 for(const q of questions(quiz)) cases = cases.flatMap(a => (q.input === 'money' ? ['0','20','35','50','1000'].map(value => ({...a,[q.id]:value})) : q.options.map(o => ({...a,[q.id]:o.id}))));
 expect(cases).toHaveLength(810);
 for(const a of cases) { const r = evaluateQuiz(quiz,a); expect(r).toEqual(evaluateQuiz(quiz,a)); if(r.kind !== 'pricing-v1') throw Error(); expect(new Decimal(r.cost).gte(0)).toBe(true); for(const s of r.scenarios) expect(new Decimal(s.effectiveMargin).gte(s.margin)).toBe(true); }
});
it('160 minutos gera incompatibilidade, prioridade não muda valores', () => {
 const a = evaluateQuiz(quiz,{...base,servico:'alongamento',acabamento:'elaborado',remocao:'sim'});
 const b = evaluateQuiz(quiz,{...base,servico:'alongamento',acabamento:'elaborado',remocao:'sim',prioridade:'marcante'});
 if(a.kind !== 'pricing-v1' || b.kind !== 'pricing-v1') throw Error();
 expect(a.minutes).toBe(160); expect(a.compatible).toBe(false); expect(a.cost).toBe(b.cost); expect(a.explanation).not.toBe(b.explanation);
});
it('identificação não participa do cálculo e moeda vem do cenário', () => {
 const r = evaluateQuiz(quiz, base); if (r.kind !== 'pricing-v1') throw Error();
 expect(r.feeRate).toBe('0.05'); expect(r.minimum).toBe('34.22'); expect(r.demo).toBe(true); expect(r.version).toBe('4.0.0');
});
it('arredonda preços para cima ao centavo e rejeita taxa + margem >= 1', () => {
 expect(priceScenario('10', '0', '0.7').price).toBe('33.34');
 expect(priceScenario('0', '0.05', '0').price).toBe('0.00');
 expect(() => priceScenario('10', '0.5', '0.5')).toThrow();
 expect(() => priceScenario('10', '0.9', '0.2')).toThrow();
});
it.each([
 ['rapido', 'discreto', 'Essencial Prático'],
 ['rapido', 'elaborado', 'Expressivo Prático'],
 ['detalhado', 'discreto', 'Cuidado Discreto'],
 ['detalhado', 'elaborado', 'Cuidado Elaborado']
])('segundo quiz: %s + %s = %s', (ritmo, acabamento, label) => {
 const checkedSecond = validateQuiz(second); if (!checkedSecond.success) throw Error();
 const r = evaluateQuiz(checkedSecond.data, { ritmo, acabamento });
 expect(r.kind).toBe('category-table-v1');
 expect(r.profile.label).toBe(label);
 expect(r).not.toHaveProperty('minutes'); expect(r).not.toHaveProperty('scenarios');
});
it('avalia o preço praticado informando os 3 status de diagnóstico', () => {
 const rHealthy = evaluateQuiz(quiz, { ...base, 'preco-praticado': '50' });
 if (rHealthy.kind !== 'pricing-v1') throw Error();
 expect(rHealthy.actualPriceDiagnosis?.status).toBe('healthy');
 expect(rHealthy.actualPriceDiagnosis?.actualPrice).toBe('50');

 const rLoss = evaluateQuiz(quiz, {
   ...base,
   servico: 'alongamento',
   acabamento: 'elaborado',
   remocao: 'sim',
   'preco-praticado': '35'
 });
 if (rLoss.kind !== 'pricing-v1') throw Error();
 expect(rLoss.actualPriceDiagnosis?.status).toBe('loss');

 const rSub = evaluateQuiz(quiz, {
   ...base,
   servico: 'alongamento',
   acabamento: 'elaborado',
   remocao: 'sim',
   'preco-praticado': '110'
 });
 if (rSub.kind !== 'pricing-v1') throw Error();
 expect(rSub.actualPriceDiagnosis?.status).toBe('sub_target');
});
