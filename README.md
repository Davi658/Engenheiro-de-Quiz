# Engenheiro de Quizzes

Projeto de Davi Diniz para executar quizzes web a partir de definições próprias, apresentar uma prévia e oferecer relatórios completos pagos, entregues por email.

## Documentação inicial

- [Visão do produto](docs/visao-do-produto.md)
- [Proposta de princípios](docs/principios-propostos.md)
- [Escopo da primeira entrega](docs/primeira-entrega.md)
- [Quiz piloto de beleza](docs/quiz-beleza.md)

Spec Kit 1.2.5 instalado localmente com Python 3.14 e integração Codex. Constituição e especificação foram redigidas pelo agente seguindo as skills e os modelos instalados. A aplicação ainda não foi implementada.

- [Constituição v1.0.0](.specify/memory/constitution.md)
- [Especificação da primeira funcionalidade](specs/001-quiz-configuravel/spec.md)
- [Roteiro e regras fictícias do piloto](docs/roteiro-quiz-piloto.md)
- [Revisão dos requisitos](specs/001-quiz-configuravel/checklists/requirements.md)

Para conferir a instalação no PowerShell: `.\.spec-kit-venv\Scripts\specify.exe version`.
As skills foram instaladas em `.agents/skills`. O planejamento está em [plan.md](specs/001-quiz-configuravel/plan.md), com [24 tarefas](specs/001-quiz-configuravel/tasks.md). A próxima etapa de desenvolvimento é `$speckit-implement`, após conferir a análise de consistência.

## Próximos passos

1. Planejar tecnologias, arquitetura e formato das definições para a especificação atual.
2. Gerar tarefas e analisar a coerência entre especificação, plano e tarefas.
3. Implementar e verificar os critérios de aceitação.

Para o protótipo: HTML/CSS, TypeScript, Vite, configurações JSON e estado em memória. Gateway, hospedagem comercial e armazenamento de dados reais continuam pendentes para etapas futuras. [Pesquisa e justificativas](specs/001-quiz-configuravel/research.md).
