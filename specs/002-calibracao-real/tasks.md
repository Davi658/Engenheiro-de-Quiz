# Tasks: Calibração Real de Custos, Comparativo e Refinamento do Quiz de Beleza

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

