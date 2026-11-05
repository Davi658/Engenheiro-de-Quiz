import type { Result, PricingResult } from '../core/evaluate';
import type { BusinessDiagnosisResult } from '../core/business';
import type { Session } from '../core/session';
import { resolvePresentation } from '../core/presentation';
import { h, seal } from './dom';
import { duration, money, percent } from './format';
import { renderGrowthPlan } from './growth';

export type PreviewHandlers = { edit: () => void; report?: () => void; restart: () => void };

export const versionNote = (s: Session) => h('p', { class: 'version' }, `Quiz ${s.quizId} · versão ${s.version}`);

export function profileCard(result: Result) {
  return h('div', { class: 'profile' },
    h('p', { class: 'eyebrow' }, 'Perfil do negócio'),
    h('p', { class: 'profile-label' }, result.profile.label),
    h('p', {}, result.profile.description));
}

export function assumptions(s: Session) {
  const r = s.snapshot.result;
  if (r.kind === 'business-diagnosis-v1') {
    return h('p', { class: 'assumptions' },
      'Metodologia Sebrae de formação de preços: rateio de despesas fixas por hora produtiva, cobertura de custos de insumos e margem sobre faturamento. ',
      'Todos os valores são autodeclarados por você. Os resultados constituem estimativas pedagógicas e não representam garantia de lucro ou faturamento.');
  }
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
      h('div', {}, h('dt', {}, 'Resultado estimado por hora'), h('dd', { 'data-testid': 'resultado-hora' }, diag.profitPerHour === null ? 'Não disponível (duração zero)' : `${money(diag.profitPerHour)}/h`))),
    h('p', { class: 'detail' }, 'Resultado após descontar taxas, custos e a remuneração de referência. Não corresponde ao valor líquido recebido no seu bolso.'));
}

export function renderPreview(s: Session, result: Result, handlers: PreviewHandlers) {
  const { presentation, evidence } = resolvePresentation(s.snapshot);
  const blocks: (Node | null)[] = [];

  const blockRenderers: Record<string, () => Node | null> = {
    'growth-plan': () => result.kind==='business-diagnosis-v1'?renderGrowthPlan(result.growthPlan):null,
    profile: () => profileCard(result),
    'pricing-diagnosis': () => (result.kind === 'pricing-v1' && result.actualPriceDiagnosis ? actualPriceDiagnosisCard(result.actualPriceDiagnosis) : null),
    'time-audit': () => {
      if (result.kind !== 'pricing-v1') return null;
      const pr = result as PricingResult;
      return h('div', { class: 'time-audit' },
        h('p', { class: 'explanation' }, pr.explanation),
        h('dl', { class: 'facts' },
          h('div', {}, h('dt', {}, 'Duração estimada de mesa'), h('dd', { 'data-testid': 'duracao' }, duration(pr.minutes))),
          h('div', {}, h('dt', {}, 'Tempo de mesa planejado'), h('dd', {}, duration(pr.available))),
          h('div', {}, h('dt', {}, 'Preço mínimo do cenário'), h('dd', { 'data-testid': 'minimo' }, money(pr.minimum)))),
        pr.compatible
          ? h('p', { class: 'ok' }, 'Compatível: a duração estimada cabe no tempo disponível.')
          : h('p', { class: 'warning', role: 'status' }, `Atenção: a duração estimada (${pr.minutes} minutos) supera o tempo disponível (${pr.available} minutos). O tempo não foi reduzido; considere outro acabamento ou mais tempo.`));
    },
    'hourly-rate': () => null,
    scenarios: () => {
      if (result.kind !== 'pricing-v1') return null;
      const pr = result as PricingResult;
      return h('p', { class: 'alert' }, s.snapshot.demo
        ? `Neste exemplo fictício, cobrar menos de ${money(pr.minimum)} não cobre os custos e a remuneração considerados.`
        : `Com estas referências, cobrar menos de ${money(pr.minimum)} não cobre os custos estimados e a remuneração considerada.`);
    },
    'hidden-costs': () => {
      return h('div', { class: 'hidden-costs-callout' },
        h('p', { class: 'eyebrow' }, 'Atenção aos Custos Invisíveis'),
        h('p', {}, 'Cada atendimento consome kit descartável, preparadores químicos, brocas e energia da cabine LED/UV. Não deixe esses insumos saírem do seu ganho pessoal.'));
    },

    // Business Diagnosis Blocks
    'business-summary': () => {
      if (result.kind !== 'business-diagnosis-v1') return null;
      const br = result as BusinessDiagnosisResult;
      return h('div', { class: 'business-summary card-section', 'data-testid': 'resumo-negocio' },
        h('p', { class: 'eyebrow' }, 'Visão Geral do Negócio'),
        h('dl', { class: 'facts' },
          h('div', {}, h('dt', {}, 'Atendimentos por mês'), h('dd', { 'data-testid': 'total-atendimentos' }, `${br.totalMonthlyServices}`)),
          h('div', {}, h('dt', {}, 'Faturamento mensal estimado'), h('dd', { 'data-testid': 'faturamento-mensal' }, money(br.grossMonthlyRevenue))),
          h('div', {}, h('dt', {}, 'Margem de contribuição total'), h('dd', {}, money(br.totalContributionMargin))),
          h('div', {}, h('dt', {}, 'Ponto de equilíbrio total'), h('dd', {}, br.financials.breakEvenTotalRevenue !== null ? money(br.financials.breakEvenTotalRevenue) : 'Não atingível (margem negativa)'))),
        br.financials.incompleteExpensesNotice
          ? h('p', { class: 'warning', role: 'note' }, br.financials.incompleteExpensesNotice)
          : null,
        br.monthlyHistory?.trend
          ? h('p', { class: 'detail trend-note' }, `Tendência histórica: ${br.monthlyHistory.trend.message}`)
          : null,
        h('p', { class: 'detail' }, 'A margem de contribuição é o valor que sobra das receitas após pagar os materiais consumidos e as taxas dos meios de pagamento.'));
    },

    'monthly-history': () => {
      if (result.kind !== 'business-diagnosis-v1') return null;
      const br = result as BusinessDiagnosisResult;
      if (!br.monthlyHistory || !br.monthlyHistory.isProvided) return null;
      const mh = br.monthlyHistory;
      return h('div', { class: 'monthly-history card-section', 'data-testid': 'historico-mensal-preview' },
        h('p', { class: 'eyebrow' }, 'Histórico Recente e Tendência'),
        mh.trend ? h('p', { class: `trend-badge trend-${mh.trend.direction}` }, mh.trend.message) : null,
        mh.discrepancyWithEstimatedRoutine
          ? h('p', { class: 'detail' }, `Média histórica de ${money(mh.averageHistoricalRevenue)}/mês (${mh.discrepancyWithEstimatedRoutine} em relação ao estimado atual).`)
          : null);
    },

    'capacity-diagnosis': () => {
      if (result.kind !== 'business-diagnosis-v1') return null;
      const br = result as BusinessDiagnosisResult;
      const statusClass = br.capacity.status === 'overcapacity' ? 'warning' : 'ok';
      return h('div', { class: `capacity-diagnosis card-section ${statusClass}`, 'data-testid': 'diagnostico-capacidade' },
        h('p', { class: 'eyebrow' }, 'Capacidade e Rotina'),
        h('dl', { class: 'facts' },
          h('div', {}, h('dt', {}, 'Horas demandadas em mesa'), h('dd', { 'data-testid': 'horas-demandadas' }, `${br.capacity.hoursDemandedPerMonth} h/mês`)),
          h('div', {}, h('dt', {}, 'Horas líquidas disponíveis'), h('dd', {}, `${br.capacity.netHoursAvailablePerMonth} h/mês`)),
          h('div', {}, h('dt', {}, 'Taxa de ocupação da agenda'), h('dd', { 'data-testid': 'taxa-ocupacao' }, br.capacity.occupancyPercent))),
        h('p', { class: statusClass, role: 'status' }, br.capacity.message));
    },

    'contribution-ranking': () => {
      if (result.kind !== 'business-diagnosis-v1') return null;
      const br = result as BusinessDiagnosisResult;
      if (br.services.length === 0) return null;
      return h('div', { class: 'contribution-ranking card-section', 'data-testid': 'ranking-servicos' },
        h('p', { class: 'eyebrow' }, 'Rentabilidade por Hora de Mesa'),
        h('p', { class: 'detail' }, 'Contribuição por hora após materiais e taxas, antes das despesas fixas e retirada pessoal:'),
        h('ul', { class: 'ranking-list' }, [...br.services].sort((a,b)=>a.hourlyRanking-b.hourlyRanking).map(s =>
          h('li', { class: 'ranking-item' },
            h('span', { class: 'rank-badge' }, `#${s.hourlyRanking}`),
            h('div', { class: 'rank-details' },
              h('strong', {}, s.label),
              h('span', { class: 'detail' }, `Preço: ${money(s.price)} · Duração: ${s.timeMinutes} min · Margem: ${money(s.unitContributionMargin)}`),
              h('span', { class: 'highlight-rate' }, `Retorno: ${money(s.contributionPerHour)}/hora`))))));
    },

    'priority-actions': () => {
      if (result.kind !== 'business-diagnosis-v1') return null;
      const br = result as BusinessDiagnosisResult;
      if (br.actionPlan.length === 0) return null;
      return h('div', { class: 'priority-actions card-section', 'data-testid': 'acoes-prioritarias' },
        h('p', { class: 'eyebrow' }, 'Ajustes Prioritários Recomendados'),
        h('div', { class: 'actions-preview' }, br.actionPlan.slice(0, 3).map(a =>
          h('article', { class: 'action-preview-card' },
            h('h4', {}, a.title),
            h('p', {}, h('strong', {}, 'Problema identificado: '), a.problem),
            h('p', {}, h('strong', {}, 'Ação recomendada: '), a.action),
            h('p', { class: 'detail' }, `Evidência nas respostas: ${a.evidence}`)))));
    },

    'limitations-notice': () => {
      if (result.kind !== 'business-diagnosis-v1') return null;
      const br = result as BusinessDiagnosisResult;
      return h('div', { class: 'limitations-notice card-section' },
        h('p', { class: 'eyebrow' }, 'Premissas e Limitações'),
        h('ul', { class: 'limitations' }, br.limitations.map(lim => h('li', {}, lim))));
    },
  };

  for (const b of presentation.preview.blocks) {
    const fn = blockRenderers[b];
    if (fn) {
      const node = fn();
      if (node) blocks.push(node);
    }
  }

  const evidenceNodes: (Node | null)[] = [];
  if (evidence.sources.length > 0) {
    evidenceNodes.push(
      h('div', { class: 'evidence-sources' },
        h('p', { class: 'eyebrow' }, 'Metodologia e Referências Legais'),
        h('ul', {}, evidence.sources.map(src =>
          h('li', {},
            h('a', { href: src.url, target: '_blank', rel: 'noopener noreferrer' }, src.title),
            ` (${src.scope} · consultado em ${src.accessedOn})`))))
    );
  }
  if (evidence.limitations.length > 0 && (s.snapshot.schemaVersion === 2 || s.snapshot.schemaVersion === 3)) {
    evidenceNodes.push(
      h('ul', { class: 'limitations', role: 'note' }, evidence.limitations.map(lim =>
        h('li', {}, lim)))
    );
  }

  return h('section', { class: 'card' },
    h('h2', { id: 'titulo-etapa', tabindex: -1 }, presentation.preview.title),
    seal(s.snapshot.demo),
    blocks,
    assumptions(s),
    evidenceNodes,
    versionNote(s),
    h('div', { class: 'actions' },
      handlers.report && h('button', { type: 'button', onclick: handlers.report }, 'Ver relatório completo'),
      h('button', { type: 'button', class: 'secondary', onclick: handlers.edit }, 'Editar respostas'),
      h('button', { type: 'button', class: 'link', onclick: handlers.restart }, 'Reiniciar')));
}
