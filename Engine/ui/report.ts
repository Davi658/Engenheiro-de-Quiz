import { evaluateReport, type PricingResult } from '../core/evaluate';
import type { BusinessDiagnosisResult } from '../core/business';
import type { Session } from '../core/session';
import { resolvePresentation } from '../core/presentation';
import { h, seal } from './dom';
import { duration, money, percent } from './format';
import { assumptions, profileCard, versionNote } from './preview';
import { renderGrowthPlan } from './growth';

export type ReportHandlers = { back: () => void; edit: () => void; restart: () => void };

function scenarios(result: PricingResult) {
  return h('ul', { class: 'scenarios' }, result.scenarios.map(sc => h('li', { class: 'scenario', 'data-testid': 'cenario' },
    h('p', { class: 'eyebrow' }, `Margem-alvo ${percent(sc.margin)}`),
    h('p', { class: 'price' }, money(sc.price)),
    h('dl', {},
      h('div', {}, h('dt', {}, `Taxa (${percent(result.feeRate)})`), h('dd', {}, money(sc.fee))),
      h('div', {}, h('dt', {}, 'Resultado simulado'), h('dd', {}, money(sc.profit))),
      h('div', {}, h('dt', {}, 'Margem efetiva'), h('dd', {}, percent(sc.effectiveMargin)))))));
}

export function renderReport(s: Session, handlers: ReportHandlers) {
  const r = s.snapshot.result;
  const { presentation, evidence } = resolvePresentation(s.snapshot);
  const reportConfig = presentation.report;
  if (!reportConfig) throw Error('Relatório não configurado.');

  const { result, packages } = evaluateReport(s.snapshot, s.answers);
  const isPricing = result.kind === 'pricing-v1';
  const pr = isPricing ? (result as PricingResult) : null;
  const br = result.kind === 'business-diagnosis-v1' ? (result as BusinessDiagnosisResult) : null;

  const rate = (hourly: string) => pr ? `${duration(pr.minutes)} × ${money(hourly)}/h` : '';
  const sameAsChoice = (overrides: Record<string, string>) => Object.entries(overrides).every(([k, v]) => s.answers[k] === v);

  const blockRenderers: Record<string, () => Node | null> = {
    'growth-plan': () => br?renderGrowthPlan(br.growthPlan,true):null,
    profile: () => profileCard(result),

    'executive-summary': () => {
      if (br) {
        return h('div', { class: 'executive-summary' },
          h('h3', {}, 'Resumo Executivo do Negócio'),
          h('p', {}, `Diagnóstico operacional baseado em ${br.totalMonthlyServices} atendimentos/mês com faturamento bruto estimado de ${money(br.grossMonthlyRevenue)}.`),
          h('p', {}, `Margem de contribuição média de ${percent(br.averageContributionMarginRatio)} gerando ${money(br.totalContributionMargin)}/mês para cobrir despesas fixas (${money(br.fixedExpenses.totalFixedExpenses)}) e pró-labore (${money(br.financials.currentRemuneration)}).`),
          h('p', { class: br.financials.status === 'healthy' ? 'ok' : 'warning' },
            br.financials.status === 'healthy'
              ? `Resultado operacional estimado positivo de ${money(br.financials.netOperatingProfit)}/mês após todas as despesas e pró-labore.`
              : `Atenção: déficit operacional estimado de ${money(br.financials.netOperatingProfit)}/mês considerando a retirada atual informada.`));
      }
      if (pr) {
        return h('div', { class: 'executive-summary' },
          h('h3', {}, 'Resumo do Diagnóstico'),
          h('p', {}, `Procedimento com duração estimada de ${duration(pr.minutes)} e custo de referência de ${money(pr.cost)}.`),
          pr.actualPriceDiagnosis ? h('p', {}, `Seu preço atual (${money(pr.actualPriceDiagnosis.actualPrice)}) gera um resultado estimado de ${money(pr.actualPriceDiagnosis.profit)} por atendimento.`) : null);
      }
      return null;
    },

    'pricing-diagnosis': () => {
      if (!pr || !pr.actualPriceDiagnosis) return null;
      return h('div', { class: 'report-actual-price' },
        h('h3', {}, 'Análise do seu Preço Informado'),
        h('p', {}, `Atualmente você indicou cobrar ${money(pr.actualPriceDiagnosis.actualPrice)}. `),
        h('p', { class: ['loss', 'sub_target'].includes(pr.actualPriceDiagnosis.status) ? 'warning' : 'notice' }, pr.actualPriceDiagnosis.message),
        h('p', {}, 'Resultado estimado por hora: ', h('strong', { 'data-testid': 'resultado-hora' }, pr.actualPriceDiagnosis.profitPerHour === null ? 'Não disponível (duração zero)' : `${money(pr.actualPriceDiagnosis.profitPerHour)}/h`)),
        h('p', { class: 'detail' }, 'Excedente após taxas, custos e remuneração de referência, dividido pela duração estimada. Não representa seu ganho líquido real.'));
    },

    'cost-breakdown': () => {
      if (!pr) return null;
      return h('div', { class: 'cost-breakdown' },
        h('h3', {}, 'Custos do atendimento simulado'),
        h('table', { class: 'costs' },
          h('tbody', {},
            h('tr', {}, h('th', { scope: 'row' }, 'Materiais'), h('td', {}, money(pr.materials))),
            h('tr', {}, h('th', { scope: 'row' }, 'Despesas operacionais', h('span', { class: 'detail' }, r.kind === 'pricing-v1' ? rate(r.scenario.operatingHourly) : '')), h('td', {}, money(pr.operating))),
            h('tr', {}, h('th', { scope: 'row' }, 'Remuneração', h('span', { class: 'detail' }, r.kind === 'pricing-v1' ? rate(r.scenario.compensationHourly) : '')), h('td', {}, money(pr.compensation)))),
          h('tfoot', {}, h('tr', {}, h('th', { scope: 'row' }, 'Custo simulado total'), h('td', { 'data-testid': 'custo' }, money(pr.cost))))));
    },

    'margin-scenarios': () => {
      if (!pr) return null;
      return h('div', { class: 'margin-scenarios' },
        h('h3', {}, 'Cenários de margem sobre o preço'),
        h('p', {}, 'Preços arredondados para cima ao centavo. O resultado e a margem efetiva usam o preço exibido.'),
        scenarios(pr));
    },

    packages: () => {
      if (!pr || packages.length === 0) return null;
      return h('div', { class: 'packages' },
        h('h3', {}, 'Alternativas de pacote'),
        h('p', {}, 'Cada alternativa troca apenas o acabamento e mantém as demais respostas, recalculada com as mesmas regras.'),
        h('div', { class: 'packages-list' }, packages.map(p => {
          const original = r.kind === 'pricing-v1' ? r.packages.find(x => x.id === p.id)?.overrides ?? {} : {};
          return h('article', { class: 'package', 'data-testid': 'pacote' },
            h('h4', {}, p.label, sameAsChoice(original) ? ' (igual à sua escolha)' : ''),
            h('p', {}, `${duration(p.result.minutes)} · custo simulado ${money(p.result.cost)}`),
            !p.result.compatible && h('p', { class: 'warning' }, 'Supera o tempo disponível.'),
            h('ul', { class: 'package-prices' }, p.result.scenarios.map(sc => h('li', {}, `Margem ${percent(sc.margin)}: ${money(sc.price)}`))));
        })));
    },

    'menu-recommendation': () => h('div', { class: 'menu-recommendation' },
      h('h3', {}, 'Diretrizes para seu Cardápio de Serviços'),
      h('ul', { class: 'menu-guidelines' },
        h('li', {}, h('strong', {}, 'Aplicação nova: '), 'Precifique sempre com margem de segurança (15% a 25%) considerando o tempo de cabine e insumos descartáveis.'),
        h('li', {}, h('strong', {}, 'Manutenção periódica (15 a 25 dias): '), 'Nunca cobre metade do preço. A manutenção consome quase o mesmo tempo e produtos caros; o valor justo é de 70% a 80% da aplicação.'),
        h('li', {}, h('strong', {}, 'Remoção de produto anterior: '), 'Cobrar taxa fixa para cobrir desgaste de brocas e tempo de mesa (+ R$ 20 a R$ 35).'))),

    'whatsapp-script': () => h('div', { class: 'whatsapp-script' },
      h('h3', {}, 'Script de WhatsApp para Atualização de Preços'),
      h('p', {}, 'Modelo de mensagem profissional para avisar suas clientes sem gerar atritos:'),
      h('blockquote', { class: 'script-box' },
        '“Oi, [Nome da Cliente]! Passando para agradecer pela confiança no meu trabalho. Para continuar investindo em produtos de excelência (géis certificados, esterilização hospitalar e técnicas de ponta) e manter o atendimento individualizado que você merece, a partir de [Data] nossa tabela de serviços passará por uma pequena atualização. O seu procedimento passará para [Valor]. Horários já agendados permanecem no valor anterior. Qualquer dúvida, estou à disposição!”')),

    // Business Diagnosis Specific Report Blocks
    'dre-overview': () => {
      if (!br) return null;
      return h('div', { class: 'dre-overview card-section' },
        h('h3', {}, 'Quadro Financeiro Operacional (DRE Simples)'),
        h('table', { class: 'costs dre-table' },
          h('tbody', {},
            h('tr', {}, h('th', { scope: 'row' }, '(+) Faturamento Bruto Mensal'), h('td', {}, money(br.grossMonthlyRevenue))),
            h('tr', {}, h('th', { scope: 'row' }, '(-) Insumos e Materiais Consumidos'), h('td', {}, `-${money(br.totalMonthlyMaterials)}`)),
            h('tr', {},
              h('th', { scope: 'row' }, `(-) Taxas de Pagamento${br.paymentFeeRate !== null ? ` (${percent(br.paymentFeeRate)}${br.paymentFeeRateEstimated ? ' est.' : ''})` : ''}`),
              h('td', {}, br.totalPaymentFees !== null ? `-${money(br.totalPaymentFees)}` : 'Não informada')),
            h('tr', { class: 'subtotal-row' }, h('th', { scope: 'row' }, '(=) Margem de Contribuição Total'), h('td', {}, money(br.totalContributionMargin))),
            h('tr', {}, h('th', { scope: 'row' }, '(-) Despesas Fixas Operacionais e Marketing'), h('td', {}, `-${money(br.fixedExpenses.totalFixedExpenses)}`)),
            h('tr', { class: 'subtotal-row' }, h('th', { scope: 'row' }, '(=) Resultado Operacional antes da Retirada'), h('td', {}, money(br.financials.operatingProfitBeforeWithdrawal))),
            h('tr', {}, h('th', { scope: 'row' }, '(-) Pró-labore / Retirada Pessoal Informada'), h('td', {}, `-${money(br.financials.currentRemuneration)}`))),
          h('tfoot', {},
            h('tr', { class: br.financials.status === 'healthy' ? 'profit-row' : 'deficit-row' },
              h('th', { scope: 'row' }, '(=) Resultado estimado após a retirada'),
              h('td', {}, money(br.financials.netOperatingProfit))))),
        br.financials.incompleteExpensesNotice
          ? h('p', { class: 'warning incomplete-expenses-notice', role: 'note' }, br.financials.incompleteExpensesNotice)
          : null,
        h('p', { class: 'detail' }, br.financials.breakEvenExplanation));
    },

    'monthly-history': () => {
      if (!br || !br.monthlyHistory || !br.monthlyHistory.isProvided) return null;
      const mh = br.monthlyHistory;
      return h('div', { class: 'monthly-history card-section', 'data-testid': 'historico-mensal' },
        h('h3', {}, 'Histórico Real e Tendência Recente'),
        mh.trend ? h('div', { class: `trend-badge trend-${mh.trend.direction}` },
          h('span', { class: 'trend-icon' },
            mh.trend.direction === 'growing' ? '📈' :
            mh.trend.direction === 'declining' ? '📉' :
            mh.trend.direction === 'fluctuating' ? '📊' : '📅'
          ),
          h('span', {}, mh.trend.message)
        ) : null,
        mh.discrepancyWithEstimatedRoutine
          ? h('p', { class: 'detail' }, `Comparação com rotina estimada: média real de ${money(mh.averageHistoricalRevenue)}/mês (${mh.discrepancyWithEstimatedRoutine} em relação ao faturamento estimado atual de ${money(br.grossMonthlyRevenue)}).`)
          : null,
        h('div', { class: 'history-table-wrapper' },
          h('table', { class: 'costs history-table' },
            h('thead', {},
              h('tr', {},
                h('th', { scope: 'col' }, 'Período'),
                h('th', { scope: 'col' }, 'Faturamento Bruto'),
                h('th', { scope: 'col' }, 'Despesas Pagas'),
                h('th', { scope: 'col' }, 'Retiradas'),
                h('th', { scope: 'col' }, 'Saldo Líquido'))),
            h('tbody', {}, mh.months.map(m =>
              h('tr', {},
                h('td', {}, m.label),
                h('td', {}, money(m.revenue)),
                h('td', {}, m.expenses !== null ? money(m.expenses) : 'Não inf.'),
                h('td', {}, m.withdrawals !== null ? money(m.withdrawals) : 'Não inf.'),
                h('td', { class: m.netResult !== null ? (parseFloat(m.netResult) >= 0 ? 'text-ok' : 'text-warning') : '' },
                  m.netResult !== null ? money(m.netResult) : 'Não inf.')))))));
    },

    'service-pricing-analysis': () => {
      if (!br) return null;
      return h('div', { class: 'service-pricing-analysis card-section' },
        h('h3', {}, 'Análise dos Serviços e Preços Sugeridos (Metodologia Sebrae)'),
        h('p', { class: 'detail' }, 'Comparação entre seu preço praticado e o preço sugerido pelo método de markup divisor Sebrae (materiais + rateio de horas fixas e pró-labore):'),
        h('div', { class: 'services-table-wrapper' },
          h('table', { class: 'costs services-table' },
            h('thead', {},
              h('tr', {},
                h('th', { scope: 'col' }, 'Serviço / Combo'),
                h('th', { scope: 'col' }, 'Duração'),
                h('th', { scope: 'col' }, 'Preço Atual'),
                h('th', { scope: 'col' }, 'Materiais'),
                h('th', { scope: 'col' }, 'Margem/h'),
                h('th', { scope: 'col' }, 'Sugerido (15%)'),
                h('th', { scope: 'col' }, 'Sugerido (25%)'))),
            h('tbody', {}, br.services.map(s =>
              h('tr', {},
                h('td', {}, s.label),
                h('td', {}, `${s.timeMinutes} min`),
                h('td', {}, money(s.price)),
                h('td', {}, money(s.materialsCost)),
                h('td', {}, `${money(s.contributionPerHour)}/h`),
                h('td', {}, money(s.suggestedPrices.find(p => p.margin === '0.15')?.price ?? s.price)),
                h('td', {}, money(s.suggestedPrices.find(p => p.margin === '0.25')?.price ?? s.price))))))));
    },

    'capacity-audit': () => {
      if (!br) return null;
      return h('div', { class: 'capacity-audit card-section' },
        h('h3', {}, 'Auditoria de Rotina e Capacidade de Atendimento'),
        h('dl', { class: 'facts' },
          h('div', {}, h('dt', {}, 'Dias de atendimento por semana'), h('dd', {}, `${br.capacity.daysPerWeek} dias`)),
          h('div', {}, h('dt', {}, 'Horas disponíveis por dia'), h('dd', {}, `${br.capacity.hoursPerDay} horas`)),
          h('div', {}, h('dt', {}, 'Tempo mensal de apoio (limpeza/admin)'), h('dd', {}, `${br.capacity.supportHoursPerMonth} horas`)),
          h('div', {}, h('dt', {}, 'Horas líquidas de mesa disponíveis'), h('dd', {}, `${br.capacity.netHoursAvailablePerMonth} h/mês`)),
          h('div', {}, h('dt', {}, 'Horas ocupadas pelos atendimentos'), h('dd', {}, `${br.capacity.hoursDemandedPerMonth} h/mês`)),
          h('div', {}, h('dt', {}, 'Taxa de ocupação da agenda'), h('dd', {}, br.capacity.occupancyPercent))),
        h('p', { class: br.capacity.status === 'overcapacity' ? 'warning' : 'ok' }, br.capacity.message));
    },

    'personal-finance': () => {
      if (!br || !br.personalFinances || !br.personalFinances.isProvided) {
        return h('div', { class: 'personal-finance card-section muted' },
          h('h3', {}, 'Quadro de Finanças Pessoais'),
          h('p', { class: 'detail' }, 'Módulo opcional não preenchido. O diagnóstico foi emitido com foco exclusivo nos dados operacionais do negócio.'));
      }
      const pf = br.personalFinances;
      return h('div', { class: 'personal-finance card-section' },
        h('h3', {}, 'Quadro de Finanças Pessoais e Família'),
        h('p', {}, `Despesas essenciais declaradas de ${money(pf.totalPersonalExpenses)}/mês, com outras rendas familiares de ${money(pf.otherIncome)}/mês.`),
        h('p', {}, `Necessidade líquida de retirada pessoal: `, h('strong', {}, money(pf.netPersonalNeed))),
        h('p', {}, `Retirada atual informada do negócio: `, h('strong', {}, money(pf.currentWithdrawal))),
        h('p', { class: pf.isSufficient === true ? 'ok' : 'warning' },
          pf.isSufficient === true
            ? `Sua retirada atual cobre integralmente a necessidade básica informada (excedente de ${money(pf.difference)}/mês).`
            : pf.isSufficient === false
            ? `Atenção: sua retirada atual fica ${money(pf.difference)}/mês abaixo da necessidade pessoal informada.`
            : `Despesas não informadas (${pf.uninformedCategories?.join(', ')}): não é possível concluir se sua retirada atual é suficiente para cobrir o custo de vida pessoal.`));
    },

    'reserves-and-debt': () => {
      if (!br || !br.reservesAndDebts || !br.reservesAndDebts.isProvided) return null;
      const rd = br.reservesAndDebts;
      return h('div', { class: 'reserves-and-debt card-section' },
        h('h3', {}, 'Reservas, Caixa e Dívidas Conhecidas'),
        rd.hasOverdueDebt
          ? h('div', { class: 'warning debt-overdue-alert' },
              h('strong', {}, '⚠️ Atenção: Dívidas ou parcelas em atraso informadas. '),
              'Encargos de mora e juros rotativos corroem margens rapidamente. Estancar pendências vencidas é prioridade financeira absoluta antes de qualquer formação de reservas ou novos investimentos.')
          : null,
        h('dl', { class: 'facts' },
          h('div', {}, h('dt', {}, 'Caixa de giro da empresa'), h('dd', {}, money(rd.businessCash))),
          h('div', {}, h('dt', {}, 'Reserva pessoal de emergência'), h('dd', {}, money(rd.personalReserve))),
          h('div', {}, h('dt', {}, 'Parcelas mensais de dívidas'), h('dd', {}, money(rd.monthlyDebt))),
          h('div', {}, h('dt', {}, 'Saldo total devedor'), h('dd', {}, money(rd.totalDebt))),
          h('div', {}, h('dt', {}, 'Situação dos pagamentos'), h('dd', { class: rd.hasOverdueDebt ? 'text-warning' : 'text-ok' },
            rd.hasOverdueDebt
              ? `Em atraso${rd.overdueDebtAmount ? ` (${money(rd.overdueDebtAmount)})` : ''}`
              : rd.overdueDebtStatus === 'up_to_date' ? 'Em dia' : 'Sem dívidas ativas'
          )),
          h('div', {}, h('dt', {}, 'Meses de reserva operacional'), h('dd', {}, rd.runwayMonths ? `${rd.runwayMonths} meses` : 'Não calculado'))));
    },

    'action-plan': () => {
      if (!br || br.actionPlan.length === 0) return null;
      return h('div', { class: 'action-plan card-section' },
        h('h3', {}, 'Plano de Ação Estruturado (30, 60 e 90 Dias)'),
        h('p', { class: 'detail' }, 'Ações prioritárias baseadas estritamente nas respostas informadas no seu diagnóstico:'),
        h('div', { class: 'plan-stages' }, br.actionPlan.map(a =>
          h('article', { class: `plan-card priority-${a.priority}` },
            h('div', { class: 'plan-header' },
              h('span', { class: 'timeframe-badge' }, a.timeframe.replace('_', ' ')),
              h('h4', {}, a.title)),
            h('p', {}, h('strong', {}, 'Problema: '), a.problem),
            h('p', {}, h('strong', {}, 'Evidência: '), a.evidence),
            h('p', {}, h('strong', {}, 'Ação recomendada: '), a.action),
            h('div', { class: 'plan-meta' },
              h('span', {}, `Prioridade: ${a.priority}`),
              h('span', {}, `Esforço: ${a.effort}`),
              h('span', {}, `Indicador: ${a.indicator}`))))));
    },

    'sensitivity-scenarios': () => {
      if (!br || br.sensitivityScenarios.length === 0) return null;
      return h('div', { class: 'sensitivity-scenarios card-section' },
        h('h3', {}, 'Cenários de Sensibilidade e Evolução'),
        h('div', { class: 'scenarios-list' }, br.sensitivityScenarios.map(sc =>
          h('article', { class: 'scenario-card' },
            h('h4', {}, sc.title),
            h('p', {}, sc.description),
            h('dl', {},
              h('div', {}, h('dt', {}, 'Faturamento projetado'), h('dd', {}, money(sc.projectedRevenue))),
              h('div', {}, h('dt', {}, 'Resultado estimado após a retirada'), h('dd', {}, money(sc.projectedNetProfit))))))));
    },

    recommendations: () => {
      if (!br || br.recommendations.length === 0) return null;
      return h('div', { class: 'recommendations card-section' },
        h('h3', {}, 'Aprimoramento Técnico e Recomendações'),
        h('p', { class: 'detail' }, 'Com base nas técnicas que você indicou ter interesse em aprender ou aprimorar:'),
        h('div', { class: 'recommendations-list' }, br.recommendations.map(rec =>
          h('article', { class: 'rec-card' },
            h('h4', {}, rec.title),
            h('p', {}, rec.need),
            h('p', { class: 'detail' }, `Público: ${rec.targetAudience} · Pré-requisitos: ${rec.prerequisites}`),
            h('p', {}, h('strong', {}, `Investimento: `), rec.cost, h('span', { class: 'detail' }, ` (verificado em ${rec.verifiedOn})`)),
            rec.isAffiliate ? h('p', { class: 'affiliate-note' }, rec.affiliateDisclaimer) : null,
            h('a', { href: rec.link, target: '_blank', rel: 'noopener noreferrer', class: 'button link-button' }, 'Ver detalhes do curso'),
            rec.freeAlternative ? h('div', { class: 'free-alt' },
              h('p', {}, h('strong', {}, 'Alternativa gratuita verificada: '), rec.freeAlternative.description),
              rec.freeAlternative.url ? h('a', { href: rec.freeAlternative.url, target: '_blank', rel: 'noopener noreferrer' }, rec.freeAlternative.title) : null) : null))));
    },

    'methodology-sources': () => null,
  };

  const blocks: (Node | null)[] = [];
  for (const b of reportConfig.blocks) {
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
        h('h3', {}, 'Metodologia e Referências Legais'),
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

  return h('section', { class: 'card report' },
    h('h2', { id: 'titulo-etapa', tabindex: -1 }, reportConfig.title),
    seal(s.snapshot.demo),
    h('p', { class: 'notice', role: 'note' }, s.snapshot.demo
      ? 'Exemplo de demonstração: não é uma compra, não solicita pagamento e nada será enviado por email.'
      : 'Detalhamento completo da formação do seu preço, custos por atendimento e projeção de margens.'),
    blocks,
    br ? h('ul',{class:'limitations',role:'note'},br.limitations.map(l=>h('li',{},l))) : null,
    assumptions(s),
    evidenceNodes,
    versionNote(s),
    h('div', { class: 'actions' },
      h('button', { type: 'button', onclick: handlers.back }, 'Voltar à prévia'),
      h('button', { type: 'button', class: 'secondary', onclick: handlers.edit }, 'Editar respostas'),
      h('button', { type: 'button', class: 'link', onclick: handlers.restart }, 'Reiniciar')));
}
