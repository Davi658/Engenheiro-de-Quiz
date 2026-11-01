export const fixture = () => ({
 schemaVersion: 1, id: 'teste', version: '1.0.0', title: 'Teste', locale: 'pt-BR', demo: true, theme: 'rose', identification: [],
 pages: [{ id: 'pagina', title: 'Escolha', blocks: [{ type: 'question', id: 'estilo', label: 'Estilo', required: true, options: [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }] }] }],
 result: { kind: 'category-table-v1', questionIds: ['estilo'], rows: [{ answers: { estilo: 'a' }, label: 'A', description: 'Perfil A' }, { answers: { estilo: 'b' }, label: 'B', description: 'Perfil B' }] }
});
