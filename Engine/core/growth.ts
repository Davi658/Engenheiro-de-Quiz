import Decimal from 'decimal.js';
import type { Quiz, Answers } from './schema';
import { normalizeNumber } from './answers';

type Context = { currentWithdrawal:string; targetWithdrawal:string; operatingResult:string; weeklyHours:number; occupiedMonthlyHours:number; supportMonthlyHours:number };
/** Direction is declarative and self-reported. No inferred diagnosis or guaranteed forecast. */
export function buildGrowthPlan(q:Quiz,a:Answers,c:Context) {
 const g=q.result.kind==='business-diagnosis-v1'?q.result.growth:undefined;
 if(!g)return undefined;
 const strategy=g.strategies.find(s=>s.option===a[g.goalQuestion]);
 if(!strategy)return undefined;
 const label=(key:string)=>{
  const field=q.pages.flatMap(p=>p.blocks).find(b=>b.type==='question'&&b.id===key);
  return field?.type==='question'?field.options.find(o=>o.id===a[key])?.label:undefined;
 };
 const desiredHours=normalizeNumber(a[g.desiredHoursQuestion]??'',1,168);
 const warnings:string[]=[];
 if(desiredHours!==null && c.occupiedMonthlyHours+c.supportMonthlyHours>desiredHours*52/12)
  warnings.push('A rotina atual não cabe na jornada desejada. Reorganize serviços e atividades de apoio antes de assumir novos atendimentos.');
 const gap=Decimal.max(0,new Decimal(c.targetWithdrawal).minus(new Decimal(c.operatingResult)));
 if(gap.gt(0))warnings.push('A geração operacional estimada ainda não cobre a retirada desejada. O plano é uma hipótese para testar, não uma promessa de renda.');
 const audience=g.audienceStrategies.find(s=>s.option===a[g.clientNeedQuestion]);
 return {
  title:strategy.title, action:strategy.action, indicator:strategy.indicator,
  goal:label(g.goalQuestion)!, horizon:label(g.horizonQuestion)??'Prazo não informado',
  constraint:label(g.constraintQuestion)??'Obstáculo não informado',
  currentWithdrawal:c.currentWithdrawal, targetWithdrawal:c.targetWithdrawal,
  incomeGap:gap.toFixed(2), desiredHours, currentWeeklyHours:c.weeklyHours,
  audienceEvidence:label(g.clientNeedQuestion)??'Preferência das clientes não informada',
  audienceBarrier:label(g.clientBarrierQuestion)??'Objeção não informada',
  audienceReturn:label(g.clientReturnQuestion)??'Frequência de retorno não informada',
  audienceAction:audience?.action??'Pergunte às suas clientes o que valorizam e registre as respostas antes de mudar sua oferta.',
  warnings,
  shareText:`Meu próximo passo profissional: ${label(g.goalQuestion)}. Estou organizando um plano para chegar lá.`,
 };
}
export type GrowthPlan = NonNullable<ReturnType<typeof buildGrowthPlan>>;
