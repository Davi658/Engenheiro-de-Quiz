import type { Question } from './schema';
/** No thousands separators or exponents: avoid silently changing a monetary amount. */
export function normalizeMoney(value:string):string|null {
 const trimmed=value.trim();
 if(!/^\d{1,9}([.,]\d{1,2})?$/.test(trimmed))return null;
 return trimmed.replace(',','.');
}
export function answerError(q:Question,value:string|undefined):string|undefined {
 if(value===undefined||value.trim()==='')return q.required?(q.input==='money'?'Informe o preço cobrado em reais.':'Escolha uma alternativa.'):undefined;
 if(q.input==='money')return normalizeMoney(value)===null?'Informe um valor de 0 a 999999999,99, sem separador de milhar e com até duas casas decimais.':undefined;
 return q.options.some(o=>o.id===value)?undefined:'Escolha uma alternativa válida.';
}
