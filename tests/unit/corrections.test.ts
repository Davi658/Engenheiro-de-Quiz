import { it, expect } from 'vitest';
import raw from '../fixtures/pricing-v1-beleza.json';
import { validateQuiz } from '../../Engine/core/validate';
import { evaluateQuiz } from '../../Engine/core/evaluate';
import { evaluateActualPrice } from '../../Engine/core/pricing';
import { pageErrors } from '../../Engine/core/session';
const answers = {servico:'tradicional',acabamento:'discreto',remocao:'nao',prioridade:'praticidade',disponibilidade:'60','preco-praticado':'20,00'};
it('não substitui preço exato pelo limite de faixa', () => {
 const q=validateQuiz(raw); if(!q.success) throw Error();
 const r=evaluateQuiz(q.data,answers); if(r.kind!=='pricing-v1')throw Error();
 expect(r.actualPriceDiagnosis?.actualPrice).toBe('20');expect(r.actualPriceDiagnosis?.status).toBe('sub_target');expect(r.demo).toBe(true);
});
it('equilíbrio não é lucro positivo',()=>{const d=evaluateActualPrice('100','95','0.05','50');expect(d.status).toBe('break_even');expect(d.profit).toBe('0');expect(d.message).not.toContain('gera margem de lucro');});
it.each(['','-1','1e3','1.234,56','NaN','Infinity','20,999','1000000000'])('rejeita preço inválido %s na página e no cálculo',value=>{
 const q=validateQuiz(raw);if(!q.success)throw Error();const a={...answers,'preco-praticado':value};
 expect(pageErrors(q.data,5,a)).toHaveProperty('preco-praticado');
 expect(()=>evaluateQuiz(q.data,a)).toThrow();
});
it.each(['0','20,00','20.00','40','1000,00'])('aceita preço exato %s',value=>{
 const q=validateQuiz(raw);if(!q.success)throw Error();const a={...answers,'preco-praticado':value};
 expect(pageErrors(q.data,5,a)).not.toHaveProperty('preco-praticado');
 expect(()=>evaluateQuiz(q.data,a)).not.toThrow();
});
it('resultado por hora é excedente após remuneração',()=>{const d=evaluateActualPrice('100','95','0.05','50',60);expect(d.profit).toBe('0');expect(d.profitPerHour).toBe('0');});
it('duração zero não divide por zero',()=>{expect(evaluateActualPrice('50','32.50','0.05','16.50',0).profitPerHour).toBeNull();});
it.each([['99.99','sub_target'],['100','break_even'],['100.01','healthy']])('classifica a fronteira %s como %s',(price,status)=>expect(evaluateActualPrice(price,'95','0.05','50',60).status).toBe(status));
it.each([
 ['alternativas em preço livre',(q:any)=>{q.pages[5].blocks[1].options=[{id:'a',label:'A'},{id:'b',label:'B'}];}],
 ['métrica em preço livre',(q:any)=>q.result.actualPriceKey='price'],
 ['preço livre como contribuição',(q:any)=>q.result.contributionQuestions.push('preco-praticado')],
 ['preço livre opcional',(q:any)=>q.pages[5].blocks[1].required=false],
 ['chave sem pergunta',(q:any)=>{delete q.result.actualPriceQuestion;q.result.actualPriceKey='price';}],
])('rejeita configuração %s',(_,mutate)=>{const q=structuredClone(raw);mutate(q);expect(validateQuiz(q).success).toBe(false);});
it('preserva compatibilidade de preço por alternativas em outros quizzes',()=>{
 const q:any=structuredClone(raw);q.pages[5].blocks[1]={type:'question',id:'preco-praticado',label:'Preço de referência',required:true,options:[{id:'a',label:'20 reais',values:{price:'20.00'}},{id:'b',label:'50 reais',values:{price:'50.00'}}]};q.result.actualPriceKey='price';
 const validated=validateQuiz(q);expect(validated.success).toBe(true);if(!validated.success)throw Error();const r=evaluateQuiz(validated.data,{...answers,'preco-praticado':'a'});if(r.kind!=='pricing-v1')throw Error();expect(r.actualPriceDiagnosis?.actualPrice).toBe('20');
});
