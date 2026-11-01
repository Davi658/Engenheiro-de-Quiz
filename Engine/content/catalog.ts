import { validateQuiz } from '../core/validate';
import type { Quiz } from '../core/schema';
export function buildCatalog(files:Record<string,unknown>){
 const quizzes=new Map<string,Quiz>(), invalid=new Set<string>();
 for(const [path,raw] of Object.entries(files)){const slug=path.replaceAll('\\','/').split('/').at(-2)!;const v=validateQuiz(raw);if(!v.success||v.data.id!==slug||quizzes.has(slug)||invalid.has(slug)){quizzes.delete(slug);invalid.add(slug);}else quizzes.set(slug,v.data);}
 return {quizzes,invalid};
}
export const catalog=buildCatalog(import.meta.glob('../../data/*/quiz.json',{eager:true,import:'default'}));
