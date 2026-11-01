# Pesquisa e decisões — 2026-11-01

Decisão: TypeScript strict + Vite vanilla, Zod 4 e decimal.js, Vitest e Playwright. Node 24 LTS já disponível. Fixar versões exatas compatíveis no lockfile durante implementação; nenhuma instalação de dependências nesta etapa.

Motivo: formulários e resultados pequenos não requerem framework de componentes. Zod valida runtime e infere tipos; decimal.js fornece precisão e arredondamento explícitos. Alternativas: React adicionaria estrutura sem necessidade atual; Ajv/JSON Schema seria interessante para múltiplas linguagens; centavos inteiros exigiriam cuidado adicional em divisão por duração/margem.

Fontes oficiais pesquisadas:
- [Vite](https://vite.dev/guide/) — vanilla-ts e requisitos de Node; [versões](https://vite.dev/releases) — linha 8.3 na consulta.
- [Vitest](https://vitest.dev/guide/migration/) — versão 5 requer Vite >=6.4 e Node >=22.12.
- [Node](https://nodejs.org/en/about/previous-releases) — Node 24 LTS.
- [Zod](https://zod.dev/) — TypeScript >=5.5 e strict.
- [decimal.js](https://mikemcl.github.io/decimal.js/) — precisão e ROUND_CEIL.
- [Playwright](https://playwright.dev/docs/intro) — Windows 11+, Server 2019+, WSL e Linux suportados; não Windows 10 deste computador.

Decisão: JSON em data/<slug>/quiz.json, texto simples e temas limitados. Descoberta automática no build. Alternativas YAML/Markdown e CSS livre ampliam parsers e superfície de validação sem requisito nesta entrega. Regras por soma de contribuições e tabela categórica, sem eval ou expressões executáveis.

Decisão: somente memória de sessão e URLs por query string. Evita banco e regras de reescrita de hospedagem estática; recarregar reinicia. Banco, backend e integrações ficam para dados reais e monetização. Toda configuração do protótipo é pública; nenhum segredo será incluído.

Decisão: testes unitários/build locais; E2E em Ubuntu 24.04 ou plataforma oficialmente suportada. Configurar workflow para futuro repositório remoto, sem presumir serviço já conectado. Se ambiente E2E indisponível, registrar pendência em vez de declarar aprovação. Inspeção manual é complementar.

Não há dúvida técnica bloqueante para o desenho. Disponibilidade de ambiente E2E deve ser conferida durante implementação.
