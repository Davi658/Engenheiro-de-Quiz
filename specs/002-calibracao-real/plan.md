# Implementation Plan: Calibração Real de Custos, Comparativo e Refinamento do Quiz de Beleza

**Branch**: `main` (Feature `002-calibracao-real`) | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)

## Summary

Evoluir o modelo de dados e o motor de cálculo (`pricing-v1`/`pricing-v2`) para incorporar a pergunta de **Preço Praticado pela Profissional**, permitindo calcular o **diagnóstico comparativo real**: ganho líquido real, margem alcançada e veredito financeiro (prejuízo, sub-remuneração ou lucro saudável). Atualizar o quiz `data/beleza-unhas/quiz.json` com custos reais de insumos/produtos, vocabulário autêntico de salão/mesa e desativação do selo demonstrativo (`demo: false`), exibindo a metodologia transparente.

## Technical Context

- **Linguagem**: TypeScript strict (Node 24 LTS).
- **Dependências**: Vite 8.3, Zod 4, Decimal.js, Vitest 5, Playwright.
- **Armazenamento**: Somente em memória na sessão ativa.
- **Acessibilidade**: WCAG AA, navegação por teclado, 360px sem overflow horizontal.
- **Compatibilidade**: Manter o quiz `preferencia-atendimento` intacto e sem regressões no motor genérico.

## Constitution Check

- **I. Motor configurável**: As regras continuam declarativas no JSON do quiz, permitindo que outros quizzes no futuro usem ou não comparação de preço praticado.
- **II. Definições verificáveis**: Validação via Zod e semântica continua bloqueando configurações com referências ausentes ou números negativos.
- **III. Versionamento**: O quiz de beleza avança para versão `2.0.0` (por ser uma mudança significativa de dados e perguntas).
- **IV. Privacidade**: Nenhum dado pessoal ou resposta é enviado a terceiros ou salvo em storage.
- **VII. Acessibilidade**: Operação por teclado e texto equivalente para o diagnóstico comparativo (sem depender exclusivamente de cores vermelho/verde).
- **IX. Estimativas explícitas**: Transparência na metodologia de cálculo por tempo de mesa e insumos.

## Project Structure

```text
data/
└── beleza-unhas/quiz.json            # Atualizado para v2.0.0 com dados reais e pergunta de preço praticado
Engine/
├── core/
│   ├── schema.ts                    # Suporte a demo: boolean e campos comparativos opcionais no pricing
│   ├── pricing.ts                   # Cálculo de comparação de preço praticado, breakEven e ganho líquido
│   ├── evaluate.ts                  # Inclusão do diagnóstico comparativo no resultado
│   └── validate.ts                  # Validação semântica das novas chaves opcionais
├── ui/
│   ├── dom.ts                       # Banner de metodologia real quando demo: false
│   ├── preview.ts                   # Card de diagnóstico comparativo: Preço Atual vs. Mínimo Sustentável
│   └── report.ts                    # Relatório aprofundando o ganho real por hora trabalhada
tests/
├── unit/
│   ├── evaluation.test.ts           # Testes unitários do diagnóstico comparativo
│   └── validation.test.ts           # Teste de validação do novo schema/regras
└── e2e/
    └── journey.spec.ts              # Validação E2E do fluxo com preço praticado
```
