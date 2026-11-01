# Primeira entrega: do acesso à prévia

Status: escopo detalhado na [especificação inicial](../specs/001-quiz-configuravel/spec.md). As escolhas de protótipo estão identificadas no roteiro.

## Objetivo

Demonstrar que um único Engine consegue executar dois quizzes diferentes a partir de suas definições.

## Escopo proposto

- Identificar o quiz pelo endereço acessado.
- Carregar e validar sua definição.
- Exibir campos de identificação configuráveis.
- Apresentar páginas com blocos informativos e perguntas.
- Validar campos obrigatórios e impedir conclusão incompleta.
- Calcular uma prévia segundo regras explícitas do quiz.
- Permitir adicionar o segundo quiz sem alterar o código do motor.
- Inspecionar um exemplo de relatório completo em modo de demonstração, sem cobrança, PDF ou envio.

## Fora desta entrega

Cobranças reais, envio de email, geração de PDF, geração por IA e editor visual de quizzes. Esses recursos continuam previstos na visão do produto.

## Critérios iniciais de aceitação

1. Dois endereços de quiz carregam conteúdos e estruturas distintos usando o mesmo Engine.
2. Os campos de identificação exibidos correspondem à definição do quiz escolhido.
3. Uma resposta obrigatória ausente impede avançar na etapa pertinente e recebe uma mensagem clara.
4. Uma conclusão válida apresenta a prévia esperada para um conjunto conhecido de respostas.
5. Um identificador de quiz inexistente apresenta uma mensagem apropriada.
6. Uma definição inválida é detectada antes de ser disponibilizada ao participante.
7. O segundo quiz é incluído apenas adicionando conteúdo e configuração.

## Perguntas para esclarecer

- Primeiro conceito registrado em [quiz de beleza](quiz-beleza.md): perfil de estilo e estimativa de orçamento, respondido pela profissional em uma experiência B2C simples, com valores fictícios no teste. Definir roteiro, regras de cálculo e segundo quiz.
- O resultado será uma pontuação, um perfil por categoria ou outra regra?
- Quais tipos de pergunta são necessários nesta primeira entrega?
- O participante pode voltar e alterar respostas?
- Respostas alteram quais perguntas ou páginas serão exibidas?
- É necessário salvar e continuar depois?
- Quais campos de identificação são obrigatórios? O email precisa ser confirmado?

## Planejamento posterior

Após esclarecer essas perguntas, definir o formato das configurações, a separação entre interface e servidor, a persistência necessária e as tecnologias. Em seguida, gerar tarefas e implementar com verificações dos critérios de aceitação.
