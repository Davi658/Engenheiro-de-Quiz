# Tasks: Calibração Real de Custos, Comparativo e Refinamento do Quiz de Beleza

As tarefas históricas abaixo descrevem a versão 2.0.0. A revisão de 2026-11-02 identificou falhas; as tarefas corretivas T015–T019 e correcoes-2026-11-02.md prevalecem sobre afirmações anteriores de custos reais.

**Feature**: `002-calibracao-real`  
**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md)

## Phase 1: Core Engine & Data Model

- [X] T001 Estender `Engine/core/schema.ts` para permitir `demo: boolean` (não apenas `true`), e no schema de pricing suportar opcionalmente `actualPriceQuestion` e `actualPriceKey`.
- [X] T002 Estender `Engine/core/pricing.ts` com função `evaluateActualPrice(actualPrice, cost, feeRate, breakEvenCost)` para calcular: ganho líquido real, margem efetiva atual e veredito (`loss`, `sub_target`, `healthy`).
- [X] T003 Atualizar `Engine/core/evaluate.ts` para integrar o diagnóstico comparativo quando a pergunta de preço praticado for configurada.
- [X] T004 Atualizar `Engine/core/validate.ts` para validar `actualPriceQuestion` e referências métricas quando presentes.

## Phase 2: Testes Unitários

- [X] T005 Adicionar testes em `tests/unit/evaluation.test.ts` cobrindo os 3 vereditos de preço praticado:
  - Preço cobrado abaixo do custo (prejuízo/pagando para trabalhar).
  - Preço cobrado acima do custo básico mas abaixo da remuneração-alvo (sub-remuneração).
  - Preço cobrado saudável (lucro com remuneração integral).
- [X] T006 Adicionar testes em `tests/unit/validation.test.ts` para validar quizzes com `demo: false` e configurações de preço praticado válidas e inválidas.

## Phase 3: Atualização do Conteúdo do Quiz de Beleza

- [X] T007 Atualizar `data/beleza-unhas/quiz.json` para versão `2.0.0`:
  - `demo: false`.
  - Vocabulário autêntico de nail design (cutilagem profissional, tempo de mesa, esmaltação em gel e alongamento com insumos reais).
  - Nova pergunta de referência: "Quanto você costuma cobrar hoje por esse atendimento?".
  - Custos reais de materiais calibrados por serviço.

## Phase 4: Interface & Experiência Visual

- [X] T008 Atualizar `Engine/ui/dom.ts`: exibir banner de metodologia real e transparente quando `demo: false` (removendo selo de "valores fictícios").
- [X] T009 Atualizar `Engine/ui/preview.ts`: renderizar card destacado de **Diagnóstico Financeiro do seu Preço Atual**:
  - Comparativo: [Você cobra] vs. [Seu custo real] vs. [Preço ideal].
  - Alerta amigável e orientativo caso o preço atual não cubra o tempo de mesa ou insumos.
- [X] T010 Atualizar `Engine/ui/report.ts` para incluir a análise comparativa detalhada do preço atual e o ganho líquido real gerado por hora.
- [X] T011 Ajustar estilos em `Engine/styles.css` para a apresentação do diagnóstico comparativo mantendo WCAG AA e layout sem quebras em 360px.

## Phase 5: Validação E2E e Documentação

- [X] T012 Atualizar e rodar suíte E2E (`tests/e2e/journey.spec.ts`) para cobrir a nova pergunta de preço praticado e exibição do diagnóstico comparativo.
- [X] T013 Executar `npm run validate:quizzes`, `npm run typecheck`, `npm test` e `npm run test:e2e`.
- [X] T014 Atualizar documentação e registrar evidências da entrega.

## Correções da revisão de 2026-11-02

- [X] T015 Corrigir .specify/feature.json e alinhar especificação/plano às estimativas de referência.
- [X] T016 Implementar preço exato em Engine/core/schema.ts, validate.ts, evaluate.ts, session.ts e Engine/ui/form.ts; atualizar data/beleza-unhas/quiz.json e testes.
- [X] T017 Distinguir equilíbrio em Engine/core/pricing.ts e testar os limites dos quatro estados.
- [X] T018 Incluir resultado estimado por hora e ressalvas claras em Engine/ui/preview.ts, report.ts e dom.ts; verificar duração zero.
- [X] T019 Executar unitários, tipos, build e E2E; atualizar docs/validacao-primeira-entrega.md e documentação de autoria com evidências reais.


Validação das correções: 70 testes unitários, build e tipos aprovados; 20 E2E na execução integral e o teste adicional aprovado isoladamente após ajuste de expectativa de formatação. Evidências em docs/validacao-primeira-entrega.md.
