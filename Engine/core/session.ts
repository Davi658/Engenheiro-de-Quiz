import { z } from 'zod';
import type { Quiz, Answers } from './schema';
import { evaluateQuiz, type Result } from './evaluate';
import { answerError, isConditionMet } from './answers';

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const v of Object.values(value)) freeze(v);
  }
  return value;
}

export type Session = {
  quizId: string;
  version: string;
  snapshot: Quiz;
  identification: Answers;
  answers: Answers;
  pageIndex: number;
  status: 'identification' | 'questions' | 'preview' | 'report';
  result?: Result;
};

export function createSession(q: Quiz): Session {
  return {
    quizId: q.id,
    version: q.version,
    snapshot: freeze(structuredClone(q)),
    identification: {},
    answers: {},
    pageIndex: 0,
    status: 'identification',
  };
}

export function setAnswer(s: Session, id: string, value: string) {
  s.answers[id] = value;
  s.result = undefined;
}

export function identificationErrors(q: Quiz, values: Answers) {
  const errors: Answers = {};
  for (const f of q.identification) {
    const value = (values[f.id] ?? '').trim();
    if (f.required && !value) errors[f.id] = 'Preencha este campo.';
    else if (value && f.type === 'email' && !z.string().email().safeParse(value).success)
      errors[f.id] = 'Informe um email válido, como teste@example.com.';
  }
  return errors;
}

/** Required questions of one page must hold an existing option id; manipulated values are rejected. */
export function pageErrors(q: Quiz, pageIndex: number, answers: Answers) {
  const errors: Answers = {};
  for (const b of q.pages[pageIndex]?.blocks ?? []) {
    if (b.type !== 'question') continue;
    if (!isConditionMet(b.condition, answers)) continue;
    const error = answerError(b, answers[b.id]);
    if (error) errors[b.id] = error;
  }
  return errors;
}

export function finish(s: Session) {
  if (Object.keys(identificationErrors(s.snapshot, s.identification)).length)
    throw Error('Identificação incompleta.');
  s.result = evaluateQuiz(s.snapshot, s.answers);
  s.status = 'preview';
}
