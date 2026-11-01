import { readdir,readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateQuiz } from '../Engine/core/validate';
const root=resolve(process.argv[2]??'data');let failed=false,count=0;const ids=new Set<string>();
for(const entry of await readdir(root,{withFileTypes:true}))if(entry.isDirectory()){
 const path=resolve(root,entry.name,'quiz.json');
 try{const value=JSON.parse(await readFile(path,'utf8'));const result=validateQuiz(value);if(!result.success){for(const e of result.errors)console.error(`${path}: ${e.path}: ${e.message}`);failed=true;}else if(result.data.id!==entry.name||ids.has(result.data.id)){console.error(`${path}: id: slug divergente ou duplicado.`);failed=true;}else{ids.add(result.data.id);count++;}}
 catch{console.error(`${path}: arquivo ausente ou JSON inválido.`);failed=true;}
}
if(count===0){console.error('Nenhum quiz válido encontrado.');failed=true;}
if(failed)process.exitCode=1;else console.log(`${count} quizzes válidos.`);
