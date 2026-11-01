import Decimal from 'decimal.js';
import { quizSchema, type Quiz, type Question } from './schema';
export const questions = (q:Quiz):Question[] => q.pages.flatMap(p => p.blocks.filter((b):b is Question => b.type === 'question'));
export type Issue = { path:string; message:string };
export function validateQuiz(input:unknown): {success:true;data:Quiz}|{success:false;errors:Issue[]} {
 const parsed = quizSchema.safeParse(input);
 if(!parsed.success) return {success:false,errors:parsed.error.issues.map(i=>({path:i.path.join('.'),message:i.message}))};
 const q=parsed.data, errors:Issue[]=[];
 const error=(path:string,message:string)=>errors.push({path,message});
 const unique=(ids:string[],path:string)=>{if(new Set(ids).size !== ids.length) error(path,'Identificadores duplicados.');};
 unique(q.identification.map(f=>f.id),'identification'); unique(q.pages.map(p=>p.id),'pages');
 const qs=questions(q); unique(qs.map(x=>x.id),'pages.questions');
 const byId=new Map(qs.map(x=>[x.id,x]));
 qs.forEach(x=>unique(x.options.map(o=>o.id),`questions.${x.id}.options`));
 const ref=(key:string)=>{const v=byId.get(key);if(!v) error(`result.${key}`,'Pergunta inexistente.');else if(!v.required) error(`result.${key}`,'Pergunta usada por regra deve ser obrigatória.');return v;};
 const exact=(keys:string[],expected:string[],path:string)=>{if(keys.length!==expected.length || keys.some(k=>!expected.includes(k)))error(path,'Cobertura de opções inválida.');};
 const r=q.result;
 if(r.kind==='category-table-v1') {
  unique(r.questionIds,'result.questionIds'); const refs=r.questionIds.map(ref);
  const seen=new Set<string>();
  for(const [i,row] of r.rows.entries()) {
   exact(Object.keys(row.answers),r.questionIds,`result.rows.${i}`);
   refs.forEach((v,j)=>{if(v && !v.options.some(o=>o.id===row.answers[r.questionIds[j]]))error(`result.rows.${i}`,'Alternativa inexistente.');});
   const key=JSON.stringify(r.questionIds.map(k=>row.answers[k]));if(seen.has(key))error(`result.rows.${i}`,'Combinação duplicada.');seen.add(key);
  }
  if(refs.every(Boolean) && r.rows.length!==refs.reduce((n,v)=>n*v!.options.length,1))error('result.rows','Tabela incompleta.');
 } else {
  unique(r.contributionQuestions,'result.contributionQuestions'); unique(r.packages.map(p=>p.id),'result.packages');
  for(const key of r.contributionQuestions) for(const o of ref(key)?.options??[]) {
   const values=o.values??{};
   if(!/^\d+$/.test(values[r.durationKey]??'') || !Number.isSafeInteger(Number(values[r.durationKey]))) error(`questions.${key}.${o.id}.${r.durationKey}`,'Minutos inteiros não negativos obrigatórios.');
   if(!/^\d+(\.\d{1,2})?$/.test(values[r.materialsKey]??'')) error(`questions.${key}.${o.id}.${r.materialsKey}`,'Custo não negativo com até duas casas obrigatório.');
  }
  for(const o of ref(r.availabilityQuestion)?.options??[]) if(!/^\d+$/.test(o.values?.[r.availabilityKey]??'') || !Number.isSafeInteger(Number(o.values?.[r.availabilityKey])) || Number(o.values?.[r.availabilityKey])<=0) error('result.availabilityQuestion','Disponibilidade deve ser inteira e positiva.');
  const profile=ref(r.profileQuestion), priority=ref(r.priorityQuestion);
  if(profile) exact(Object.keys(r.profiles),profile.options.map(o=>o.id),'result.profiles');
  if(priority) exact(Object.keys(r.priorityTexts),priority.options.map(o=>o.id),'result.priorityTexts');
  const fee=new Decimal(r.scenario.feeRate);
  if(fee.gte(1))error('result.scenario.feeRate','Taxa deve ser menor que 1.');
  r.scenario.targetMargins.forEach((m,i)=>{if(new Decimal(m).gte(1)||fee.plus(m).gte(1))error(`result.scenario.targetMargins.${i}`,'Taxa + margem deve ser menor que 1.');});
  if(!r.scenario.targetMargins.some(m=>new Decimal(m).isZero()))error('result.scenario.targetMargins','Incluir margem zero para preço mínimo.');
  unique(r.scenario.targetMargins.map(m=>new Decimal(m).toString()),'result.scenario.targetMargins');
  if(r.actualPriceQuestion) {
   if(!r.actualPriceKey) error('result.actualPriceKey','Chave da métrica de preço praticado obrigatória.');
   else {
    const apRef = ref(r.actualPriceQuestion);
    for(const o of apRef?.options??[]) {
     const v = o.values?.[r.actualPriceKey];
     if(!v || !/^\d+(\.\d{1,2})?$/.test(v) || new Decimal(v).lte(0)) error(`questions.${r.actualPriceQuestion}.${o.id}.${r.actualPriceKey}`,'Preço praticado deve ser valor decimal positivo.');
    }
   }
  }
  r.packages.forEach((p,i)=>{if(!Object.keys(p.overrides).length)error(`result.packages.${i}`,'Substituição obrigatória.');for(const [k,v] of Object.entries(p.overrides)){const x=ref(k);if(x&&!x.options.some(o=>o.id===v))error(`result.packages.${i}.${k}`,'Alternativa inexistente.');}});
 }
 return errors.length?{success:false,errors}:{success:true,data:q};
}
