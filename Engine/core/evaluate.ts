import type { Answers, Quiz } from './schema';
import { questions } from './validate';
import { D, priceScenario, evaluateActualPrice, type ActualPriceDiagnosis } from './pricing';
type Common = {quizId:string;version:string;demo:boolean;profile:{label:string;description:string};explanation:string};
export type PricingResult = Common & {
  kind:'pricing-v1';
  minutes:number;
  available:number;
  compatible:boolean;
  materials:string;
  operating:string;
  compensation:string;
  cost:string;
  feeRate:string;
  minimum:string;
  scenarios:ReturnType<typeof priceScenario>[];
  actualPriceDiagnosis?: ActualPriceDiagnosis;
};
export type Result = PricingResult | (Common & {kind:'category-table-v1'});
export function evaluateQuiz(q:Quiz,answers:Answers):Result {
 const qs=questions(q), selected=new Map<string,typeof qs[number]['options'][number]>();
 if(Object.keys(answers).some(k=>!qs.some(x=>x.id===k)))throw Error('Pergunta desconhecida.');
 for(const x of qs){const value=answers[x.id];const option=x.options.find(o=>o.id===value);if((x.required||value!==undefined)&&!option)throw Error('Preencha as respostas válidas.');if(option)selected.set(x.id,option);}
 const r=q.result, common={quizId:q.id,version:q.version,demo:q.demo};
 if(r.kind==='category-table-v1') {const row=r.rows.find(row=>r.questionIds.every(k=>row.answers[k]===answers[k]));if(!row)throw Error('Resultado indisponível.');return {...common,kind:r.kind,profile:{label:row.label,description:row.description},explanation:row.description};}
 let duration=new D(0), materials=new D(0);
 for(const key of r.contributionQuestions){const values=selected.get(key)!.values!;duration=duration.plus(values[r.durationKey]);materials=materials.plus(values[r.materialsKey]);}
 const operating=duration.times(r.scenario.operatingHourly).div(60), compensation=duration.times(r.scenario.compensationHourly).div(60);
 // Combine the hourly rates before division to avoid accumulating recurring-decimal rounding.
 const cost=materials.plus(duration.times(new D(r.scenario.operatingHourly).plus(r.scenario.compensationHourly)).div(60));
 const available=Number(selected.get(r.availabilityQuestion)!.values![r.availabilityKey]);
 const scenarios=r.scenario.targetMargins.map(m=>priceScenario(cost.toString(),r.scenario.feeRate,m));

 let actualPriceDiagnosis: ActualPriceDiagnosis | undefined;
 if (r.actualPriceQuestion && r.actualPriceKey) {
   const opt = selected.get(r.actualPriceQuestion);
   const val = opt?.values?.[r.actualPriceKey];
   if (val !== undefined) {
     const breakEvenCost = materials.plus(operating);
     actualPriceDiagnosis = evaluateActualPrice(val, cost.toString(), r.scenario.feeRate, breakEvenCost.toString());
   }
 }

 return {...common,kind:r.kind,profile:r.profiles[answers[r.profileQuestion]],explanation:r.priorityTexts[answers[r.priorityQuestion]],minutes:duration.toNumber(),available,compatible:duration.lte(available),materials:materials.toString(),operating:operating.toString(),compensation:compensation.toString(),cost:cost.toString(),feeRate:r.scenario.feeRate,minimum:priceScenario(cost.toString(),r.scenario.feeRate,'0').price,scenarios,actualPriceDiagnosis};
}
export function evaluateReport(q:Quiz,a:Answers){
 const result=evaluateQuiz(q,a);if(q.result.kind!=='pricing-v1'||result.kind!=='pricing-v1')throw Error('Relatório não disponível.');
 return {result,packages:q.result.packages.map(p=>{const derived=evaluateQuiz(q,{...a,...p.overrides});if(derived.kind!=='pricing-v1')throw Error();return {id:p.id,label:p.label,result:derived};})};
}
