import type { GrowthPlan } from '../core/growth';
import { h } from './dom';
import { money } from './format';

export function renderGrowthPlan(p:GrowthPlan|undefined,full=false) {
 if(!p)return h('section',{class:'card-section'},h('h3',{},'Seu próximo passo'),h('p',{},'Informe seu objetivo na primeira etapa para receber uma direção personalizada. Você também pode usar apenas a análise do negócio.'));
 const sharing=h('textarea',{'aria-label':'Texto para compartilhar',readonly:true,rows:3},p.shareText);
 const status=h('p',{role:'status'});
 const copy=h('button',{type:'button',class:'secondary',onclick:async()=>{
  try{await navigator.clipboard.writeText(p.shareText);status.textContent='Texto copiado. Você decide onde compartilhar.';}
  catch{sharing.focus();sharing.select();status.textContent='Selecione e copie o texto para compartilhar.';}
 }},'Copiar minha direção');
 return h('section',{class:'card-section growth-plan','data-testid':'plano-evolucao'},
  h('h3',{},p.title),
  h('p',{},`Seu objetivo: ${p.goal}. Horizonte desejado: ${p.horizon}.`),
  h('p',{},`Principal obstáculo declarado: ${p.constraint}.`),
  h('p',{},p.action),
  h('p',{class:'detail'},`Acompanhe: ${p.indicator}`),
  h('ul',{class:'limitations'},p.warnings.map(w=>h('li',{},w))),
  full?h('div',{},
   h('h4',{},'Ponto de partida e direção desejada'),
   h('p',{},`Retirada atual: ${money(p.currentWithdrawal)}. Retirada desejada: ${money(p.targetWithdrawal)}.`),
   h('p',{},`Diferença entre a meta e a geração operacional estimada disponível: ${money(p.incomeGap)} por mês. Depende da completude dos custos informados.`),
   h('p',{},`Jornada atual declarada: ${p.currentWeeklyHours} h/semana. Jornada desejada: ${p.desiredHours===null?'não informada':`${p.desiredHours} h/semana`}.`),
   h('h4',{},'O público que você observa'),
   h('p',{},`${p.audienceEvidence}. Objeção: ${p.audienceBarrier}. Retorno: ${p.audienceReturn}.`),
   h('p',{},p.audienceAction)):null,
  h('p',{class:'detail'},'Plano orientativo baseado nas suas respostas. O prazo é uma intenção; a evolução depende das ações, da demanda e de fatores externos.'),
  h('details',{},h('summary',{},'Compartilhar apenas meu objetivo'),h('p',{},'Revise antes de copiar. Este texto não inclui identificação, renda ou dívidas.'),sharing,copy,status));
}
