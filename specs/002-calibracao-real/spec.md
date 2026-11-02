# Feature Specification: Comparação de preço com custos de referência

**Feature**: 002-calibracao-real
**Updated**: 2026-11-02
**Origem**: correções autorizadas por Davi após revisão do projeto. O nome histórico do diretório foi preservado; esta entrega não comprova calibração real.

## Objetivo e escopo

A profissional informa seu preço exato; o quiz compara esse valor com custos, remuneração e duração fictícios definidos no conteúdo. Apresentar a análise como estimativa, sem prometer diagnóstico de lucro individual. Ver correcoes-2026-11-02.md para regras e limites.

## User Scenarios & Testing

### US1 — Informar preço exato (P1)
Como profissional, quero informar quanto cobro, sem substituição pelo limite de uma faixa.
- Digitar 20,00 ou 20.00 resulta no mesmo preço 20; 40 e 1000,00 também são aceitos.
- Zero é permitido. Vazio obrigatório, negativo, expoente, separador de milhar, mais de duas casas e mais de nove dígitos inteiros são rejeitados na página e no núcleo.
- Voltar preserva a entrada; editar invalida prévia e relatório.

### US2 — Entender o resultado estimado (P1)
Como profissional, quero distinguir déficit operacional, sub-remuneração, equilíbrio e excedente positivo dentro das premissas apresentadas.
- Receita após taxas abaixo de materiais + operação: déficit operacional estimado.
- Receita após taxas cobre operação mas não remuneração: abaixo da remuneração de referência.
- Resultado após custo total exatamente zero: equilíbrio, sem afirmação de lucro.
- Resultado maior que zero: positivo estimado, sem garantia de margem saudável.
- Com preço 50, taxa 5%, custo 32,50 e duração 40 minutos: resultado 15 por atendimento e 22,50 por hora, após remuneração de referência.

### US3 — Conhecer as premissas (P1)
Como visitante, quero diferenciar meu preço informado dos custos fictícios.
- Selo de simulação visível no piloto e no relatório; materiais, custos/hora e taxa explicados.
- Nenhuma tela afirma que conhece meus custos reais ou meu lucro real.
- Resultado por hora explica que representa excedente após a remuneração considerada, não dinheiro líquido no bolso.

## Requirements

- **FR-001**: coletar preço monetário exato, com validação consistente de interface e núcleo.
- **FR-002**: comparar com materiais, operação e remuneração de referência, descontando a taxa antes do diagnóstico.
- **FR-003**: mostrar preço informado, mínimo do cenário e comparação de preços com margens no relatório.
- **FR-004**: exibir resultado estimado por atendimento e por hora; duração zero retorna indicação de indisponibilidade por hora.
- **FR-005**: usar demo=true no piloto e não atribuir prova de custos reais a demo=false em qualquer quiz.
- **FR-006**: preservar vocabulário do setor, teclado, foco, layout de 360 px e privacidade em memória.
- **FR-007**: testar 162 combinações categóricas com cinco amostras de preços exatos (810 cenários), limites monetários e fronteiras dos quatro diagnósticos.

## Success Criteria

1. Preço informado nunca é substituído por faixa.
2. Equilíbrio exato não é classificado como lucro positivo.
3. Prévia e relatório exibem 22,50/h no caso de referência e identificam simulação.
4. Quiz categórico continua funcionando sem campo financeiro.
5. Funcionalidade ativa do Spec Kit resolve este diretório.

## Fora de escopo

Coleta/calibração individual de custos, comprovação de preços de mercado, diagnóstico financeiro real, pagamento e email. Não há persistência ou transmissão de respostas.
