import type { Question, QuestionCondition } from './schema';

/** No thousands separators or exponents: avoid silently changing a monetary amount. */
export function normalizeMoney(value: string | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  if (!/^\d{1,9}([.,]\d{1,2})?$/.test(trimmed)) return null;
  return trimmed.replace(',', '.');
}

export function isUnknownAnswer(value: string | undefined): boolean {
  if (value === undefined || value === null) return false;
  const trimmed = value.trim().toLowerCase();
  return trimmed === 'não sei' || trimmed === 'nao sei' || trimmed === 'nao-sei' || trimmed === 'desconhecido';
}

export type MoneyAnswerState =
  | { kind: 'zero'; value: string }
  | { kind: 'known'; value: string }
  | { kind: 'unknown' }
  | { kind: 'uninformed' };

export function parseMoneyAnswer(value: string | undefined): MoneyAnswerState {
  if (value === undefined || value === null || value.trim() === '') return { kind: 'uninformed' };
  if (isUnknownAnswer(value)) return { kind: 'unknown' };
  const norm = normalizeMoney(value);
  if (norm === null) return { kind: 'uninformed' };
  if (Number(norm) === 0) return { kind: 'zero', value: '0.00' };
  return { kind: 'known', value: norm };
}

export function normalizeNumber(value: string | undefined, min?: number, max?: number): number | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;
  return num;
}

export function parseMultiChoice(value: string | undefined): string[] {
  if (!value || value.trim() === '') return [];
  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // fallback to comma separated
    }
  }
  return trimmed.split(',').map(s => s.trim()).filter(Boolean);
}

export function serializeMultiChoice(ids: string[]): string {
  return JSON.stringify(ids);
}

export function isConditionMet(condition: QuestionCondition | undefined, answers: Record<string, string>): boolean {
  if (!condition) return true;
  const val = answers[condition.questionId];
  if (val === undefined || val === '') return false;

  if (condition.equals !== undefined && val !== condition.equals) return false;
  if (condition.notEquals !== undefined && val === condition.notEquals) return false;

  if (condition.includes !== undefined) {
    const list = parseMultiChoice(val);
    if (!list.includes(condition.includes)) return false;
  }
  if (condition.notIncludes !== undefined) {
    const list = parseMultiChoice(val);
    if (list.includes(condition.notIncludes)) return false;
  }

  return true;
}

export function answerError(q: Question, value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === '') {
    if (!q.required) return undefined;
    switch (q.input) {
      case 'money': return 'Informe o valor em reais.';
      case 'number': return 'Informe o número.';
      case 'multi-choice': return 'Selecione pelo menos uma alternativa.';
      case 'text': return 'Preencha este campo.';
      default: return 'Escolha uma alternativa.';
    }
  }

  if (q.input === 'money') {
    if (q.allowUnknown && isUnknownAnswer(value)) return undefined;
    return normalizeMoney(value) === null
      ? 'Informe um valor de 0 a 999999999,99, sem separador de milhar e com até duas casas decimais.'
      : undefined;
  }

  if (q.input === 'number') {
    const min = q.min;
    return normalizeNumber(value, min, q.max) === null
      ? `Informe um número válido${min !== undefined ? ` (mínimo ${min})` : ''}.`
      : undefined;
  }

  if (q.input === 'multi-choice') {
    const selected = parseMultiChoice(value);
    if (q.required && selected.length === 0) return 'Selecione pelo menos uma alternativa.';
    const valid = new Set(q.options.map(o => o.id));
    if (selected.some(id => !valid.has(id))) return 'Alternativa inválida selecionada.';
    return undefined;
  }

  if (q.input === 'text') {
    return undefined;
  }

  return q.options.some(o => o.id === value) ? undefined : 'Escolha uma alternativa válida.';
}
