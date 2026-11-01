import { it, expect } from 'vitest';
import { D as Decimal } from '../../Engine/core/pricing';
import raw from '../../data/beleza-unhas/quiz.json';
import { validateQuiz } from '../../Engine/core/validate';
import { evaluateReport } from '../../Engine/core/evaluate';
const q = validateQuiz(raw); if(!q.success) throw Error();
const a = {
  servico: 'tradicional',
  acabamento: 'discreto',
  remocao: 'nao',
  prioridade: 'praticidade',
  disponibilidade: '60',
  'preco-praticado': 'faixa-50'
};
it('relatório discrimina custos e recalcula dois pacotes sem alterar respostas', () => {
 const r = evaluateReport(q.data,a); expect(r.result.cost).toBe('32.5'); expect(r.result.operating).toBe('8'); expect(r.result.compensation).toBe('16'); expect(r.result.materials).toBe('8.5');
 expect(r.packages).toHaveLength(2); expect(r.packages[0].result.minutes).toBe(40); expect(r.packages[1].result.minutes).toBe(80); expect(a.acabamento).toBe('discreto'); expect(r.result.scenarios[0].fee).toBe('1.711');
});
it('três cenários com taxa em reais e margem efetiva calculada sobre o preço arredondado', () => {
 const { result } = evaluateReport(q.data, a);
 expect(result.scenarios.map(s => s.margin)).toEqual(['0.00','0.15','0.25']);
 for (const s of result.scenarios) {
  const price = new Decimal(s.price);
  expect(new Decimal(s.fee).eq(price.times('0.05'))).toBe(true);
  expect(new Decimal(s.profit).eq(price.minus(s.fee).minus(result.cost))).toBe(true);
  expect(new Decimal(s.effectiveMargin).eq(new Decimal(s.profit).div(price))).toBe(true);
 }
 expect(result.scenarios[1]).toMatchObject({ price: '40.63', fee: '2.0315', profit: '6.0985' });
});
it('pacotes preservam as demais respostas, sem recursão nem desconto inventado', () => {
 const r = evaluateReport(q.data, { ...a, servico: 'gel', remocao: 'sim', disponibilidade: '180' });
 const [essencial, expressivo] = r.packages;
 expect(essencial.result.minutes).toBe(80); expect(expressivo.result.minutes).toBe(120);
 expect(essencial.result.profile.label).toBe('Minimalista Elegante'); expect(expressivo.result.profile.label).toBe('Nail Artist Exclusiva');
 expect(expressivo.result.cost).toBe('106.5');
 expect(expressivo.result.scenarios.map(s => s.price)).toEqual(['112.11','133.13','152.15']);
 expect(r.packages.every(p => !('packages' in p.result))).toBe(true);
});
it('quiz categórico não possui relatório', async () => {
 const second = validateQuiz((await import('../../data/preferencia-atendimento/quiz.json')).default); if (!second.success) throw Error();
 expect(() => evaluateReport(second.data, { ritmo: 'rapido', acabamento: 'discreto' })).toThrow('Relatório não disponível.');
});
