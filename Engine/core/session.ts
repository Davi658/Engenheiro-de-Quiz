import { z } from 'zod';
import type { Quiz, Answers } from './schema';
import { evaluateQuiz, type Result } from './evaluate';
function freeze<T>(value:T):T {if(value&&typeof value==='object'){Object.freeze(value);for(const v of Object.values(value))freeze(v);}return value;}
export type Session={quizId:string;version:string;snapshot:Quiz;identification:Answers;answers:Answers;pageIndex:number;status:'identification'|'questions'|'preview'|'report';result?:Result};
export function createSession(q:Quiz):Session{return {quizId:q.id,version:q.version,snapshot:freeze(structuredClone(q)),identification:{},answers:{},pageIndex:0,status:'identification'};}
export function setAnswer(s:Session,id:string,value:string){s.answers[id]=value;s.result=undefined;}
export function identificationErrors(q:Quiz,values:Answers){const errors:Answers={};for(const f of q.identification){const value=(values[f.id]??'').trim();if(f.required&&!value)errors[f.id]='Preencha este campo.';else if(value&&f.type==='email'&&!z.email().safeParse(value).success)errors[f.id]='Informe um email válido, como teste@example.com.';}return errors;}
export function finish(s:Session){if(Object.keys(identificationErrors(s.snapshot,s.identification)).length)throw Error('Identificação incompleta.');s.result=evaluateQuiz(s.snapshot,s.answers);s.status='preview';}
