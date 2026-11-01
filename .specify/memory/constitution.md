<!-- Sync Impact Report: template inicial -> 1.0.0. Princípios: motor configurável, validação, versionamento, privacidade, autoridade no servidor, entrega confiável, acessibilidade, verificação e decisões explícitas. Seções adicionadas: restrições e fluxo. Remoções: nenhuma regra vigente. Pendências: nenhuma. Remover este comentário antes de um commit. -->
# Engenheiro de Quizzes Constitution

## Core Principles

### I. Motor configurável
Novos quizzes que usem recursos suportados DEVEM ser incluídos por definições documentadas, sem modificar o Engine. A entrega inicial DEVE demonstrar isso com dois quizzes diferentes.

### II. Definições verificáveis
Estrutura, identificadores, referências e parâmetros DEVEM ser validados antes de disponibilizar um quiz. Conteúdo NÃO DEVE executar código arbitrário. Erros para o autor DEVEM identificar localização e motivo.

### III. Versionamento
Cada participação DEVE identificar a versão utilizada. Mudanças publicadas NÃO DEVEM reinterpretar silenciosamente respostas anteriores.

### IV. Privacidade e separação de informações
Dados pessoais, conteúdo e credenciais DEVEM ter acesso apropriado. Credenciais e relatórios restritos NÃO DEVEM ser publicados como conteúdo estático. O protótipo DEVE usar dados de identificação de teste e NÃO DEVE registrar respostas pessoais em logs.

### V. Autoridade no servidor
Quando monetização for implementada, preço cobrado, confirmação de pagamento e acesso ao relatório DEVEM ser verificados no servidor. O preço do relatório DEVE ser distinto de valores calculados pelo quiz.

### VI. Entrega confiável
Quando pagamentos e entrega forem implementados, notificações repetidas NÃO DEVEM causar entregas duplicadas. Falhas de geração e envio DEVEM permitir recuperação e estado verificável.

### VII. Simplicidade e acessibilidade
O fluxo B2C DEVE usar perguntas curtas, rótulos claros, mensagens de erro compreensíveis e operação por teclado. A interface DEVE ser utilizável em telas móveis. Cor NÃO DEVE ser a única forma de comunicar resultados.

### VIII. Verificação proporcional
Cálculos, classificação, navegação condicional quando existente e liberação paga quando implementada DEVEM ter verificações automatizadas. A entrega DEVE ser comparada aos critérios de aceitação e registrar limitações reais.

### IX. Decisões e estimativas explícitas
Suposições DEVEM ser diferenciadas de decisões de Davi. Valores fictícios DEVEM ser identificados na prévia e no relatório. Alertas NÃO DEVEM alegar diagnóstico financeiro real com dados demonstrativos. Escolhas técnicas DEVEM registrar motivos e limitações.

## Restrições do produto

A primeira entrega vai do acesso à prévia, com exemplo de relatório em modo de demonstração. Cobrança real, PDF, email, IA e armazenamento de dados reais em produção ficam para entregas posteriores. A arquitetura DEVE preservar essas possibilidades sem antecipar integrações desnecessárias.

## Fluxo de desenvolvimento

Cada funcionalidade DEVE ter especificação, plano e tarefas antes da implementação. A revisão DEVE conferir coerência com esta constituição. O plano DEVE definir as tecnologias necessárias à entrega; a especificação DEVE descrever comportamento e valor para o usuário. Requisitos novos DEVEM atualizar os documentos afetados.

## Governance

Esta constituição orienta as decisões do projeto, subordinada às instruções explícitas de Davi. Alterações DEVEM registrar justificativa e impactos nas especificações. Usar versão major para remoção ou redefinição incompatível de princípios, minor para novos princípios e patch para esclarecimentos. Toda revisão de entrega DEVE verificar conformidade; exceções DEVEM ser justificadas e registradas. Esta versão inicial consolida os princípios propostos no contexto autorizado de preparação do projeto.

**Version**: 1.0.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-01
