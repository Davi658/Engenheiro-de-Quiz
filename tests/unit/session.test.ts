import { it, expect } from 'vitest';
import { fixture } from '../fixtures/invalid-quizzes';
import { validateQuiz } from '../../Engine/core/validate';
import { createSession, setAnswer, finish, pageErrors, identificationErrors } from '../../Engine/core/session';
it('snapshot e resultados isolados, invalida ao editar', () => {
 const q = validateQuiz(fixture()); if(!q.success) throw Error();
 const s = createSession(q.data); q.data.title = 'Alterado'; expect(s.snapshot.title).toBe('Teste'); expect(Object.isFrozen(s.snapshot)).toBe(true);
 setAnswer(s,'estilo','a'); finish(s); expect(s.result?.profile.label).toBe('A'); expect(s.result?.version).toBe('1.0.0');
 setAnswer(s,'estilo','b'); expect(s.result).toBeUndefined(); finish(s); expect(s.result?.profile.label).toBe('B');
 expect(createSession(q.data).answers).toEqual({});
});
it('página exige resposta obrigatória e rejeita alternativa manipulada', () => {
 const q = validateQuiz(fixture()); if(!q.success) throw Error();
 expect(pageErrors(q.data, 0, {})).toEqual({ estilo: 'Escolha uma alternativa.' });
 expect(pageErrors(q.data, 0, { estilo: 'x' })).toEqual({ estilo: 'Escolha uma alternativa válida.' });
 expect(pageErrors(q.data, 0, { estilo: 'a' })).toEqual({});
});
it('identificação aplica trim e formato de email, sem exigir sobrenome', () => {
 const raw = fixture() as any; raw.identification = [{ id: 'nome', type: 'text', label: 'Nome', required: true }, { id: 'email', type: 'email', label: 'Email', required: true }];
 const q = validateQuiz(raw); if(!q.success) throw Error();
 expect(Object.keys(identificationErrors(q.data, { nome: '   ', email: 'x' }))).toEqual(['nome', 'email']);
 expect(identificationErrors(q.data, { nome: 'Ana', email: 'teste@example.com' })).toEqual({});
 const s = createSession(q.data); setAnswer(s, 'estilo', 'a'); expect(() => finish(s)).toThrow('Identificação incompleta.');
});
it('participação vive só em memória e não toca armazenamento', () => {
 expect(typeof (globalThis as any).localStorage).toBe('undefined');
 const q = validateQuiz(fixture()); if(!q.success) throw Error();
 expect(Object.keys(createSession(q.data)).sort()).toEqual(['answers','identification','pageIndex','quizId','snapshot','status','version']);
});
