import type { Quiz } from '../core/schema';
import { createSession, finish, type Session } from '../core/session';
import { h } from './dom';
import { renderIdentification, renderPage } from './form';
import { renderPreview } from './preview';
import { renderReport } from './report';

export type Catalog = { quizzes: Map<string, Quiz>; invalid: Set<string> };

/**
 * Single-page controller. State lives only in memory: nothing is written to storage,
 * the URL never carries identification or answers, and reloading restarts the session.
 */
export function mountApp(root: HTMLElement, catalog: Catalog, search: string) {
  const slug = new URLSearchParams(search).get('quiz');
  const shell = (content: Node, theme?: string) => {
    document.documentElement.dataset.theme = theme ?? 'rose';
    root.replaceChildren(
      h('header', { class: 'site-header' }, h('a', { href: './', class: 'brand' }, 'Ateliê de Quizzes')),
      h('main', { id: 'conteudo' }, content),
      h('footer', { class: 'site-footer' }, 'Protótipo demonstrativo: valores fictícios, sem pagamento e sem envio de dados.'));
  };

  if (slug === null) return shell(renderCatalog(catalog));
  const quiz = catalog.quizzes.get(slug);
  if (!quiz) {
    const unavailable = catalog.invalid.has(slug);
    document.title = unavailable ? 'Quiz indisponível' : 'Quiz não encontrado';
    return shell(h('section', { class: 'card' },
      h('h1', {}, unavailable ? 'Quiz indisponível' : 'Quiz não encontrado'),
      h('p', {}, unavailable ? 'Este quiz está temporariamente indisponível. Tente novamente mais tarde.' : 'Não encontramos o quiz solicitado. Confira o endereço ou escolha um quiz disponível.'),
      h('p', {}, h('a', { href: './' }, 'Ver quizzes disponíveis'))));
  }

  document.title = quiz.title;
  let session: Session = start(quiz);
  const render = (focus = true) => {
    shell(h('div', {}, h('h1', { class: 'quiz-title' }, session.snapshot.title), screen()), quiz.theme);
    if (focus) document.getElementById('titulo-etapa')?.focus();
  };
  const restart = () => { session = start(quiz); render(); };
  const toQuestions = (pageIndex: number) => { session.status = 'questions'; session.pageIndex = pageIndex; render(); };
  const toIdentification = () => { session.status = 'identification'; render(); };
  const edit = () => toQuestions(session.snapshot.pages.length - 1);

  function screen(): Node {
    const s = session, q = s.snapshot;
    if (s.status === 'identification') {
      return renderIdentification(s, {
        back: () => toQuestions(q.pages.length - 1),
        next: () => { finish(s); render(); },
        restart,
      });
    }
    if ((s.status === 'preview' || s.status === 'report') && s.result) {
      const canReport = s.result.kind === 'pricing-v1' || s.result.kind === 'business-diagnosis-v1';
      if (s.status === 'report' && canReport)
        return renderReport(s, { back: () => { s.status = 'preview'; render(); }, edit, restart });
      return renderPreview(s, s.result, {
        edit, restart,
        report: canReport ? () => { s.status = 'report'; render(); } : undefined,
      });
    }
    // Any edit clears the result; fall back to the questions until the visitor concludes again.
    s.status = 'questions';
    const first = s.pageIndex === 0;
    const last = s.pageIndex === q.pages.length - 1;
    return renderPage(s, {
      back: first ? undefined : () => toQuestions(s.pageIndex - 1),
      next: () => {
        if (last) {
          if (q.identification.length && Object.keys(s.identification).length === 0) {
            toIdentification();
          } else {
            finish(s);
            render();
          }
        } else {
          toQuestions(s.pageIndex + 1);
        }
      },
      restart,
    });
  }
  render(true);
}

function start(quiz: Quiz): Session {
  const s = createSession(quiz);
  s.status = 'questions';
  return s;
}

function renderCatalog(catalog: Catalog) {
  document.title = 'Ateliê de Quizzes';
  return h('section', { class: 'card' },
    h('h1', {}, 'Escolha um quiz'),
    h('p', { class: 'notice', role: 'note' }, 'Protótipo de demonstração. Use apenas dados de teste; os resultados usam valores fictícios.'),
    h('ul', { class: 'catalog' }, [...catalog.quizzes.values()].map(q =>
      h('li', {}, h('a', { href: `?quiz=${encodeURIComponent(q.id)}` }, q.title)))));
}

