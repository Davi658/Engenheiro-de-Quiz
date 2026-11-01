// Minimal DOM builder. All content is inserted as text nodes; quiz definitions never reach innerHTML.
type Attrs = Record<string, string | boolean | number | undefined | ((e: Event) => void)>;
export type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (typeof value === 'function') el.addEventListener(key.replace(/^on/, '').toLowerCase(), value);
    else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

/** Badge or methodology disclaimer based on demo mode. */
export const seal = (demo: boolean = true) =>
  demo
    ? h('p', { class: 'seal', role: 'note' }, 'Simulação com valores fictícios')
    : h('p', { class: 'methodology-badge', role: 'note' }, '✓ Metodologia técnica baseada em custos reais de insumos e tempo de mesa');


