# Visão do produto

## Objetivo

Construir um motor web reutilizável que execute quizzes definidos por conteúdo e configuração, permitindo criar novos quizzes sem alterar o motor para cada um.

## Organização proposta por Davi

- `data/`: um diretório por quiz, com páginas, blocos informativos, perguntas, campos de identificação, regras de respostas, prévias, apresentação e preço do relatório completo.
- `Engine/`: interpretação das definições, identificação do quiz acessado, coleta de identificação, apresentação das páginas e perguntas, processamento das respostas e apresentação da prévia.

O fluxo completo também contempla cobrança, confirmação de pagamento, produção de relatório e entrega por email. O relatório poderá ser produzido com auxílio de IA e disponibilizado em PDF ou outro formato adequado.

## Fluxo desejado

1. Participante acessa um quiz por um endereço próprio.
2. Preenche os campos de identificação definidos para esse quiz.
3. Percorre páginas, conteúdos e perguntas.
4. Recebe uma prévia após concluir o preenchimento.
5. Pode pagar o valor definido para obter o relatório completo.
6. Após a confirmação do pagamento, recebe o relatório por email.

## Decisões em aberto

- Primeiro tema: precificação e estilo para profissionais autônomas de beleza; ver [quiz piloto](quiz-beleza.md). A profissional responde e é o público da oferta, em uma experiência B2C simples. O teste usa valores fictícios. Segundo quiz e diferenciais ainda precisam de definição.
- Formato das definições e regras permitidas; JSON/YAML e Markdown são opções a avaliar.
- Armazenamento das definições, respostas, participantes, pagamentos e relatórios.
- Linguagens, frameworks, ambiente de desenvolvimento e hospedagem.
- Gateway de pagamento, provedor de email e eventual provedor de IA.
- Regras de resultado, navegação condicional e retomada de sessões.
- Formato e conteúdo dos relatórios, política de retenção e acesso aos dados.

HTML, CSS e JavaScript são a sugestão inicial de Davi para a aplicação web. O fluxo completo requer processamento no servidor para operações privadas e integrações.

## Evolução proposta

1. Executar dois quizzes distintos no mesmo motor, até a prévia.
2. Integrar cobrança e confirmação de pagamento.
3. Gerar e entregar relatórios, com recuperação de falhas.
4. Avaliar IA e recursos adicionais conforme a necessidade real.

A pesquisa de concorrentes e validação do público é uma atividade de descoberta ainda não realizada.
