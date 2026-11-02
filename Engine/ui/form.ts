import type { Answers, Question } from '../core/schema';
import { identificationErrors, pageErrors, setAnswer, type Session } from '../core/session';
import { h, seal } from './dom';

export type FormHandlers = { back?: () => void; next: () => void; restart: () => void };

/** Marks invalid fields, links each message with aria-describedby and focuses the first invalid control. */
export function showErrors(form: HTMLFormElement, errors: Answers) {
  form.querySelectorAll('.field-error').forEach(e => e.remove());
  form.querySelectorAll('[aria-invalid]').forEach(e => { e.removeAttribute('aria-invalid'); e.removeAttribute('aria-describedby'); });
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

function question(s: Session, b: Question) {
  if(b.input==='money')return h('div',{class:'field','data-field':b.id},
    h('label',{for:`campo-${b.id}`},b.label),
    h('p',{class:'detail'},'Digite o valor exato em reais, como 20,00. Sem separador de milhar.'),
    h('input',{id:`campo-${b.id}`,name:b.id,type:'text',inputmode:'decimal',required:b.required,autocomplete:'off',value:s.answers[b.id]??'',oninput:(event)=>setAnswer(s,b.id,(event.target as HTMLInputElement).value)}));
  const legendId = `pergunta-${b.id}`;
  return h('fieldset', { class: 'field question', 'data-field': b.id },
    h('legend', { id: legendId }, b.label, b.required ? '' : ' (opcional)'),
    h('div', { class: 'options' }, b.options.map(o => {
      const inputId = `opcao-${b.id}-${o.id}`;
      return h('div', { class: 'option' },
        h('input', { type: 'radio', id: inputId, name: b.id, value: o.id, checked: s.answers[b.id] === o.id, onchange: () => setAnswer(s, b.id, o.id) }),
        h('label', { for: inputId }, o.label));
    })));
}

export function renderPage(s: Session, handlers: FormHandlers) {
  const q = s.snapshot, page = q.pages[s.pageIndex], last = s.pageIndex === q.pages.length - 1;
  const general = h('p', { class: 'field-error', role: 'alert', hidden: true });
  const form = h('form', { novalidate: true, 'aria-labelledby': 'titulo-etapa' },
    page.blocks.map(b => b.type === 'text' ? h('p', { class: 'block-text' }, b.text) : question(s, b)),
    general,
    actions(handlers, last ? 'Ver prévia' : 'Continuar'));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = pageErrors(q, s.pageIndex, s.answers);
    if (Object.keys(errors).length) return showErrors(form, errors);
    try { handlers.next(); } catch {
      general.hidden = false;
      general.textContent = 'Não foi possível calcular a prévia. Revise as respostas das páginas anteriores.';
    }
  });
  return h('section', { class: 'card' },
    h('p', { class: 'progress' }, `Página ${s.pageIndex + 1} de ${q.pages.length}`),
    h('progress', { max: q.pages.length, value: s.pageIndex + 1, 'aria-hidden': 'true' }),
    h('h2', { id: 'titulo-etapa', tabindex: -1 }, page.title),
    seal(q.demo),
    form);
}

