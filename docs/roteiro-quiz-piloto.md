# Roteiro piloto — orçamento e estilo de unhas

Status: proposta implementável para revisão. Valores integralmente fictícios, sem pesquisa de preços de mercado. Não representa avaliação financeira real.

## Experiência

A própria profissional responde sobre um atendimento. O recorte inicial de unhas é uma escolha de protótipo; não limita os recursos futuros do Engine. Não coletar dados identificáveis da cliente atendida.

Identificação proposta: nome e email da profissional, exigidos antes das perguntas. No protótipo, usar dados de teste; não enviar email. Permitir voltar e alterar respostas, preservando o preenchimento durante a sessão. Retomada após fechar o navegador fica fora do escopo inicial.

## Perguntas

1. **Qual serviço você quer simular?** Manicure tradicional / Esmaltação em gel / Alongamento.
2. **Qual acabamento sua cliente procura?** Discreto e uniforme / Decoração simples / Nail art elaborada.
3. **Como está a unha para esse atendimento?** Pronta para iniciar / Precisa remover o produto anterior.
4. **Qual é a prioridade da cliente?** Praticidade no dia a dia / Equilíbrio entre estilo e praticidade / Visual marcante.
5. **Quanto tempo ela tem disponível?** Até 60 minutos / Até 120 minutos / Até 180 minutos.

Todas obrigatórias, escolha única. Não incluir ramificações no primeiro roteiro. Perguntas clínicas e recomendações de saúde ficam fora do quiz.

## Regras demonstrativas

| Serviço | Tempo base | Materiais base |
| --- | ---: | ---: |
| Manicure tradicional | 40 min | R$ 8,00 |
| Esmaltação em gel | 60 min | R$ 18,00 |
| Alongamento | 100 min | R$ 35,00 |

Acabamento discreto adiciona zero; decoração simples adiciona 20 minutos e R$ 5,00; nail art elaborada adiciona 40 minutos e R$ 12,00. Remoção adiciona 20 minutos e R$ 4,00.

O acabamento determina o perfil: Minimalista Elegante, Criativa Versátil ou Arte em Destaque. Não exibir percentuais de precisão. A prioridade ajusta o texto explicativo, sem alterar o cálculo. Se a duração superar a disponibilidade, mostrar aviso de incompatibilidade; não reduzir silenciosamente o tempo.

## Cenário financeiro fictício

Para testar o motor, usar despesas operacionais de R$ 12,00 por hora, remuneração de R$ 24,00 por hora e taxa de 5% sobre o preço. Os valores operacionais já incluem energia e desgaste; não adicionar essas parcelas novamente.

- Tempo total = base + acabamento + remoção.
- Materiais = base + acabamento + remoção.
- Custo simulado C = materiais + (tempo total em minutos / 60) × (12 + 24).
- Preço mínimo do cenário = C / (1 - 0,05).
- Preço para margem m sobre receita = C / (1 - 0,05 - m).
- Resultado simulado = preço × (1 - 0,05) - C.

Rejeitar parâmetros em que taxa + margem seja maior ou igual a 1. Não confundir margem sobre receita com acréscimo percentual sobre custo. Valores são premissas de teste, não orientação de preço de mercado.

Calcular com precisão decimal e arredondar preços sugeridos para cima ao centavo; recalcular o resultado com o preço exibido. O mínimo inclui a remuneração fictícia: não rotular diferença negativa como prejuízo de caixa real.

## Prévia gratuita

- Selo visível: “Simulação com valores fictícios”.
- Perfil de estilo e explicação curta.
- Duração estimada e compatibilidade com o tempo disponível.
- Preço mínimo do cenário e alerta: “Neste exemplo fictício, cobrar menos de R$ X não cobre os custos e a remuneração considerados.”

O termômetro de risco fica adiado: sem preço praticado ou metodologia validada, não há base para atribuir risco pessoal à profissional.

## Relatório completo de demonstração

Apresentar materiais, despesas operacionais, remuneração, taxa e premissas, comparando margens-alvo de 0%, 15% e 25%. Sugerir duas alternativas de pacote de serviço com acabamentos diferentes, recalculando cada opção com as mesmas regras. Não inventar descontos ou garantias de lucro. Na primeira entrega, disponibilizar o exemplo em ambiente de demonstração, sem cobrança nem envio.

## Caso de referência

Manicure tradicional, acabamento discreto e sem remoção: 40 minutos, materiais de R$ 8,00 e C = R$ 32,00. Preços arredondados para cima: R$ 33,69 (0%), R$ 40,00 (15%) e R$ 45,72 (25%). Disponibilidade de 60 minutos é compatível. Perfil Minimalista Elegante.
