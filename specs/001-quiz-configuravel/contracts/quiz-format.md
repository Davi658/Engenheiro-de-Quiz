# Contrato de autoria v1

Arquivo data/<slug>/quiz.json; slug = id. Descoberta automática no dev/build. Adicionar conteúdo requer reiniciar dev ou novo build, sem editar catálogo no código.

## Estrutura

Obrigatórios: schemaVersion, id, version, title, locale, demo, theme, identification (array pode ser vazio), pages (array não vazio), result. Tipos e limites em ../data-model.md. Objetos estritos: rejeitar chaves desconhecidas; values é mapa de métricas. Não aceitar HTML/CSS, scripts ou expressões executáveis. Renderizar textos literalmente.

## pricing-v1

result contém kind, contributionQuestions (IDs), durationKey, materialsKey, availabilityQuestion, availabilityKey, profileQuestion, profiles (optionId -> {label, description}), priorityQuestion, priorityTexts (optionId -> texto), scenario e packages.

Somar values[durationKey] e values[materialsKey] de cada alternativa selecionada nas contributionQuestions. Ambas métricas são obrigatórias para cada alternativa dessas perguntas; ausência é erro, não zero. Disponibilidade vem de values[availabilityKey] da alternativa escolhida em availabilityQuestion, em minutos inteiros positivos. Profiles e priorityTexts cobrem exatamente todas as opções das respectivas perguntas. Perguntas referenciadas são obrigatórias.

scenario: currency = BRL, operatingHourly, compensationHourly, feeRate, targetMargins. Piloto: 12.00, 24.00, 0.05 e [0.00, 0.15, 0.25]. Fórmulas e tabelas de serviço seguem docs/roteiro-quiz-piloto.md na raiz.

packages: exatamente duas entradas {id, label, overrides}; overrides mapeia IDs de perguntas para opções existentes. Piloto substitui acabamento por discreto e elaborado. Preservar outras respostas; recalcular sem gerar pacotes recursivamente. Se coincidir com escolha original, manter comparação identificada.

Usar decimal.js, precisão 40. Preços sugeridos: arredondar para cima ao centavo. Custos exibidos: half-up em duas casas; cálculos usam precisão completa. Resultado financeiro e margem efetiva usam preço já arredondado. Exibir taxa em reais por cenário além da taxa percentual. Nenhum dado de identificação afeta cálculos. Prioridade só muda explicação; acabamento define perfil. Duração acima da disponibilidade gera aviso sem alterar números.

## category-table-v1

result contém kind, questionIds em ordem e rows [{answers, label, description}]. answers mapeia exatamente essas perguntas para opções existentes. Cada combinação deve ser coberta uma única vez, sem faltas ou duplicações.

Segundo quiz: ritmo [rapido, detalhado], acabamento [discreto, elaborado]. Quatro resultados na ordem das combinações: Essencial Prático, Expressivo Prático, Cuidado Discreto, Cuidado Elaborado. Identificação apenas nome, ambas perguntas na mesma página; sem dinheiro, duração ou relatório.

## Erros e interfaces

validateQuiz(unknown) retorna definição válida ou lista de erros. evaluateQuiz(definition, answers) retorna resultado ou erros de resposta. createSession fixa snapshot/version. Núcleo sem DOM, rede, storage ou filesystem.

validate-quizzes falha com código diferente de zero e caminho do arquivo/propriedade/motivo. Rodar antes de dev/build e validar no carregamento. Quiz inválido exibe “Quiz indisponível”; id desconhecido exibe “Quiz não encontrado”. Não registrar respostas ou identificação.
