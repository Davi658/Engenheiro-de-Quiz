import { it, expect } from 'vitest';
import raw from '../../data/beleza-unhas/quiz.json';
import { validateQuiz } from '../../Engine/core/validate';
import { evaluateReport } from '../../Engine/core/evaluate';
it('relatório discrimina custos e recalcula dois pacotes sem alterar respostas', () => {
 const q = validateQuiz(raw); if(!q.success) throw Error();
 const a = {servico:'tradicional',acabamento:'discreto',remocao:'nao',prioridade:'praticidade',disponibilidade:'60'};
 const r = evaluateReport(q.data,a); expect(r.result.cost).toBe('32'); expect(r.result.operating).toBe('8'); expect(r.result.compensation).toBe('16'); expect(r.result.materials).toBe('8');
 expect(r.packages).toHaveLength(2); expect(r.packages[0].result.minutes).toBe(40); expect(r.packages[1].result.minutes).toBe(80); expect(a.acabamento).toBe('discreto'); expect(r.result.scenarios[0].fee).toBe('1.6845');
});
