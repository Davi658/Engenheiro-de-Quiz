# Plano de Implementação: Diagnóstico de Precificação e Saúde do Negócio para Nail Designers

## 1. Visão Geral da Arquitetura

O projeto adota uma arquitetura declarativa orientada a dados em TypeScript puro, com validação de esquema via Zod, aritmética de alta precisão via `Decimal.js`, testes unitários via Vitest e testes de ponta a ponta via Playwright.

### Princípios de Extensão do Motor (`Engine/`)
1. **Compatibilidade Regressiva**: Preservar o suporte existente a `schemaVersion: 1` e `schemaVersion: 2` (`pricing-v1` e `category-table-v1`).
2. **Novo Tipo de Diagnóstico**: Introduzir `schemaVersion: 3` (e/ou `kind: 'business-diagnosis-v1'`), permitindo o diagnóstico completo com 9 etapas sem quebrar os quizzes anteriores.
3. **Novos Tipos de Entrada no Motor**:
   - `input: 'multi-choice'`: Seleção de múltiplas opções com identificadores estáveis.
   - `input: 'number'`: Campo numérico com unidade (ex.: minutos, horas, atendimentos, %).
   - `input: 'money'`: Campo monetário em R$ com validação estrita.
   - `input: 'custom-text'`: Campo de texto complementar (ex.: nome de outro serviço).
   - `condition`: Exibição condicional de blocos/perguntas baseada em respostas anteriores.
   - Blocos/seções dinâmicas para grupos repetidos por serviço, despesas com rateio e registros mensais.
4. **Cálculos Determinísticos em `Engine/core/business.ts`**:
   - Módulo isolado e puro para todos os cálculos do diagnóstico do negócio, testável independentemente da UI.
   - Fórmulas do Sebrae para markup divisor e rateio de horas.
   - Tratamento estrito de zero vs. não informado vs. não se aplica.
   - Capacidade, ocupação, ponto de equilíbrio e cenários de 30/60/90 dias.
5. **Apresentação Acessível em `Engine/ui/`**:
   - Componentes modulares para prévia gratuita e relatório completo demonstrativo.
   - Navegação passo a passo com suporte total a teclado e viewport móvel (360px).
   - Sem chamadas de rede externas, persistência em localStorage ou manipulação de URLs sensíveis.

## 2. Estrutura de Arquivos e Módulos

```
Engine/
├── core/
│   ├── schema.ts          # Extensão com schemaVersion: 3, business-diagnosis-v1, multi-choice, number, condition
│   ├── answers.ts         # Normalização e validação de novos tipos de entrada
│   ├── business.ts        # Regras de cálculo determinísticas do diagnóstico de negócio
│   ├── evaluate.ts        # Orquestrador de avaliação conectando business.ts ao resultado
│   ├── validate.ts        # Validação semântica e referencial dos novos blocos e contratos
│   └── presentation.ts    # Resolução de blocos de prévia e relatório para business-diagnosis
└── ui/
    ├── app.ts             # Controlador de rotas e fluxo em memória
    ├── form.ts            # Renderização de formulários com multi-choice, number, condition e repetições
    ├── preview.ts         # Renderização da prévia gratuita para diagnóstico de negócio
    ├── report.ts          # Renderização do relatório completo demonstrativo com planos 30/60/90
    └── styles.css         # Estilização responsiva (360px) e acessível

data/
├── beleza-unhas/
│   └── quiz.json          # Nova configuração v3 com as 9 etapas completas e metodologia Sebrae
└── preferencia-atendimento/
    └── quiz.json          # Mantido intacto para garantir compatibilidade

tests/
├── unit/
│   ├── business.test.ts   # Testes dos cálculos de precificação, combos, capacidade e finanças
│   ├── validation.test.ts # Validação de esquemas e detecção de erros
│   └── authoring.test.ts  # Testes de contrato e compatibilidade retroativa
└── e2e/
    ├── business-journey.spec.ts # Fluxo completo do novo diagnóstico no navegador
    └── accessibility.spec.ts    # Testes de teclado e responsividade a 360px
```

## 3. Estratégia de Verificação

1. **Testes Unitários**:
   - Cálculos com múltiplos serviços e combos (sem dupla contagem).
   - Rateio de despesas operacionais compartilhadas e periodicidade.
   - Capacidade excedida e alerta de subdimensionamento de horas.
   - Pulo de blocos opcionais (finanças pessoais, dívidas, histórico).
   - Validação de entrada inválida (denominadores zero, percentuais > 100%, etc.).
2. **Compatibilidade dos Demais Quizzes**:
   - Execução de `scripts/validate-quizzes.ts` com quizzes v1, v2 e v3.
   - Execução de todos os 80 testes unitários existentes e 21 testes E2E do Playwright.
3. **Fluxo E2E no Navegador**:
   - Preenchimento do início ao fim via teclado e mouse.
   - Redimensionamento para 360px de largura sem overflow horizontal.
   - Retorno a etapas anteriores com preservação e invalidação/recálculo correto de dados.

