# Research: Calibração Real e Comparativo de Precificação

## Decisões Técnicas

1. **Entrada de Preço Praticado (`actualPriceQuestion` ou `actualPriceKey`)**:
   - Para manter a arquitetura extensível do `pricing-v1` (ou evoluir para `pricing-v2`), precisamos que a pergunta sobre quanto a profissional cobra atualmente possa ser declarada no JSON do quiz, mantendo o Engine agnóstico a nichos.
   - O campo coletado pode ser um número/moeda (ex: R$ 40,00) via input de número/moeda ou faixas de rádio (ex: Até R$ 30, R$ 40, R$ 50, R$ 70+). Usar um input numérico monetário ou opções pré-calibradas. Como o formato atual usa escolha única (`radio`) para consistência e simplicidade na validação, podemos fornecer faixas ou permitir um tipo de pergunta numérica monetária.
   - Decisão: Adicionar suporte a perguntas do tipo numérico monetário ou opções de faixas objetivas. Para máxima compatibilidade sem quebrar o esquema existente de perguntas e validações estritas, permitir opções claras de valor no quiz (`values: { price: "40.00" }`) OU estender o schema para permitir input monetário. No `pricing-v1`, as opções já suportam `values: { ... }`. Portanto, podemos ter uma pergunta com `options` de valores reais representativos ou campo aberto validado por regex decimal.

2. **Diferenciação de Modo Demonstrativo (`demo: boolean`)**:
   - `quiz.json` possui `"demo": false`.
   - Quando `demo: false`, a interface suprime o badge "Simulação com valores fictícios" e apresenta o banner de metodologia: "Diagnóstico baseado em custos reais de insumos e tempo de mesa informados".

3. **Cálculo Comparativo**:
   - `actualPrice`: Preço informado pela profissional.
   - `cost`: Custo total calculado (materiais + despesas operacionais da duração + remuneração pretendida).
   - `breakEvenPrice`: Preço mínimo para não ter prejuízo considerando apenas materiais + despesas operacionais (sem a remuneração pessoal).
   - `netProfit`: `actualPrice * (1 - feeRate) - cost`.
   - `verdict`:
     - Se `actualPrice < breakEvenPrice`: **Prejuízo operacional crítico** (está pagando para trabalhar).
     - Se `breakEvenPrice <= actualPrice < minimum`: **Sub-remuneração** (cobre contas, mas ganha menos que a remuneração-alvo por hora).
     - Se `actualPrice >= minimum`: **Lucro saudável** (cobre todas as despesas e remuneração-alvo com sobra).

4. **Vocabulário Real no Piloto de Beleza**:
   - "tempo de mesa" em vez de "tempo disponível".
   - "cutilagem e preparação" em vez de "a preparação".
   - "esmaltação em gel / blindagem / alongamento em fibra".
   - insumos descartáveis (lixa, palito, luvas, algodão, álcool 70%).

