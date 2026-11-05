import type { Answers, Question } from '../core/schema';
import { identificationErrors, pageErrors, setAnswer, type Session } from '../core/session';
import { parseMultiChoice, serializeMultiChoice, isConditionMet, normalizeMoney, isUnknownAnswer } from '../core/answers';
import { h, seal } from './dom';
import { money } from './format';

export type FormHandlers = { back?: () => void; next: () => void; restart: () => void };

/** Marks invalid fields, links each message with aria-describedby and focuses the first invalid control. */
export function showErrors(form: HTMLFormElement, errors: Answers) {
  form.querySelectorAll('.field-error:not([role="alert"])').forEach(e => e.remove());
  form.querySelectorAll('[aria-invalid]').forEach(e => {
    e.removeAttribute('aria-invalid');
    e.removeAttribute('aria-describedby');
  });
  let first: HTMLElement | null = null;
  for (const [id, message] of Object.entries(errors)) {
    const group = form.querySelector<HTMLElement>(`[data-field="${CSS.escape(id)}"]`);
    if (!group) continue;
    const errorId = `erro-${id}`;
    group.append(h('p', { class: 'field-error', id: errorId }, message));
    group.querySelectorAll<HTMLInputElement>('input').forEach(input => {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorId);
    });
    first ??= group.querySelector<HTMLInputElement>('input:checked') ?? group.querySelector<HTMLInputElement>('input');
  }
  first?.focus();
}

function actions(handlers: FormHandlers, submitLabel: string) {
  return h('div', { class: 'actions' },
    handlers.back && h('button', { type: 'button', class: 'secondary', onclick: handlers.back }, 'Anterior'),
    h('button', { type: 'submit' }, submitLabel),
    h('button', { type: 'button', class: 'link', onclick: handlers.restart }, 'Reiniciar'));
}

export function renderIdentification(s: Session, handlers: FormHandlers) {
  const q = s.snapshot;
  const form = h('form', { novalidate: true, 'aria-labelledby': 'titulo-etapa' },
    h('p', { class: 'notice', role: 'note' }, q.demo
      ? 'Use apenas dados de teste. Nenhum email é enviado e nada fica armazenado: ao recarregar a página, a participação recomeça.'
      : 'Seu diagnóstico está pronto! Informe seu nome e email para visualizar a análise completa de precificação e estilo.'),
    q.identification.map(f => h('div', { class: 'field', 'data-field': f.id },
      h('label', { for: `campo-${f.id}` }, f.label, f.required ? '' : ' (opcional)'),
      h('input', { id: `campo-${f.id}`, name: f.id, type: f.type, required: f.required, autocomplete: 'off', spellcheck: 'false', value: s.identification[f.id] ?? '' }))),
    actions(handlers, 'Ver diagnóstico completo'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const values: Answers = {};
    for (const f of q.identification) values[f.id] = String(new FormData(form).get(f.id) ?? '').trim();
    s.identification = values;
    const errors = identificationErrors(q, values);
    if (Object.keys(errors).length) showErrors(form, errors); else handlers.next();
  });
  return h('section', { class: 'card' },
    h('h2', { id: 'titulo-etapa', tabindex: -1 }, 'Quase lá! Para quem geramos o resultado?'),
    form);
}

function renderOptionItem(
  type: 'radio' | 'checkbox',
  question: Question,
  option: Question['options'][number],
  isChecked: boolean,
  onToggle: (checked: boolean) => void
) {
  const inputId = `opcao-${question.id}-${option.id}`;
  const variant = question.variant ?? 'standard';

  const inputEl = h('input', {
    type,
    id: inputId,
    name: question.id,
    value: option.id,
    checked: isChecked,
    onchange: (e: Event) => {
      const target = e.target as HTMLInputElement;
      onToggle(target.checked);
    }
  });

  if (variant === 'cards') {
    return h('div', { class: `option-card ${isChecked ? 'checked' : ''}` },
      inputEl,
      h('label', { for: inputId, class: 'option-card-content' },
        h('div', { class: 'option-card-header' },
          option.icon ? h('span', { class: 'option-icon', 'aria-hidden': 'true' }, option.icon) : null,
          h('span', { class: 'option-title' }, option.label),
          option.badge ? h('span', { class: 'option-badge' }, option.badge) : null),
        option.description ? h('span', { class: 'option-desc' }, option.description) : null));
  }

  if (variant === 'chips') {
    return h('div', { class: `option-chip ${isChecked ? 'checked' : ''}` },
      inputEl,
      h('label', { for: inputId, class: 'chip-content' },
        option.icon ? h('span', { class: 'chip-icon', 'aria-hidden': 'true' }, option.icon) : null,
        h('span', { class: 'chip-label' }, option.label)));
  }

  if (variant === 'segmented') {
    return h('div', { class: `option-segment ${isChecked ? 'checked' : ''}` },
      inputEl,
      h('label', { for: inputId, class: 'segment-content' },
        option.icon ? h('span', { class: 'segment-icon', 'aria-hidden': 'true' }, option.icon) : null,
        h('span', { class: 'segment-label' }, option.label)));
  }

  // standard option
  return h('div', { class: 'option' },
    inputEl,
    h('label', { for: inputId },
      option.icon ? `${option.icon} ` : '',
      option.label,
      option.badge ? h('span', { class: 'option-badge-inline' }, ` (${option.badge})`) : null));
}

function multiChoiceQuestion(s: Session, b: Question, onChange?: () => void) {
  const legendId = `pergunta-${b.id}`;
  const selected = new Set(parseMultiChoice(s.answers[b.id]));
  const variant = b.variant ?? 'standard';
  const columnsClass = b.columns ? `columns-${b.columns}` : (variant === 'cards' ? 'columns-2' : '');
  const mbClass = b.marginBottom ? `mb-${b.marginBottom}` : '';

  return h('fieldset', { class: `field question multi-choice variant-${variant} ${mbClass}`.trim(), 'data-field': b.id },
    h('legend', { id: legendId },
      b.icon ? h('span', { class: 'question-icon', 'aria-hidden': 'true' }, `${b.icon} `) : null,
      b.label,
      b.required ? '' : ' (opcional)'),
    b.helpText ? h('p', { class: 'field-hint' }, b.helpText) : null,
    h('div', { class: `options options-${variant} ${columnsClass}`.trim() },
      b.options.map(o => renderOptionItem('checkbox', b, o, selected.has(o.id), (checked) => {
        const current = new Set(parseMultiChoice(s.answers[b.id]));
        if (checked) current.add(o.id);
        else current.delete(o.id);
        setAnswer(s, b.id, serializeMultiChoice([...current]));
        onChange?.();
      }))));
}

const PROCEDURE_META: Record<string, { title: string; icon: string; badge: string }> = {
  tradicional: { title: 'Manicure Tradicional', icon: '💅', badge: 'Avulso' },
  gel: { title: 'Esmaltação em Gel / Blindagem', icon: '💎', badge: 'Avulso' },
  alongamento: { title: 'Alongamento Completo (Gel / Fibra)', icon: '✨', badge: 'Avulso' },
  manutencao: { title: 'Manutenção de Alongamento', icon: '🔄', badge: 'Avulso' },
  remocao: { title: 'Remoção de Produto / Gel', icon: '🧴', badge: 'Adicional' },
  'nail-art': { title: 'Nail Art / Decoração Elaborada', icon: '🎨', badge: 'Adicional' },
  'combo-alongamento-arte': { title: 'Combo Alongamento + Nail Art', icon: '📦', badge: 'Pacote / Combo' },
  combo: { title: 'Combo / Pacote Promocional', icon: '📦', badge: 'Pacote / Combo' },
  outro: { title: 'Outro Procedimento Personalizado', icon: '🏷️', badge: 'Personalizado' },
};

function renderLabel(b: Question) {
  const parts = b.label.split(': ');
  if (parts.length > 1) {
    return [
      h('span', { class: 'sr-only' }, parts[0] + ': '),
      parts.slice(1).join(': '),
      b.required ? '' : ' (opcional)'
    ];
  }
  return [b.label, b.required ? '' : ' (opcional)'];
}

function numberQuestion(s: Session, b: Question, onChange?: () => void) {
  const mbClass = b.marginBottom ? `mb-${b.marginBottom}` : '';
  return h('div', { class: `field field-number ${b.variant ? `variant-${b.variant}` : ''} ${mbClass}`.trim(), 'data-field': b.id },
    h('label', { for: `campo-${b.id}` },
      b.icon ? h('span', { class: 'field-icon', 'aria-hidden': 'true' }, `${b.icon} `) : null,
      ...renderLabel(b)),
    b.helpText ? h('p', { class: 'field-hint' }, b.helpText) : null,
    h('div', { class: 'input-with-unit' },
      h('input', {
        id: `campo-${b.id}`,
        name: b.id,
        type: 'text',
        inputmode: 'decimal',
        required: b.required,
        autocomplete: 'off',
        placeholder: b.placeholder ?? '0',
        value: s.answers[b.id] ?? '',
        oninput: (e: Event) => {
          setAnswer(s, b.id, (e.target as HTMLInputElement).value);
          onChange?.();
        }
      }),
      b.unit ? h('span', { class: 'unit-label' }, b.unit) : null));
}

function textQuestion(s: Session, b: Question, onChange?: () => void) {
  const mbClass = b.marginBottom ? `mb-${b.marginBottom}` : '';
  return h('div', { class: `field field-text ${b.variant ? `variant-${b.variant}` : ''} ${mbClass}`.trim(), 'data-field': b.id },
    h('label', { for: `campo-${b.id}` },
      b.icon ? h('span', { class: 'field-icon', 'aria-hidden': 'true' }, `${b.icon} `) : null,
      ...renderLabel(b)),
    b.helpText ? h('p', { class: 'field-hint' }, b.helpText) : null,
    h('input', {
      id: `campo-${b.id}`,
      name: b.id,
      type: 'text',
      required: b.required,
      autocomplete: 'off',
      placeholder: b.placeholder ?? '',
      value: s.answers[b.id] ?? '',
      oninput: (e: Event) => {
        setAnswer(s, b.id, (e.target as HTMLInputElement).value);
        onChange?.();
      }
    }));
}

function moneyQuestion(s: Session, b: Question, onChange?: () => void) {
  const prefix = b.prefix ?? 'R$';
  const mbClass = b.marginBottom ? `mb-${b.marginBottom}` : '';
  const isUnknown = isUnknownAnswer(s.answers[b.id]);

  const defaultPlaceholder = prefix === 'R$' ? 'Ex.: 19,90' : '0,00';
  const placeholder = isUnknown ? 'Não sei' : (b.placeholder ?? defaultPlaceholder);

  const inputEl = h('input', {
    id: `campo-${b.id}`,
    name: b.id,
    type: 'text',
    inputmode: isUnknown ? 'text' : 'decimal',
    required: b.required,
    autocomplete: 'off',
    placeholder,
    value: isUnknown ? 'Não sei' : (s.answers[b.id] ?? ''),
    oninput: (event: Event) => {
      setAnswer(s, b.id, (event.target as HTMLInputElement).value);
      onChange?.();
    }
  });

  const unknownBtn = b.allowUnknown
    ? h('button', {
        type: 'button',
        class: `unknown-toggle ${isUnknown ? 'active' : ''}`,
        onclick: () => {
          if (isUnknown) {
            setAnswer(s, b.id, '');
          } else {
            setAnswer(s, b.id, 'nao-sei');
          }
          onChange?.();
        }
      }, isUnknown ? 'Informar valor' : 'Não sei')
    : null;

  const clarityMessage = b.allowUnknown || !b.required
    ? 'Valor exato ou sua melhor estimativa. Se não souber, use o botão "Não sei" ou deixe em branco (não será considerado zero no cálculo).'
    : 'Valor exato ou sua melhor estimativa (ex.: 19,90).';

  return h('div', { class: `field field-money ${b.variant ? `variant-${b.variant}` : ''} ${mbClass}`.trim(), 'data-field': b.id },
    h('label', { for: `campo-${b.id}` },
      b.icon ? h('span', { class: 'field-icon', 'aria-hidden': 'true' }, `${b.icon} `) : null,
      ...renderLabel(b)),
    b.helpText ? h('p', { class: 'field-hint' }, b.helpText) : null,
    h('div', { class: 'input-with-prefix' },
      h('span', { class: 'prefix-symbol', 'aria-hidden': 'true' }, prefix),
      inputEl,
      unknownBtn),
    h('p', { class: `field-money-clarity ${b.allowUnknown ? 'has-unknown' : ''}` }, clarityMessage));
}

function choiceQuestion(s: Session, b: Question, onChange?: () => void) {
  const legendId = `pergunta-${b.id}`;
  const variant = b.variant ?? 'standard';
  const columnsClass = b.columns ? `columns-${b.columns}` : (variant === 'cards' ? 'columns-2' : '');
  const mbClass = b.marginBottom ? `mb-${b.marginBottom}` : '';

  return h('fieldset', { class: `field question choice variant-${variant} ${mbClass}`.trim(), 'data-field': b.id },
    h('legend', { id: legendId },
      b.icon ? h('span', { class: 'question-icon', 'aria-hidden': 'true' }, `${b.icon} `) : null,
      b.label,
      b.required ? '' : ' (opcional)'),
    b.helpText ? h('p', { class: 'field-hint' }, b.helpText) : null,
    h('div', { class: `options options-${variant} ${columnsClass}`.trim() },
      b.options.map(o => renderOptionItem('radio', b, o, s.answers[b.id] === o.id, () => {
        setAnswer(s, b.id, o.id);
        onChange?.();
      }))));
}

function renderTextBlock(b: import('../core/schema').Quiz['pages'][number]['blocks'][number] & { type: 'text' }) {
  const variant = b.variant ?? (b.text.includes('custo de materiais') || b.text.includes('Dica') ? 'tip' : 'standard');
  const mbClass = b.marginBottom ? `mb-${b.marginBottom}` : '';
  if (variant === 'standard') {
    return h('p', { class: `block-text ${mbClass}`.trim() }, b.text);
  }
  if (variant === 'lead') {
    return h('p', { class: `block-text block-lead ${mbClass}`.trim() }, b.text);
  }
  const defaultIcons: Record<string, string> = {
    tip: '💡',
    warning: '⚠️',
    info: '📌',
    highlight: '✨',
  };
  const icon = b.icon ?? defaultIcons[variant] ?? '💡';
  const defaultTitles: Record<string, string> = {
    tip: 'Dica importante de precificação (Metodologia Sebrae)',
    warning: 'Atenção aos detalhes operacionais',
    info: 'Informação importante',
    highlight: 'Destaque estratégico',
  };
  const title = b.title ?? defaultTitles[variant] ?? '';

  return h('aside', { class: `callout-banner callout-${variant} ${mbClass}`.trim(), role: 'note', 'aria-label': title || variant },
    h('span', { class: 'callout-icon', 'aria-hidden': 'true' }, icon),
    h('div', { class: 'callout-content' },
      title ? h('strong', { class: 'callout-title' }, title) : null,
      h('p', {}, b.text)));
}

type BlockItem = import('../core/schema').Quiz['pages'][number]['blocks'][number];
type GroupMeta = {
  groupKey: string;
  groupTitle?: string;
  groupIcon?: string;
  groupBadge?: string;
  condition?: BlockItem['condition'];
};
type GroupedBlock =
  | { kind: 'single'; block: BlockItem }
  | { kind: 'group'; meta: GroupMeta; blocks: Question[] };

function groupBlocks(blocks: BlockItem[]): GroupedBlock[] {
  const groups: GroupedBlock[] = [];
  let currentGroup: { meta: GroupMeta; blocks: Question[] } | null = null;

  for (const b of blocks) {
    let key: string | null = null;
    let title: string | undefined = undefined;
    let icon: string | undefined = undefined;
    let badge: string | undefined = undefined;

    if (b.type === 'question') {
      if (b.group) {
        key = b.group;
        title = b.groupTitle;
        icon = b.groupIcon;
        badge = b.groupBadge;
      } else if (b.condition?.questionId === 'servicos' && typeof b.condition.includes === 'string') {
        key = b.condition.includes;
      }
    }

    if (key !== null && b.type === 'question') {
      if (currentGroup && currentGroup.meta.groupKey === key) {
        currentGroup.blocks.push(b);
      } else {
        if (currentGroup) groups.push({ kind: 'group', ...currentGroup });
        currentGroup = {
          meta: { groupKey: key, groupTitle: title, groupIcon: icon, groupBadge: badge, condition: b.condition },
          blocks: [b]
        };
      }
    } else {
      if (currentGroup) {
        groups.push({ kind: 'group', ...currentGroup });
        currentGroup = null;
      }
      groups.push({ kind: 'single', block: b });
    }
  }
  if (currentGroup) groups.push({ kind: 'group', ...currentGroup });

  return groups;
}

export function renderPage(s: Session, handlers: FormHandlers) {
  const q = s.snapshot, page = q.pages[s.pageIndex], last = s.pageIndex === q.pages.length - 1;
  const general = h('p', { class: 'field-error', role: 'alert', hidden: true });

  const visibilityItems: { condition?: BlockItem['condition']; element: HTMLElement }[] = [];
  const marginUpdaters: (() => void)[] = [];

  const updateVisibility = () => {
    for (const item of visibilityItems) {
      const visible = isConditionMet(item.condition, s.answers);
      item.element.hidden = !visible;
    }
    for (const updater of marginUpdaters) {
      updater();
    }
  };

  const renderSingleQuestion = (b: Question): HTMLElement => {
    switch (b.input) {
      case 'multi-choice': return multiChoiceQuestion(s, b, updateVisibility) as HTMLElement;
      case 'number': return numberQuestion(s, b, updateVisibility) as HTMLElement;
      case 'text': return textQuestion(s, b, updateVisibility) as HTMLElement;
      case 'money': return moneyQuestion(s, b, updateVisibility) as HTMLElement;
      default: return choiceQuestion(s, b, updateVisibility) as HTMLElement;
    }
  };

  const grouped = groupBlocks(page.blocks);

  const formChildren = grouped.map(group => {
    if (group.kind === 'single') {
      const b = group.block;
      let el: HTMLElement;
      if (b.type === 'text') {
        el = renderTextBlock(b) as HTMLElement;
      } else {
        el = renderSingleQuestion(b);
      }
      el.hidden = !isConditionMet(b.condition, s.answers);
      visibilityItems.push({ condition: b.condition, element: el });
      return el;
    }

    // Group / Procedure card
    const groupKey = group.meta.groupKey;
    const isProcedure = PROCEDURE_META[groupKey] !== undefined || group.blocks.some(b => b.id.startsWith('preco-'));
    const meta = {
      title: group.meta.groupTitle ?? PROCEDURE_META[groupKey]?.title ?? (groupKey.charAt(0).toUpperCase() + groupKey.slice(1)),
      icon: group.meta.groupIcon ?? PROCEDURE_META[groupKey]?.icon ?? '📋',
      badge: group.meta.groupBadge ?? PROCEDURE_META[groupKey]?.badge
    };

    if (groupKey === 'outro' && s.answers['outro-nome']) {
      meta.title = s.answers['outro-nome'];
    }

    const fieldElements = group.blocks.map(b => renderSingleQuestion(b));
    const priceBlock = group.blocks.find(b => b.input === 'money' && b.id.startsWith('preco-'));
    const matBlock = group.blocks.find(b => b.input === 'money' && b.id.startsWith('material-'));

    let footer: HTMLElement | null = null;
    if (priceBlock && matBlock) {
      footer = h('div', { class: 'procedure-footer', 'data-margin-for': groupKey }) as HTMLElement;
      const updateMargin = () => {
        const rawPrice = s.answers[priceBlock.id];
        const rawMaterial = s.answers[matBlock.id];
        const priceStr = normalizeMoney(rawPrice);
        const materialStr = normalizeMoney(rawMaterial);

        footer!.replaceChildren();

        if (priceStr === null) {
          footer!.appendChild(h('div', { class: 'margin-badge margin-empty' },
            h('span', { class: 'badge-icon', 'aria-hidden': 'true' }, '💡'),
            h('div', { class: 'margin-details' },
              h('span', { class: 'badge-text' }, 'Preencha o preço e o custo de material para calcular a margem bruta deste serviço.'))));
          return;
        }

        const price = Number(priceStr);
        const matCost = materialStr !== null ? Number(materialStr) : 0;
        const margin = price - matCost;
        const marginPercent = price > 0 ? (margin / price) * 100 : 0;

        if (margin > 0) {
          footer!.appendChild(h('div', { class: 'margin-badge margin-positive', role: 'status' },
            h('span', { class: 'badge-icon', 'aria-hidden': 'true' }, '🟢'),
            h('div', { class: 'margin-details' },
              h('span', { class: 'badge-text' },
                'Margem bruta por atendimento: ',
                h('strong', {}, money(margin.toFixed(2))),
                ` (${marginPercent.toFixed(0)}% do preço cobrado)`),
              h('span', { class: 'badge-sub' }, 'Valor líquido que sobra após pagar os insumos para cobrir custos fixos e gerar seu lucro.'))));
        } else {
          footer!.appendChild(h('div', { class: 'margin-badge margin-negative', role: 'alert' },
            h('span', { class: 'badge-icon', 'aria-hidden': 'true' }, '⚠️'),
            h('div', { class: 'margin-details' },
              h('span', { class: 'badge-text' },
                'Alerta de prejuízo direto: o custo de material (',
                h('strong', {}, money(matCost.toFixed(2))),
                ') supera ou iguala o preço cobrado (',
                h('strong', {}, money(price.toFixed(2))),
                ')!'),
              h('span', { class: 'badge-sub' }, 'Cada atendimento realizado neste valor consome o seu próprio dinheiro.'))));
        }
      };
      marginUpdaters.push(updateMargin);
    }

    const card = h('section', {
      class: `form-group-card ${isProcedure ? 'procedure-card' : ''}`,
      'data-group': groupKey,
      'aria-labelledby': `group-title-${groupKey}`
    },
      h('header', { class: 'group-header procedure-header' },
        h('div', { class: 'group-title-wrap procedure-title-wrap' },
          h('span', { class: 'group-icon procedure-icon', 'aria-hidden': 'true' }, meta.icon),
          h('h3', { id: `group-title-${groupKey}`, class: 'group-name procedure-name' }, meta.title)),
        meta.badge ? h('span', { class: 'group-badge procedure-badge' }, meta.badge) : null),
      h('div', { class: 'group-grid procedure-grid' }, fieldElements),
      footer) as HTMLElement;

    card.hidden = !isConditionMet(group.meta.condition, s.answers);
    visibilityItems.push({ condition: group.meta.condition, element: card });
    return card;
  });

  const form = h('form', { novalidate: true, 'aria-labelledby': 'titulo-etapa' },
    formChildren,
    general,
    actions(handlers, last ? 'Ver prévia' : 'Continuar'));

  // Run once to initialize states and margin indicators
  updateVisibility();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = pageErrors(q, s.pageIndex, s.answers);
    if (Object.keys(errors).length) return showErrors(form, errors);
    try { handlers.next(); } catch {
      general.hidden = false;
      general.textContent = 'Não foi possível calcular a prévia. Revise as respostas das páginas anteriores.';
    }
  });

  return h('section', { class: `card layout-${page.layout ?? 'standard'}` },
    h('div', { class: 'card-header-bar' },
      h('p', { class: 'progress' }, `Página ${s.pageIndex + 1} de ${q.pages.length}`),
      page.badge ? h('span', { class: 'page-badge' }, page.badge) : null),
    h('progress', { max: q.pages.length, value: s.pageIndex + 1, 'aria-hidden': 'true' }),
    h('h2', { id: 'titulo-etapa', tabindex: -1 }, page.title),
    page.subtitle ? h('p', { class: 'page-subtitle' }, page.subtitle) : null,
    seal(q.demo),
    form);
}
