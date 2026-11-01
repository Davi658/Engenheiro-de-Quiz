# Modelo de dados

Regras normativas, detalhadas no contrato quiz-format.md.

- Quiz: schemaVersion = 1; id no padrão `^[a-z0-9]+(-[a-z0-9]+)*$`; version no formato `N.N.N`; title não vazio; locale = pt-BR; demo = true; theme = rose ou teal.
- Identificação: id único; type = text ou email; label não vazio; required boolean. Valor obrigatório não vazio após trim; email validado por formato.
- Página: id único; title não vazio; blocks não vazio; ordem do array determina navegação.
- Bloco: text com texto simples não vazio, ou question com id, label, required e options.
- Pergunta: id único no quiz; options com pelo menos duas alternativas; resposta deve ser um optionId existente.
- Alternativa: id único na pergunta, label não vazio, values opcional com strings decimais não negativas; minutos inteiros e dinheiro com até duas casas no piloto.
- Regra: pricing-v1 ou category-table-v1; referências devem existir; perguntas usadas por regras são obrigatórias.
- Cenário: currency = BRL; custos/hora não negativos; taxa e margens >=0 e <1; taxa + cada margem <1.
- Participação: quizId, version, snapshot imutável, identification, answers, pageIndex, status; somente memória.
- Resultado: quizId/version, perfil textual e demonstração; financeiro inclui minutos, compatibilidade, custos e preços decimais.
- Relatório: custos, três cenários e duas alternativas de pacote; somente demonstração.

Transições: identificação -> perguntas -> prévia -> relatório quando disponível. Voltar preserva respostas. Alterar resposta invalida prévia/relatório; concluir recalcula com snapshot da mesma versão. Recarregar ou trocar quiz reinicia. Respostas desconhecidas/incompletas impedem calcular. Valores opcionais ausentes são permitidos fora das regras.

Uma versão ativa por slug neste catálogo. Nova publicação não reinterpreta respostas do snapshot já carregado. Versão não representa autorização ou pagamento.
