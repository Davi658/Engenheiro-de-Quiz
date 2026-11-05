# Instruções de implementação — diagnóstico para Nail Designers

Este documento é o escopo autorizado por Davi para a evolução do quiz. Leia integralmente antes de executar. As seções abaixo formam uma única tarefa; não considere apenas as primeiras seções.

## Papel e projeto

Você atuará como engenheiro de software neste projeto. Implemente a evolução do quiz de Nail Designers, preservando o Engine configurável e os demais quizzes.

- Diretório: `D:\Projetos\EngenheroQuiz`
- Quiz: `data/beleza-unhas/quiz.json`
- Endereço local: `http://127.0.0.1:5173/?quiz=beleza-unhas`

Antes de alterar arquivos:

1. Leia as instruções locais, a constituição em `.specify/memory/constitution.md`, as especificações existentes e a documentação.
2. Inspecione o código, os testes e o estado do Git. Preserve alterações existentes; não reverta trabalho alheio.
3. Identifique quais recursos já existem e quais precisam ser implementados.
4. Utilize o fluxo do Spec Kit disponível no projeto: especificação, plano, tarefas e implementação. Registre esta evolução em uma funcionalidade própria, sem marcar trabalho incompleto como concluído.

Não se limite a apresentar um plano: implemente, execute as verificações e entregue o resultado funcionando. Faça escolhas técnicas razoáveis e documente suposições. Pergunte apenas quando existir uma decisão realmente bloqueante.

## Objetivo do produto

Transformar o atual quiz de um atendimento isolado em um diagnóstico do negócio de uma manicure autônoma, com aprofundamento opcional das finanças pessoais.

Nome sugerido: **Diagnóstico de Precificação e Saúde do Negócio para Nail Designers**.

A experiência deve continuar simples, acessível e adequada ao celular. As nove etapas representam blocos de assunto; podem conter pequenas subetapas para evitar telas extensas.

## Dados e metodologia

Todos os valores individuais de tempo, preço, materiais, despesas, receitas e reservas devem ser informados pela própria profissional.

- Não preencher automaticamente com médias de mercado.
- Não inventar informações ausentes.
- Diferenciar valor zero, valor estimado, desconhecido e não informado.
- Permitir “Não se aplica” quando fizer sentido.
- Explicar unidades e períodos: por atendimento, por mês, por ano etc.
- Informações fornecidas são autodeclaradas, não verificadas.
- Referências externas fundamentam a metodologia, não comprovam os números individuais.
- Remover alegações sem evidência, inclusive referências a “médias técnicas de mercado” não documentadas.
- Perfis e níveis profissionais são autoavaliações; não representam certificação técnica.

## Fluxo do quiz

### 1. Serviços oferecidos

Permitir selecionar vários serviços realizados no dia a dia. Incluir “Outro serviço” com nome personalizado. Distinguir serviço avulso, adicional e combo. Usar identificadores estáveis; nomes digitados não devem funcionar como identificadores internos.

### 2. Experiência e interesses

Apresentar técnicas da área, inclusive aquelas que a profissional ainda não oferece. Para cada técnica, permitir uma autoavaliação:

- Nunca aprendi.
- Estou aprendendo.
- Realizo com ajuda.
- Realizo com autonomia.

Perguntar também se deseja aprender ou aprimorar aquela técnica. Não concluir que toda técnica desconhecida exige compra de curso. Permitir pular técnicas sem interesse.

### 3. Dados dos serviços e combos

Gerar formulários conforme os serviços selecionados:

- Tempo médio total de execução.
- Preço cobrado.
- Custo dos materiais consumidos por atendimento.
- Quantidade média de realizações por mês.

Orientar que custo de material consumido é diferente do preço de uma embalagem inteira.

Para combos, registrar serviços incluídos, preço total, tempo total, custo total dos materiais e quantidade mensal de combos.

A quantidade de serviços avulsos deve excluir os atendimentos já contabilizados nos combos. Evitar duplicar receita, materiais, tempo ou volume.

Ao remover um serviço anteriormente selecionado, garantir que seus dados antigos deixem de afetar os cálculos.

### 4. Local e capacidade de trabalho

Permitir indicar:

- Espaço próprio.
- Espaço alugado.
- Espaço compartilhado.
- Residência da profissional.
- Domicílio das clientes.
- Mais de uma modalidade.

Perguntar dias e horas disponíveis para trabalhar, além de tempo destinado a preparação, limpeza, administração e deslocamentos. Definir claramente o que já está incluído na duração de cada atendimento para evitar dupla contagem.

### 5. Despesas profissionais

Mostrar categorias pertinentes às respostas anteriores:

- Aluguel e despesas do espaço.
- Energia, água, internet e telefone.
- Limpeza e manutenção.
- Equipamentos e reposição.
- Transporte, combustível e estacionamento.
- Seguro e tributos do veículo, quando aplicáveis.
- Sistemas, contabilidade e outras despesas.
- Taxas de pagamento, comissões e tributos pertinentes ao negócio.

Permitir adicionar despesas personalizadas. Não solicitar percentuais ao usuário. Para despesas compartilhadas, solicitar valores em reais separados e com período claro: valor total pago no período e valor que a profissional estima corresponder ao trabalho. Calcular a parcela profissional como valor informado, sem pedir que a pessoa faça rateio percentual. Normalizar despesas recorrentes para uma referência mensal, distinguindo desembolso total e parcela profissional. Para taxas de pagamento, solicitar o valor efetivamente pago em taxas no período escolhido (ou usar despesas por serviço, se o dado estiver disponível); nunca exigir que a profissional calcule e digite a taxa percentual. Se um cálculo interno precisar de uma razão percentual, derive-a apenas quando houver numerador e base compatíveis e mostre como estimativa, nunca como entrada obrigatória.

Evitar duplicar materiais, marketing, parcelas e outras despesas registradas em etapas específicas. Não tratar compra de equipamento, depreciação e pagamento de financiamento como se fossem a mesma coisa.

### 6. Finanças pessoais — opcional

Oferecer preenchimento resumido por categorias ou detalhado:

- Moradia.
- Alimentação.
- Água, energia e comunicação.
- Transporte.
- Educação e dependentes.
- Outras despesas.
- Outras fontes de renda disponíveis para essas despesas.
- Retirada atual do negócio.
- Retirada desejada ou necessária.

Não solicitar nomes de filhos, escolas, números de documentos, dados bancários ou detalhes desnecessários.

Quando casa e trabalho compartilham despesas, contabilizar uma única origem e distribuir as parcelas corretamente. Se a pessoa pular este bloco, continuar o diagnóstico profissional e limitar explicitamente as conclusões pessoais.

### 7. Divulgação e aquisição de clientes

Perguntar canais utilizados, gasto mensal por canal, tempo dedicado (se souber) e novas clientes atribuídas ao canal (se souber).

Não calcular custo de aquisição sem dados suficientes. Não apresentar retorno financeiro de marketing sem receita e atribuição adequadas. Centralizar esses gastos para não duplicá-los nas despesas profissionais.

### 8. Reservas, investimentos e dívidas — aprofundamento opcional

Distinguir:

- Caixa disponível do negócio.
- Reserva pessoal.
- Valores separados para compromissos futuros.
- Investimentos com ou sem disponibilidade imediata.
- Dívidas profissionais e pessoais.
- Parcelas mensais, atrasos e juros, quando conhecidos.

Não pedir credenciais ou conexão bancária. Não recomendar ativos financeiros específicos. Se faltarem informações sobre dívidas ou disponibilidade das reservas, limitar as conclusões correspondentes.

### 9. Histórico mensal

Oferecer uma linha do tempo de até 12 meses, permitindo preencher apenas os meses disponíveis. Distinguir faturamento dos serviços realizados, valores efetivamente recebidos, pagamentos/despesas do período e retiradas pessoais.

Explicar cada conceito em linguagem simples. Permitir marcar valores estimados. Mês desconhecido não é mês com receita zero.

Não somar novamente o histórico ao faturamento estimado pelos serviços: são visões diferentes. Sinalizar divergências relevantes e permitir revisão das respostas.

## Regras dos cálculos

Implemente cálculos determinísticos, testáveis e independentes da apresentação. Preserve a precisão monetária adotada pelo projeto.

O modelo deve distinguir:

- Receita estimada por serviço e combo.
- Custos variáveis e contribuição para pagar despesas fixas.
- Despesas fixas profissionais.
- Remuneração/retirada da profissional.
- Resultado estimado do negócio.
- Entradas, saídas e saldo de caixa.
- Necessidade pessoal de retirada.
- Capacidade e ocupação de atendimento.

Documente as fórmulas, os períodos e as regras de rateio. Não contar a remuneração ou retirada duas vezes. Não confundir contribuição por hora com lucro líquido. Não apresentar receita como lucro. Não supor que todos os investimentos estejam disponíveis para pagar contas.

Para sugerir preços:

- Mostrar as premissas de volume, custos, remuneração e margem.
- Permitir que a profissional informe sua meta.
- Explicar quando uma meta não cabe na capacidade disponível.
- Não tratar o preço calculado como garantia de aceitação pelo mercado.

Tratar entradas inválidas, denominadores zero, dados incompletos e ausência de histórico. Não exigir percentuais da profissional. Percentuais internos derivados precisam indicar a base e o período usados.

## Prévia gratuita

Entregar valor real:

- Resumo dos serviços e da rotina.
- Indicadores financeiros básicos calculáveis com os dados disponíveis.
- Comparação de serviços por contribuição e tempo.
- Dois ou três pontos prioritários de melhoria.
- Explicação das respostas que originaram cada conclusão.
- Indicação de dados ausentes e das limitações da análise.

Evitar notas arbitrárias de “saúde financeira” e alertas alarmistas. Não atribuir precisão estatística à qualidade dos dados.

## Relatório completo

Organizar:

- Resumo executivo.
- Quadro financeiro profissional.
- Quadro pessoal, quando preenchido.
- Análise dos serviços e combos.
- Composição dos preços e premissas.
- Capacidade de atendimento.
- Reservas e compromissos conhecidos.
- Plano de ações para 30, 60 e 90 dias.

Cada ação deve apresentar problema identificado, evidência nas respostas, ação recomendada, prioridade, esforço e eventual custo, e indicador para acompanhar.

Mostrar cenários condicionais de evolução, com hipóteses explícitas sobre preços, demanda, custos e capacidade. Não prometer crescimento, renda ou estabilidade. Não projetar sazonalidade sem histórico suficiente.

O relatório completo permanece demonstrativo nesta entrega. Não implementar cobrança, envio de email, PDF, autenticação ou integração com IA sem necessidade expressamente definida no escopo existente. Não inventar o preço comercial do relatório.

## Afiliados

Preparar suporte declarativo a recomendações de cursos e materiais:

- Necessidade atendida.
- Público e nível adequado.
- Pré-requisitos.
- Custo conhecido e data da verificação.
- Link e identificação de afiliado.
- Condições para exibição.
- Alternativa gratuita, quando disponível e verificada.

Não inventar produtos, preços, links ou parcerias. Na ausência de catálogo real, não exibir ofertas fictícias como recomendações reais.

Não recomendar compras automaticamente em todos os relatórios. Considerar interesse, necessidade e orçamento. A indicação comercial não pode alterar o diagnóstico financeiro para favorecer uma venda. Identificar claramente a possibilidade de comissão. O relatório pago deve ter utilidade independente da compra de produtos adicionais.

## Experiência e privacidade

- Interface em português brasileiro.
- Funcionamento em celular e por teclado.
- Rótulos claros, erros associados aos campos e foco adequado.
- Progresso compreensível e revisão antes do resultado.
- Preservar respostas ao navegar entre etapas.
- Não registrar respostas ou dados pessoais em logs.
- Não inserir respostas em URLs.
- Manter o comportamento atual de armazenamento em memória nesta entrega.
- Explicar que recarregar a página pode apagar a participação.
- Não exigir email para um cálculo local sem envio; se houver identificação demonstrativa, torná-la coerente com a funcionalidade realmente disponível.
- Não carregar rastreadores de afiliados durante o preenchimento.

## Arquitetura

Preserve `data/<quiz>/` e `Engine/`.

Implemente no Engine os recursos reutilizáveis necessários:

- Seleção múltipla.
- Campos numéricos com unidade e validação.
- Grupos repetidos por serviço.
- Condições de exibição.
- Categorias de despesas.
- Registros mensais.
- Tratamento explícito de informação ausente.

Mantenha textos, opções, referências e configurações específicas do quiz em `data/`. Não execute código arbitrário vindo de configurações. Versione o contrato e mantenha compatibilidade com quizzes existentes ou documente e teste uma migração explícita. Não introduza frameworks ou dependências sem necessidade demonstrável.

## Fontes iniciais

Verifique antes de usar:

- [Sebrae — formação de preço de serviços](https://conhecimento.sebraers.com.br/wp-content/uploads/2023/08/E-Book-Como-formar-preco-de-servicos-12857.pdf).
- [LGPD — especialmente finalidade, necessidade e transparência](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html).
- [CDC — identificação da publicidade e alegações publicitárias](https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-normaatualizada-pl.html).

Registre o que cada fonte efetivamente fundamenta. Não atribua a uma fonte regras ou valores que ela não contém.

## Verificação e entrega

Inclua testes relevantes para:

- Serviços múltiplos e personalizados.
- Inclusão e remoção de serviços.
- Combos sem dupla contagem.
- Despesas compartilhadas e periódicas.
- Separação entre finanças pessoais e profissionais.
- Zero versus informação ausente.
- Alteração de respostas com recálculo.
- Limites de capacidade e cenários.
- Preenchimento parcial dos blocos opcionais.
- Recomendações comerciais condicionais.
- Compatibilidade com os demais quizzes.
- Fluxo completo, teclado e tela móvel.

Execute os comandos aplicáveis do projeto, incluindo testes, verificação de tipos e build. Corrija os problemas encontrados. Não declare verificações que não executou.

Ao concluir, informe:

1. O que foi implementado.
2. Onde acessar o quiz.
3. Quais verificações passaram.
4. Limitações ou pendências reais.
5. Principais arquivos e documentação alterados.

Não publique, faça deploy ou realize commits sem solicitação. Entregue as alterações locais funcionando e documentadas.

## Controle de qualidade da execução

Antes de implementar, transforme os requisitos deste documento em tarefas rastreáveis e critérios de aceitação na especificação. Ao concluir, confira cada requisito contra o código e as verificações executadas. Registre explicitamente qualquer item não atendido; não reduza silenciosamente o escopo.

Se precisar continuar em outra sessão, deixe registrado o progresso, os arquivos alterados, as decisões e as próximas tarefas. Retome de onde parou, preservando o trabalho existente.
