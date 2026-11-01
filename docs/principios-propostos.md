# Princípios propostos

Rascunho para revisão antes de compor a constituição do Spec Kit.

1. **Motor reutilizável:** novos quizzes que usem recursos suportados devem ser adicionados por definições, sem alterar o Engine.
2. **Definições verificáveis:** estrutura, identificadores e referências devem ser validados antes de disponibilizar um quiz. Configurações inválidas devem produzir mensagens úteis ao responsável.
3. **Versionamento:** cada participação deve apontar para a versão do quiz utilizada, preservando a interpretação das respostas após mudanças no conteúdo.
4. **Separação de informações:** conteúdo dos quizzes, respostas pessoais e credenciais devem ter armazenamento e acesso apropriados. Credenciais e relatórios restritos não podem ser distribuídos como arquivos públicos.
5. **Autoridade no servidor:** preços cobrados, confirmação do pagamento e liberação do relatório devem ser verificados no servidor.
6. **Entrega confiável:** notificações repetidas de pagamento não devem gerar entregas duplicadas; falhas de geração e envio devem permitir recuperação.
7. **Experiência acessível:** campos devem ter rótulos, erros compreensíveis e navegação por teclado; as páginas devem funcionar em telas móveis.
8. **Verificação proporcional:** regras de resultado, caminhos condicionais e liberação após pagamento devem ter verificações automatizadas conforme forem implementados.
9. **Decisões explícitas:** escolhas técnicas devem registrar motivo e limitações. Pontos ainda não definidos não devem ser apresentados como requisitos aprovados.
