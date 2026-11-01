import type { Result } from '../core/evaluate';
import type { Session } from '../core/session';
import { h, seal } from './dom';
import { duration, money, percent } from './format';

export type PreviewHandlers = { edit: () => void; report?: () => void; restart: () => void };

export const versionNote = (s: Session) => h('p', { class: 'version' }, `Quiz ${s.quizId} · versão ${s.version}`);

export function profileCard(result: Result) {
  return h('div', { class: 'profile' },
    h('p', { class: 'eyebrow' }, 'Perfil de estilo'),
    h('p', { class: 'profile-label' }, result.profile.label),
    h('p', {}, result.profile.description));
}

export function assumptions(s: Session) {
  const r = s.snapshot.result;
  if (r.kind !== 'pricing-v1') return null;
  return h('p', { class: 'assumptions' },
    `Premissas fictícias: despesas operacionais de ${money(r.scenario.operatingHourly)} por hora, remuneração de ${money(r.scenario.compensationHourly)} por hora e taxa de ${percent(r.scenario.feeRate)} sobre o preço. `,
    'Estes valores servem apenas para demonstrar o cálculo e não indicam seu lucro ou prejuízo real.');
}

export function renderPreview(s: Session, result: Result, handlers: PreviewHandlers) {
  const body: (Node | null)[] = [profileCard(result)];
  if (result.kind === 'pricing-v1') {
    body.push(
      h('p', { class: 'explanation' }, result.explanation),
      h('dl', { class: 'facts' },
        h('div', {}, h('dt', {}, 'Duração estimada'), h('dd', { 'data-testid': 'duracao' }, duration(result.minutes))),
        h('div', {}, h('dt', {}, 'Tempo disponível'), h('dd', {}, duration(result.available))),
        h('div', {}, h('dt', {}, 'Preço mínimo do cenário'), h('dd', { 'data-testid': 'minimo' }, money(result.minimum)))),
      result.compatible
        ? h('p', { class: 'ok' }, 'Compatível: a duração estimada cabe no tempo disponível.')
        : h('p', { class: 'warning', role: 'status' }, `Atenção: a duração estimada (${result.minutes} minutos) supera o tempo disponível (${result.available} minutos). O tempo não foi reduzido; considere outro acabamento ou mais tempo.`),
      h('p', { class: 'alert' }, `Neste exemplo fictício, cobrar menos de ${money(result.minimum)} não cobre os custos e a remuneração considerados.`),
      assumptions(s));
  }
  return h('section', { class: 'card' },
    h('h2', { id: 'titulo-etapa', tabindex: -1 }, 'Sua prévia'),
    seal(),
    body,
    versionNote(s),
    h('div', { class: 'actions' },
      handlers.report && h('button', { type: 'button', onclick: handlers.report }, 'Ver relatório de demonstração'),
      h('button', { type: 'button', class: 'secondary', onclick: handlers.edit }, 'Editar respostas'),
      h('button', { type: 'button', class: 'link', onclick: handlers.restart }, 'Reiniciar')));
}

