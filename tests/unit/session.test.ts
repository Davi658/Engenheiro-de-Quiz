import { it, expect } from 'vitest';
import { fixture } from '../fixtures/invalid-quizzes';
import { validateQuiz } from '../../Engine/core/validate';
import { createSession, setAnswer, finish } from '../../Engine/core/session';
it('snapshot e resultados isolados, invalida ao editar', () => {
 const q = validateQuiz(fixture()); if(!q.success) throw Error();
 const s = createSession(q.data); q.data.title = 'Alterado'; expect(s.snapshot.title).toBe('Teste'); expect(Object.isFrozen(s.snapshot)).toBe(true);
 setAnswer(s,'estilo','a'); finish(s); expect(s.result?.profile.label).toBe('A'); expect(s.result?.version).toBe('1.0.0');
 setAnswer(s,'estilo','b'); expect(s.result).toBeUndefined(); finish(s); expect(s.result?.profile.label).toBe('B');
 expect(createSession(q.data).answers).toEqual({});
});
