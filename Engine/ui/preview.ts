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
  if (s.snapshot.demo) {
    return h('p', { class: 'assumptions' },
      `Premissas fictícias: despesas operacionais de ${money(r.scenario.operatingHourly)} por hora, remuneração de ${money(r.scenario.compensationHourly)} por hora e taxa de ${percent(r.scenario.feeRate)} sobre o preço. `,
      'Estes valores servem apenas para demonstrar o cálculo e não indicam seu lucro ou prejuízo real.');
  }
  return h('p', { class: 'assumptions' },
    `Metodologia de precificação: despesas operacionais fixadas em ${money(r.scenario.operatingHourly)} por hora de mesa, remuneração profissional pretendida de ${money(r.scenario.compensationHourly)} por hora e reserva de ${percent(r.scenario.feeRate)} para taxas/impostos. `,
    'São referências estimadas, não custos individuais comprovados. Os resultados não indicam seu lucro ou prejuízo real.');
}

export function actualPriceDiagnosisCard(diag: NonNullable<import('../core/pricing').ActualPriceDiagnosis>) {
  const statusClasses: Record<typeof diag.status, string> = {
    loss: 'diagnosis-card loss',
    sub_target: 'diagnosis-card sub-target',
    healthy: 'diagnosis-card healthy',
    break_even: 'diagnosis-card break-even',
  };
  const statusLabels: Record<typeof diag.status, string> = {
    loss: 'Déficit operacional estimado',
    sub_target: 'Abaixo da remuneração de referência',
    healthy: 'Resultado estimado positivo',
    break_even: 'Ponto de equilíbrio estimado',
  };

  return h('div', { class: statusClasses[diag.status], 'data-testid': 'diagnostico-preco' },
    h('p', { class: 'eyebrow' }, 'Diagnóstico do seu preço atual'),
    h('p', { class: 'diagnosis-status' }, statusLabels[diag.status]),
    h('p', { class: 'diagnosis-message' }, diag.message),
    h('dl', { class: 'diagnosis-facts' },
      h('div', {}, h('dt', {}, 'Seu preço informado'), h('dd', {}, money(diag.actualPrice))),
      h('div', {}, h('dt', {}, 'Margem estimada'), h('dd', {}, percent(diag.effectiveMargin))),
      h('div', {}, h('dt', {}, 'Resultado estimado por atendimento'), h('dd', {}, money(diag.profit))),
      h('div', {}, h('dt', {}, 'Resultado estimado por hora'), h('dd', { 'data-testid':'resultado-hora' }, diag.profitPerHour===null?'Não disponível (duração zero)':`${money(diag.profitPerHour)}/h`))),
    h('p',{class:'detail'},'Resultado após descontar taxas, custos e a remuneração de referência. Não corresponde ao valor líquido recebido no seu bolso.'));
}

export function renderPreview(s: Session, result: Result, handlers: PreviewHandlers) {
  const body: (Node | null)[] = [profileCard(result)];
  if (result.kind === 'pricing-v1') {
    if (result.actualPriceDiagnosis) {
      body.push(actualPriceDiagnosisCard(result.actualPriceDiagnosis));
    }
    body.push(
      h('p', { class: 'explanation' }, result.explanation),
      h('dl', { class: 'facts' },
        h('div', {}, h('dt', {}, 'Duração estimada de mesa'), h('dd', { 'data-testid': 'duracao' }, duration(result.minutes))),
        h('div', {}, h('dt', {}, 'Tempo de mesa planejado'), h('dd', {}, duration(result.available))),
        h('div', {}, h('dt', {}, 'Preço mínimo do cenário'), h('dd', { 'data-testid': 'minimo' }, money(result.minimum)))),
      result.compatible
        ? h('p', { class: 'ok' }, 'Compatível: a duração estimada cabe no tempo disponível.')
        : h('p', { class: 'warning', role: 'status' }, `Atenção: a duração estimada (${result.minutes} minutos) supera o tempo disponível (${result.available} minutos). O tempo não foi reduzido; considere outro acabamento ou mais tempo.`),
      h('p', { class: 'alert' }, s.snapshot.demo
        ? `Neste exemplo fictício, cobrar menos de ${money(result.minimum)} não cobre os custos e a remuneração considerados.`
        : `Com estas referências, cobrar menos de ${money(result.minimum)} não cobre os custos estimados e a remuneração considerada.`),
      assumptions(s));
  }
  return h('section', { class: 'card' },
    h('h2', { id: 'titulo-etapa', tabindex: -1 }, 'Sua prévia de atendimento'),
    seal(s.snapshot.demo),
    body,
    versionNote(s),
    h('div', { class: 'actions' },
      handlers.report && h('button', { type: 'button', onclick: handlers.report }, 'Ver relatório de demonstração'),
      h('button', { type: 'button', class: 'secondary', onclick: handlers.edit }, 'Editar respostas'),
      h('button', { type: 'button', class: 'link', onclick: handlers.restart }, 'Reiniciar')));
}

