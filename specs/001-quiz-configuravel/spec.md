# Feature Specification: Engine de quizzes configuráveis até a prévia

**Data:** 2026-11-01  
**Status:** rascunho para planejamento  
**Origem:** visão de Davi Diniz e decisões registradas em `docs/quiz-beleza.md`.

## Objetivo e escopo

Executar quizzes B2C simples a partir de definições próprias, sem editar o Engine para adicionar conteúdo suportado. O primeiro é uma simulação de orçamento e estilo para profissionais autônomas de beleza. O protótipo usa apenas valores fictícios e dados pessoais de teste.

O roteiro e as regras demonstrativas constam em `docs/roteiro-quiz-piloto.md` e integram esta especificação. Serviços de unhas, cinco perguntas, navegação de retorno e identificação por nome/email são decisões propostas para o protótipo, revisáveis antes da implementação.

## User Scenarios & Testing *(mandatory)*

### US1 — Responder um quiz (P1)

Como profissional, quero responder perguntas curtas sobre um atendimento e receber uma prévia compreensível.

**Why this priority:** é o percurso principal do produto.
**Independent Test:** percorrer o quiz piloto com respostas conhecidas e conferir a prévia.
**Acceptance Scenarios:**

- Dado um endereço válido, quando acessar, vejo o título, a indicação de simulação e os campos de identificação configurados.
- Dado um campo obrigatório vazio ou email com formato inválido, quando avançar, vejo um erro associado ao campo e permaneço na etapa.
- Dada uma resposta válida, quando avançar e voltar, encontro minha escolha preservada durante a sessão.
- Dadas as cinco respostas completas, quando concluir, recebo perfil, duração e preço mínimo do cenário, acompanhados das premissas fictícias.

### US2 — Obter resultados coerentes (P1)

Como profissional, quero compreender de onde veio a estimativa.

**Why this priority:** resultados coerentes são essenciais à confiança na simulação.
**Independent Test:** comparar os resultados dos cenários de referência, incluindo mudança de respostas.
**Acceptance Scenarios:**

- Dado o caso de referência do roteiro, o resultado deve ser Minimalista Elegante, 40 minutos, custo simulado de R$ 32,00 e mínimo de R$ 33,69.
- Dado tempo estimado superior à disponibilidade, o resultado informa a incompatibilidade sem modificar a duração calculada.
- Dada alteração de uma resposta, quando concluir novamente, o resultado é recalculado e não mostra valores anteriores.
- Dado o cenário fictício, a interface nunca afirma que conhece o lucro ou prejuízo real da respondente.

### US3 — Adicionar outro quiz (P1)

Como responsável pelo conteúdo, quero acrescentar um quiz usando o formato documentado.

**Why this priority:** comprova a proposta de motor reutilizável.
**Independent Test:** carregar o quiz de demonstração e verificar suas quatro categorias.
**Acceptance Scenarios:**

- Dado um segundo diretório válido, seu endereço apresenta campos, páginas e resultados próprios sem alteração no Engine.
- Dadas referências inexistentes, identificadores duplicados ou parâmetros numéricos inválidos, a validação rejeita a definição com localização e motivo úteis ao autor.

Para esta prova, usar um segundo quiz técnico de demonstração: “Preferência de atendimento”, com identificação somente por nome, duas perguntas de escolha única e resultado categórico, sem cálculos financeiros. Ele não constitui um segundo produto comercial aprovado. Suas perguntas comparam atendimento rápido ou detalhado e acabamento discreto ou elaborado; o resultado combina as duas escolhas em quatro categorias explícitas.

### US4 — Inspecionar o relatório de demonstração (P2)

Como responsável pelo produto, quero revisar um exemplo do conteúdo completo antes de integrar a venda.

**Why this priority:** permite avaliar o conteúdo comercial sem depender de cobrança.
**Independent Test:** abrir o exemplo com uma participação demonstrativa e conferir custos, cenários e pacotes.
**Acceptance Scenarios:**

- Em modo de demonstração, o exemplo mostra custos, três cenários de margem e duas alternativas de pacote recalculadas.
- A tela informa que o exemplo não é uma compra e não solicita pagamento.

### Edge Cases

Quiz desconhecido; configuração malformada; opção removida ou inválida; submissão incompleta; retorno e alteração; tempo insuficiente; taxa mais margem igual ou superior a 100%; parâmetros negativos; preço do relatório confundido com preço do serviço.

## Requirements *(mandatory)*

### Functional Requirements

- **RF01:** Resolver cada quiz por identificador único e versão explícita.
- **RF02:** Interpretar campos de identificação, páginas, textos, perguntas de escolha única, obrigatoriedade e regras suportadas a partir de sua definição.
- **RF03:** Preservar respostas ao voltar e recalcular após alterações, durante a sessão atual.
- **RF04:** Validar definição antes de disponibilizá-la; nunca executar código arbitrário vindo do conteúdo.
- **RF05:** Separar regras e conteúdo do quiz da lógica genérica do Engine.
- **RF06:** Apresentar mensagens próprias para quiz inexistente e configuração indisponível, sem expor detalhes internos ao participante.
- **RF07:** Mostrar valores fictícios e unidades em todos os resultados financeiros e de tempo.
- **RF08:** Implementar as fórmulas e arredondamento documentados no roteiro, rejeitando divisores não positivos e valores de custo/tempo negativos.
- **RF09:** Não transmitir identificação ou respostas para serviços externos no protótipo nem registrá-las em logs.
- **RF10:** Documentar o formato para que os dois quizzes sejam compreensíveis e reproduzíveis.

### Experiência e qualidade

- Interface em português brasileiro, valores em reais e duração em minutos ou horas/minutos.
- Perguntas com rótulos claros, operáveis por teclado e com indicação de progresso.
- Layout utilizável em largura de 360 pixels sem rolagem horizontal no fluxo principal.
- Cada resultado deve guardar a referência à versão utilizada durante a sessão.
- O indicador de perfil deve ter texto equivalente; cor não pode ser a única informação.

### Key Entities

Quiz e versão; campo de identificação; página; bloco informativo; pergunta e alternativa; regra; cenário fictício; participação temporária; prévia; relatório de demonstração.

## Success Criteria *(mandatory)*

### Measurable Outcomes

1. Dois quizzes com estruturas diferentes funcionam sem alterações específicas no Engine.
2. O caso de referência retorna os três valores monetários esperados e cada entrada inválida descrita é rejeitada com mensagem compreensível.
3. O fluxo completo pode ser percorrido por teclado e em tela móvel.
4. Todos os resultados demonstrativos distinguem simulação de dados reais.
5. O exemplo de relatório contém os três componentes aprovados: custos, cenários e pacotes.

## Assumptions

- O protótipo será usado com identificação de teste, sem transmissão a serviços externos.
- O roteiro de cinco perguntas e o recorte de unhas são escolhas iniciais revisáveis.
- O segundo quiz é uma prova de flexibilidade do motor, não um novo produto comercial.
- O conteúdo do relatório pode ser inspecionado em demonstração sem integrar pagamento.

### Fora de escopo

Pagamentos reais, integrações de email e IA, PDF, cadastro de profissionais, editor visual, retomada entre sessões, coleta de dados reais em produção, recomendações clínicas e diagnóstico de risco financeiro real.

### Decisões adiadas

Tecnologias e formato físico das definições pertencem ao plano técnico. Gateway, preço do relatório, retenção de dados reais e provedores pertencem a entregas futuras. Nenhuma dessas escolhas bloqueia especificar o protótipo.
