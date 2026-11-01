import { evaluateReport, type PricingResult } from '../core/evaluate';
import type { Session } from '../core/session';
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
  const { result, packages } = evaluateReport(s.snapshot, s.answers);
  const rate = (hourly: string) => `${duration(result.minutes)} × ${money(hourly)}/h`;
  const sameAsChoice = (overrides: Record<string, string>) => Object.entries(overrides).every(([k, v]) => s.answers[k] === v);
  return h('section', { class: 'card report' },
    h('h2', { id: 'titulo-etapa', tabindex: -1 }, 'Relatório de demonstração'),
    seal(),
    h('p', { class: 'notice', role: 'note' }, 'Exemplo de demonstração: não é uma compra, não solicita pagamento e nada será enviado por email.'),
    profileCard(result),
    h('h3', {}, 'Custos do atendimento simulado'),
    h('table', { class: 'costs' },
      h('tbody', {},
        h('tr', {}, h('th', { scope: 'row' }, 'Materiais'), h('td', {}, money(result.materials))),
        h('tr', {}, h('th', { scope: 'row' }, 'Despesas operacionais', h('span', { class: 'detail' }, r.kind === 'pricing-v1' ? rate(r.scenario.operatingHourly) : '')), h('td', {}, money(result.operating))),
        h('tr', {}, h('th', { scope: 'row' }, 'Remuneração', h('span', { class: 'detail' }, r.kind === 'pricing-v1' ? rate(r.scenario.compensationHourly) : '')), h('td', {}, money(result.compensation)))),
      h('tfoot', {}, h('tr', {}, h('th', { scope: 'row' }, 'Custo simulado total'), h('td', { 'data-testid': 'custo' }, money(result.cost))))),
    h('h3', {}, 'Cenários de margem sobre o preço'),
    h('p', {}, 'Preços arredondados para cima ao centavo. O resultado e a margem efetiva usam o preço exibido.'),
    scenarios(result),
    h('h3', {}, 'Alternativas de pacote'),
    h('p', {}, 'Cada alternativa troca apenas o acabamento e mantém as demais respostas, recalculada com as mesmas regras.'),
    h('div', { class: 'packages' }, packages.map(p => {
      const original = r.kind === 'pricing-v1' ? r.packages.find(x => x.id === p.id)?.overrides ?? {} : {};
      return h('article', { class: 'package', 'data-testid': 'pacote' },
        h('h4', {}, p.label, sameAsChoice(original) ? ' (igual à sua escolha)' : ''),
        h('p', {}, `${duration(p.result.minutes)} · custo simulado ${money(p.result.cost)}`),
        !p.result.compatible && h('p', { class: 'warning' }, 'Supera o tempo disponível.'),
        h('ul', { class: 'package-prices' }, p.result.scenarios.map(sc => h('li', {}, `Margem ${percent(sc.margin)}: ${money(sc.price)}`))));
    })),
    assumptions(s),
    versionNote(s),
    h('div', { class: 'actions' },
      h('button', { type: 'button', onclick: handlers.back }, 'Voltar à prévia'),
      h('button', { type: 'button', class: 'secondary', onclick: handlers.edit }, 'Editar respostas'),
      h('button', { type: 'button', class: 'link', onclick: handlers.restart }, 'Reiniciar')));
}

