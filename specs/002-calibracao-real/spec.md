# Feature Specification: Calibração Real de Custos, Comparativo e Refinamento do Quiz de Beleza

**Feature**: `002-calibracao-real`  
**Created**: 2026-11-01  
**Status**: Draft  
**Origem**: Decisão de produto de Davi Diniz para transição de valores fictícios para referências reais fornecidas pela própria profissional (Opção B) com enriquecimento visual e de vocabulário.

---

## Objetivo e Escopo

Evoluir o quiz piloto de unhas (`beleza-unhas`) para coletar as referências reais da própria manicure (preço praticado atualmente, horas trabalhadas ou meta de ganhos), combinando com custos reais de insumos/produtos por serviço e apresentando um diagnóstico financeiro de alto valor na prévia e no relatório:
1. Comparar o **Preço Praticado pela Manicure** com o **Custo Real de Atendimento** e o **Preço Mínimo Sustentável**.
2. Identificar se a profissional está tendo lucro real, trabalhando no zero-a-zero ou pagando para trabalhar no serviço escolhido.
3. Substituir os selos e textos de "valores fictícios" por explicações claras de metodologia de precificação por hora de mesa e consumo de insumos.
4. Refinar o vocabulário, termos técnicos do dia a dia e estética visual dos blocos do quiz.

---

## User Scenarios & Testing *(mandatory)*

### US1 — Coleta de Referências da Manicure (P1)
Como manicure/nail designer, quero informar quanto cobro atualmente e meu tempo estimado habitual, para que o sistema compare com meus custos reais de forma personalizada.

**Why this priority**: É a base para sair de uma simulação fictícia genérica para um diagnóstico real e personalizado.
**Independent Test**: Preencher o quiz informando o preço atualmente praticado (ex: R$ 40,00) e verificar se o sistema utiliza esse valor para gerar o comparativo direto na prévia.

**Acceptance Scenarios**:
1. **Dado** que a profissional acessa o quiz, **Quando** inicia o preenchimento, **Então** encontra campos claros para indicar o preço que cobra atualmente pelo serviço simulado e sua jornada/tempo de mesa.
2. **Dado** que o preço praticado informado é inferior ao custo real total calculado, **Quando** chega na prévia, **Então** o sistema sinaliza explicitamente a defasagem (ex: "Você está recebendo menos que o seu custo mínimo por hora").
3. **Dado** que o preço praticado cobre os custos e gera lucro saudável, **Quando** conclui, **Então** o sistema confirma a margem positiva obtida.

---

### US2 — Diagnóstico de Lucro Real vs. Preço Praticado (P1)
Como profissional autônoma, quero ver claramente a comparação entre o que cobro, o que gasto em produtos/despesas e quanto sobra líquido no meu bolso por hora de atendimento.

**Why this priority**: É o principal valor que convence a manicure da qualidade e autoridade do produto.
**Independent Test**: Simular Manicure Tradicional cobrando R$ 30,00 e comparar com o custo real calculado (produtos + proporção de despesas operacionais), mostrando o ganho líquido real por hora.

**Acceptance Scenarios**:
1. **Dado** um preço informado de R$ 50,00 e um custo total de R$ 32,00, **Quando** visualiza a prévia, **Então** o sistema exibe o ganho líquido de R$ 18,00 e a margem percentual real sobre o serviço.
2. **Dado** um preço informado de R$ 25,00 e um custo total de R$ 32,00, **Quando** visualiza a prévia, **Então** o sistema alerta com destaque que o valor atual não cobre os custos operacionais e materiais considerados.

---

### US3 — Refinamento Visual e Vocabulário Profissional (P2)
Como visitante do quiz, quero ver perguntas com termos técnicos autênticos do meu cotidiano e visual moderno, para sentir segurança e identificação imediata.

**Why this priority**: Constrói autoridade de marca e conexão emocional com a profissional autônoma.
**Independent Test**: Revisar as perguntas e cards, confirmando o uso de termos reais (cutilagem, esmaltação, tempo de mesa, insumos descartáveis) e hierarquia visual refinada.

**Acceptance Scenarios**:
1. **Dado** o questionário, **Quando** visualiza as perguntas, **Então** os textos referenciam o cotidiano da mesa (tempo de mesa, cutilagem/preparação, insumos descartáveis e biossegurança).
2. **Dado** o resultado, **Quando** apresentado, **Então** não há mais selos de "Simulação fictícia", e sim a indicação de metodologia transparente baseada nos dados fornecidos e parâmetros técnicos.

---

## Edge Cases

- Preço praticado informado igual a zero ou valor simbólico muito baixo (ex: R$ 1,00): o sistema alerta que o valor não cobre nem os insumos básicos descartáveis.
- Preço praticado informado extremamente alto (ex: R$ 1.000,00 em manicure tradicional): cálculo não quebra, mas a margem é calculada normalmente.
- Manicure que não sabe exatamente quanto gasta de luz/aluguel: o sistema oferece valores de referência padrão de despesa operacional horária caso ela não queira customizar.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O quiz DEVE permitir a coleta de referências numéricas da profissional (ex: preço cobrado atualmente para o serviço simulado).
- **FR-002**: O motor de avaliação DEVE comparar o preço praticado informado com o custo de insumos, custo operacional e remuneração-alvo.
- **FR-003**: A prévia DEVE exibir o comparativo: [Preço Cobrado Hoje] vs. [Preço Mínimo Sustentável] vs. [Preço Recomendado com Margem Saudável].
- **FR-004**: A prévia DEVE calcular e exibir o ganho líquido real por hora/atendimento gerado pelo preço atual informado.
- **FR-005**: O Engine NÃO DEVE mais exibir selos de "valores fictícios" quando o quiz for configurado em modo de produção/real (`demo: false`).
- **FR-006**: Os textos informativos e títulos das perguntas DEVEM utilizar terminologia real do setor de nail design e manicure profissional.
- **FR-007**: A integridade das 162 combinações existentes e testes E2E/unitários DEVE ser preservada e expandida para os novos fluxos de precificação real.

---

## Success Criteria *(mandatory)*

1. Uma manicure que preenche o quiz obtém um diagnóstico comparativo imediato entre o que cobra e o que gasta na realidade.
2. A suíte de testes unitários e de integração E2E cobre os cenários de precificação com entrada da profissional (lucro positivo, ponto de equilíbrio e prejuízo operacional).
3. Todo o fluxo permanece responsivo para telas móveis (360px), navegável 100% por teclado e sem envio indevido de dados pessoais.
