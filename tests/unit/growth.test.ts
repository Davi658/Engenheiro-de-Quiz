import { expect, it } from 'vitest';
import raw from '../../data/beleza-unhas/quiz.json';
import { validateQuiz } from '../../Engine/core/validate';
import { buildGrowthPlan } from '../../Engine/core/growth';
const q = () => { const r = validateQuiz(raw); if (!r.success) throw Error(JSON.stringify(r.errors)); return r.data; };
const context = { currentWithdrawal:'1500', targetWithdrawal:'2500', operatingResult:'1800', weeklyHours:40, occupiedMonthlyHours:100, supportMonthlyHours:20 };
it('não inventa objetivo ou perfil de público quando omitidos', () => {
 expect(buildGrowthPlan(q(), {}, context)).toBeUndefined();
});
it('menos horas gera plano distinto de abrir espaço, mantendo números fora do compartilhamento', () => {
 const less = buildGrowthPlan(q(), {'objetivo-vida':'tempo','horas-desejadas':'20'}, context)!;
 const space = buildGrowthPlan(q(), {'objetivo-vida':'espaco'}, context)!;
 expect(less.action).not.toEqual(space.action);
 expect(less.warnings.join(' ')).toContain('não cabe');
 expect(less.incomeGap).toBe('700.00');
 expect(less.shareText).not.toMatch(/1500|2500|1800|700/);
});
it('público desconhecido gera pesquisa, não suposição de preferência', () => {
 const p = buildGrowthPlan(q(), {'objetivo-vida':'renda','publico-necessidade':'nao-sei'}, context)!;
 expect(p.audienceAction).toContain('Pergunte');
 expect(p.audienceEvidence).toContain('Ainda não sei');
});
it('valida referências e estratégia de objetivo ausente', () => {
 const broken:any = structuredClone(raw); broken.result.growth.goalQuestion='inexistente';
 expect(validateQuiz(broken).success).toBe(false);
 const missing:any = structuredClone(raw); missing.result.growth.strategies.pop();
 expect(validateQuiz(missing).success).toBe(false);
});
it('distância até a renda desejada considera prejuízo operacional atual (resultado negativo)', () => {
 const deficitContext = { currentWithdrawal:'1500', targetWithdrawal:'2500', operatingResult:'-1000', weeklyHours:40, occupiedMonthlyHours:100, supportMonthlyHours:20 };
 const plan = buildGrowthPlan(q(), {'objetivo-vida':'renda'}, deficitContext)!;
 // Com resultado -1000 e meta 2500, a melhoria necessária é 2500 - (-1000) = 3500
 expect(plan.incomeGap).toBe('3500.00');
});
