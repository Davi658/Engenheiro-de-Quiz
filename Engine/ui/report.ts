import { evaluateReport, type PricingResult } from '../core/evaluate';
import type { Session } from '../core/session';
import { resolvePresentation } from '../core/presentation';
import { h, seal } from './dom';
import { duration, money, percent } from './format';
import { assumptions, profileCard, versionNote } from './preview';

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
  const rate = (hourly: string) => `${duration(result.minutes)} × ${money(hourly)}/h`;
  const sameAsChoice = (overrides: Record<string, string>) => Object.entries(overrides).every(([k, v]) => s.answers[k] === v);

  const blockRenderers: Record<string, () => Node | null> = {
    profile: () => profileCard(result),
    'executive-summary': () => h('div', { class: 'executive-summary' },
      h('h3', {}, 'Resumo do Diagnóstico'),
      h('p', {}, `Procedimento com duração estimada de ${duration(result.minutes)} e custo de referência de ${money(result.cost)}.`),
      result.actualPriceDiagnosis ? h('p', {}, `Seu preço atual (${money(result.actualPriceDiagnosis.actualPrice)}) gera um resultado estimado de ${money(result.actualPriceDiagnosis.profit)} por atendimento.`) : null),
    'pricing-diagnosis': () => (result.actualPriceDiagnosis ? h('div', { class: 'report-actual-price' },
      h('h3', {}, 'Análise do seu Preço Informado'),
      h('p', {}, `Atualmente você indicou cobrar ${money(result.actualPriceDiagnosis.actualPrice)}. `),
      h('p', { class: ['loss', 'sub_target'].includes(result.actualPriceDiagnosis.status) ? 'warning' : 'notice' }, result.actualPriceDiagnosis.message),
      h('p', {}, 'Resultado estimado por hora: ', h('strong', { 'data-testid': 'resultado-hora' }, result.actualPriceDiagnosis.profitPerHour === null ? 'Não disponível (duração zero)' : `${money(result.actualPriceDiagnosis.profitPerHour)}/h`)),
      h('p', { class: 'detail' }, 'Excedente após taxas, custos e remuneração de referência, dividido pela duração estimada. Não representa seu ganho líquido real.')) : null),
    'cost-breakdown': () => h('div', { class: 'cost-breakdown' },
      h('h3', {}, 'Custos do atendimento simulado'),
      h('table', { class: 'costs' },
        h('tbody', {},
          h('tr', {}, h('th', { scope: 'row' }, 'Materiais'), h('td', {}, money(result.materials))),
          h('tr', {}, h('th', { scope: 'row' }, 'Despesas operacionais', h('span', { class: 'detail' }, r.kind === 'pricing-v1' ? rate(r.scenario.operatingHourly) : '')), h('td', {}, money(result.operating))),
          h('tr', {}, h('th', { scope: 'row' }, 'Remuneração', h('span', { class: 'detail' }, r.kind === 'pricing-v1' ? rate(r.scenario.compensationHourly) : '')), h('td', {}, money(result.compensation)))),
        h('tfoot', {}, h('tr', {}, h('th', { scope: 'row' }, 'Custo simulado total'), h('td', { 'data-testid': 'custo' }, money(result.cost)))))),
    'margin-scenarios': () => h('div', { class: 'margin-scenarios' },
      h('h3', {}, 'Cenários de margem sobre o preço'),
      h('p', {}, 'Preços arredondados para cima ao centavo. O resultado e a margem efetiva usam o preço exibido.'),
      scenarios(result)),
    packages: () => (packages.length > 0 ? h('div', { class: 'packages' },
      h('h3', {}, 'Alternativas de pacote'),
      h('p', {}, 'Cada alternativa troca apenas o acabamento e mantém as demais respostas, recalculada com as mesmas regras.'),
      h('div', { class: 'packages-list' }, packages.map(p => {
        const original = r.kind === 'pricing-v1' ? r.packages.find(x => x.id === p.id)?.overrides ?? {} : {};
        return h('article', { class: 'package', 'data-testid': 'pacote' },
          h('h4', {}, p.label, sameAsChoice(original) ? ' (igual à sua escolha)' : ''),
          h('p', {}, `${duration(p.result.minutes)} · custo simulado ${money(p.result.cost)}`),
          !p.result.compatible && h('p', { class: 'warning' }, 'Supera o tempo disponível.'),
          h('ul', { class: 'package-prices' }, p.result.scenarios.map(sc => h('li', {}, `Margem ${percent(sc.margin)}: ${money(sc.price)}`))));
      }))) : null),
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
        h('h3', {}, 'Metodologia e Referências'),
        h('ul', {}, evidence.sources.map(src =>
          h('li', {},
            h('a', { href: src.url, target: '_blank', rel: 'noopener noreferrer' }, src.title),
            ` (${src.scope} · consultado em ${src.accessedOn})`))))
    );
  }
  if (evidence.limitations.length > 0 && s.snapshot.schemaVersion === 2) {
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
    assumptions(s),
    evidenceNodes,
    versionNote(s),
    h('div', { class: 'actions' },
      h('button', { type: 'button', onclick: handlers.back }, 'Voltar à prévia'),
      h('button', { type: 'button', class: 'secondary', onclick: handlers.edit }, 'Editar respostas'),
      h('button', { type: 'button', class: 'link', onclick: handlers.restart }, 'Reiniciar')));
}
