# Quiz piloto: precificação e estilo em beleza

Status: descoberta. Público, uso de valores fictícios no teste e conteúdo do relatório confirmados por Davi. Regras numéricas ainda serão especificadas.

O [roteiro piloto](roteiro-quiz-piloto.md) propõe perguntas e regras numéricas demonstrativas; a [especificação](../specs/001-quiz-configuravel/spec.md) organiza os critérios de aceitação. As questões abaixo registram a descoberta; as escolhas operacionais propostas estão nesses documentos.

## Decisões confirmadas

- A experiência deve ser um quiz B2C simples, respondido pela própria profissional autônoma.
- A profissional é o público da oferta do relatório completo.
- Os testes iniciais utilizarão valores fictícios, identificados como simulação.
- O relatório completo terá detalhamento dos custos, simulação de preços e margens e sugestões de pacotes.
- A cobrança real e a entrega por email continuam fora da primeira entrega do Engine.

## Conceito informado

Quiz-calculadora interativo de orçamento e diagnóstico de estilo para profissionais autônomas de beleza, como manicures, designers de unhas, lash designers e micropigmentadoras.

Problemas que o produto pretende atender: dificuldade em calcular margem, precificar pacotes e atrair clientes que valorizem o trabalho. Essas são hipóteses de produto, ainda sem pesquisa de mercado registrada.

As perguntas devem abordar rotina da cliente, estado atual das unhas ou cílios, estilo desejado e tempo disponível. O resultado combina um perfil de estilo personalizado com estimativa de preço ou plano ideal.

## Prévia solicitada

- Indicador visual do perfil, como Minimalista Elegante ou Alta Complexidade / Nail Art Avançada.
- Estimativa de duração do procedimento; 2h15 é um exemplo ilustrativo, não um parâmetro validado.
- Indicador de risco para a profissional, associado à relação entre preço cobrado e custos estimados.
- Alerta sobre custos que podem passar despercebidos, como desgaste de equipamentos, produtos e energia.

## Distinções necessárias

- Duração estimada não é preço de custo: são resultados separados, com unidades e dados distintos.
- O preço do serviço de beleza é diferente do preço de compra do relatório do quiz.
- Perfil de estilo é uma recomendação estética; não representa diagnóstico clínico sobre unhas ou cílios.
- Um alerta financeiro depende de custos e premissas explícitos. O sistema não deve afirmar prejuízo com base apenas em estilo e duração.

## Proposta para discussão

Começar com serviços de unhas, com a profissional preenchendo um caso de atendimento de uma cliente. O recorte exclusivo de unhas ainda é uma proposta. Organizar o fluxo em identificação, características do atendimento e prévia; durante o teste, os custos serão carregados de um cenário fictício definido para o quiz.

Para manter a experiência simples, propor perguntas curtas com alternativas claras e evitar solicitar uma planilha de despesas. A profissional responde sobre o serviço, estilo, complexidade e duração. Quantidade de perguntas, opções e regras de classificação serão definidas na especificação.

Possíveis entradas para o cálculo, a validar no planejamento: materiais por atendimento, duração, parcela de despesas operacionais, remuneração pretendida, taxas aplicáveis e preço praticado. Definir a metodologia antes de implementar fórmulas, evitando contar a mesma despesa duas vezes.

Se forem usados valores de demonstração ou referências, identificar sua origem e apresentar o resultado como simulação. Na ausência dos dados necessários, informar que o custo não pode ser estimado em vez de apresentar um valor inventado ou um risco arbitrário.

## Questões abertas prioritárias

1. Quais procedimentos e alternativas entrarão no primeiro roteiro?
2. Quais valores fictícios e regras de cálculo produzirão os resultados de referência?
3. Qual será o preço de compra do relatório? Essa decisão pertence à etapa de monetização.

## Conteúdo aprovado para o relatório completo

- Detalhamento dos custos simulados do atendimento e das premissas utilizadas.
- Comparação de cenários de preço e margem, com metodologia explícita.
- Sugestões de pacotes relacionadas às respostas da profissional.

Durante o teste, o relatório deve indicar que os valores são fictícios e não representam a situação financeira real da respondente. Seu conteúdo pode ser validado como exemplo antes da integração de pagamento, PDF e email.

## Critérios candidatos para a especificação

- Separar perfil, duração, custo estimado e preço sugerido na apresentação.
- Associar resultados a regras versionadas e exemplos com resultados esperados.
- Não apresentar alerta conclusivo de prejuízo sem as entradas necessárias.
- Não atribuir precisão estatística ao indicador visual sem uma metodologia definida.
- Mostrar premissas e distinguir valores informados de valores ilustrativos.
- Exibir indicação de valores fictícios na prévia e no exemplo de relatório completo.
- Manter o quiz compreensível sem exigir conhecimento de termos contábeis.

O segundo quiz de validação do Engine permanece pendente de escolha.
