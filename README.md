# Engenheiro de Quizzes

Projeto de Davi Diniz para executar quizzes web a partir de definições próprias, apresentar uma prévia e oferecer relatórios completos pagos, entregues por email.

## Documentação inicial

- [Visão do produto](docs/visao-do-produto.md)
- [Proposta de princípios](docs/principios-propostos.md)
- [Escopo da primeira entrega](docs/primeira-entrega.md)
- [Quiz piloto de beleza](docs/quiz-beleza.md)

Spec Kit 1.2.5 instalado localmente com Python 3.14 e integração Codex. Constituição e especificação foram redigidas seguindo as skills e os modelos instalados. O protótipo está implementado. O piloto de unhas 3.0.0 aceita preço exato e compara com custos fictícios de referência; os resultados não são diagnósticos financeiros reais. Consulte o relatório de validação para as verificações e limitações atuais.

- [Constituição v1.0.0](.specify/memory/constitution.md)
- [Especificação da primeira funcionalidade](specs/001-quiz-configuravel/spec.md)
- [Plano de implementação](specs/001-quiz-configuravel/plan.md)
- [Tarefas de desenvolvimento](specs/001-quiz-configuravel/tasks.md)
- [Guia rápido de execução](specs/001-quiz-configuravel/quickstart.md)
- [Relatório de validação da primeira entrega](docs/validacao-primeira-entrega.md)
- [Como adicionar um quiz](data/README.md)

## Como rodar o projeto

Pré-requisitos: Node 24 LTS e npm.

```bash
# Instalar dependências
npm ci

# Validar configurações de quizzes
npm run validate:quizzes

# Checagem estática de tipos
npm run typecheck

# Executar testes unitários (Vitest)
npm test

# Executar testes ponta a ponta (Playwright)
npm run test:e2e

# Build de produção
npm run build

# Iniciar servidor de desenvolvimento local
npm run dev
```

Acesse no navegador: `http://127.0.0.1:5173` ou diretamente `http://127.0.0.1:5173/?quiz=beleza-unhas`.

## Próximos passos

1. Implementar backend e gateway de pagamento em etapas futuras.
2. Armazenamento de dados reais e entrega por email.

Especificação ativa: [comparação de preço](specs/002-calibracao-real/spec.md). Correções de precisão e resultado por hora: [decisões](specs/002-calibracao-real/correcoes-2026-11-02.md).
