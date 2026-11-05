# Etapa seguinte para o Gemini

Abra o projeto `D:\Projetos\EngenheroQuiz` e implemente esta etapa no quiz `data/beleza-unhas/quiz.json` e no Engine. Leia primeiro `AGENTS.md` (se existir), `.specify/memory/constitution.md`, `specs/005-plano-evolucao/spec.md`, `specs/005-plano-evolucao/plan.md`, este arquivo e as instruções de dados em `docs/prompt-gemini-evolucao-quiz.md`. Inspecione o estado atual e preserve todas as alterações existentes.

## Objetivo desta etapa

Tornar a coleta de despesas compreensível para uma profissional autônoma. A usuária informa **valores em reais e o período correspondente**. Não peça que ela calcule percentuais.

1. Remova as perguntas de percentual de rateio (`rateio-espaco`, `rateio-contas`, `rateio-transporte`) e qualquer entrada equivalente. Para despesas que misturam casa e trabalho, pergunte o gasto total no período e, opcionalmente, “Quanto desse valor você estima que corresponde ao trabalho?” em reais. Explique que pode informar uma estimativa ou deixar em branco. Não subtraia nem duplique o total pessoal e a parcela profissional.
2. Substitua a pergunta `taxa-cartao` por valor efetivamente pago em taxas no mês (R$), permitindo zero e “não sei”. Use esse valor diretamente nos custos mensais. Se preço sugerido por serviço precisar de uma taxa proporcional, derive-a somente quando houver faturamento do mesmo período; sinalize a estimativa e não trate ausência de dados como zero.
3. Preserve valores zero, desconhecidos e não informados como estados diferentes. Revise perguntas opcionais que hoje entram nos cálculos como zero. Não gere conclusão de suficiência pessoal se faltarem despesas relevantes.
4. Corrija os cálculos relacionados: ponto de equilíbrio quando a margem de contribuição for zero/negativa; diferença para a retirada desejada quando o resultado operacional for negativo; e exibição clara do resultado com despesas incompletas.
5. Atualize prévia, relatório, texto de ajuda, validação do conteúdo e documentação para refletir entradas monetárias em vez de percentuais. Mantenha compatibilidade com quizzes existentes e não remova recursos que não fazem parte deste escopo.

## Regras de implementação

- Siga os padrões TypeScript, Zod, Decimal e DOM já usados no projeto.
- Mantenha cálculos puros separados da apresentação; não invente valores nem médias.
- Explique no relatório qual período foi usado e quais respostas foram estimadas ou ficaram ausentes.
- Não faça mudanças em pagamento, envio de email, armazenamento de dados ou publicação.
- Acrescente ou ajuste testes apenas para os comportamentos acima: taxa informada como valor, valores zero versus desconhecidos, despesa compartilhada, ponto de equilíbrio inviável e meta de retirada com resultado negativo.

## Conclusão

Implemente a etapa, rode as verificações existentes de validação, tipos, testes e build. Corrija falhas causadas pelas mudanças. No final, relate arquivos alterados, comportamento, verificações executadas e limitações que ainda restam. Não marque tarefas do Spec Kit como concluídas se não foram realizadas.
