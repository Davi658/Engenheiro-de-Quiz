# Especificação: Diagnóstico de Precificação e Saúde do Negócio para Nail Designers

Data: 2026-11-04
Status: Em implementação
Alvo: `data/beleza-unhas/quiz.json` e motor `Engine/`

## 1. Objetivo e Escopo

Evoluir o quiz do piloto de Nail Designers de um cálculo de atendimento isolado para um diagnóstico completo e autodeclarado do negócio de manicure/nail designer autônoma, com aprofundamento opcional de finanças pessoais, reservas e histórico mensal.

Preservar a arquitetura de motor configurável (`Engine/`), garantindo compatibilidade total com os quizzes existentes (`preferencia-atendimento` e schemas anteriores v1 e v2), sem introduzir frameworks desnecessários e mantendo a execução puramente em memória (sem logs de dados pessoais, sem parâmetros de identificação na URL e sem dependência de serviços externos).

## 2. Princípios Constitucionais e Metodologia

1. **Dados Autodeclarados**: Todos os valores (preços, durações, materiais, custos, despesas, retiradas e receitas) são informados pela usuária. Não preencher com médias de mercado nem inventar dados ausentes.
2. **Diferenciação Estrita**: Diferenciar valor zero ($0,00$), valor estimado, valor não informado e "Não se aplica".
3. **Fundamentação sem Alegações Fictícias**: Fontes externas (Sebrae, LGPD, CDC) fundamentam a metodologia de formação de preço (markup divisor sobre custos variáveis, despesas operacionais e remuneração) e a transparência com o consumidor. Não afirmar "médias técnicas de mercado" sem comprovação.
4. **Demonstração Segura**: Protótipo local executado no navegador, sem cookies de rastreamento, sem envio de formulário para servidores e sem persistência em disco.

## 3. Fluxo do Quiz (9 Etapas)

### Etapa 1: Serviços Oferecidos
- Seleção múltipla de procedimentos comuns:
  - Manicure tradicional (cutilagem e esmaltação comum)
  - Esmaltação em gel / Blindagem
  - Alongamento em fibra de vidro ou gel
  - Manutenção de alongamento
  - Remoção de alongamento / esmalte gel
  - Nail art / Decoração adicional
  - Opção de adicionar "Outro serviço" com nome customizado e identificador interno estável.
- Classificação: serviço avulso, adicional ou combo.

### Etapa 2: Experiência e Interesses
- Grade de técnicas da área (mesmo aquelas ainda não ofertadas):
  - Cutícula russa / combinada
  - Esmaltação em gel
  - Blindagem e nivelamento estruturado
  - Alongamento fibra de vidro
  - Moldes F1 / Dual forms
  - Nail art encapsulada e pedrarias
- Para cada técnica:
  - Autoavaliação: *Nunca aprendi*, *Estou aprendendo*, *Realizo com ajuda*, *Realizo com autonomia*.
  - Interesse em aprender/aprimorar: *Sim*, *Não*.
- Possibilidade de pular técnicas sem interesse.

### Etapa 3: Dados dos Serviços e Combos
- Para cada serviço avulso/adicional selecionado:
  - Tempo médio total de execução (minutos).
  - Preço cobrado por atendimento (R$).
  - Custo dos materiais consumidos por atendimento (R$) com orientação explicativa (custo por aplicação $\neq$ valor do frasco cheio).
  - Quantidade média de atendimentos por mês.
- Para combos configurados/selecionados:
  - Serviços incluídos.
  - Preço total cobrado.
  - Tempo total de mesa.
  - Custo total de materiais consumidos.
  - Quantidade média de combos por mês.
- Regra de não duplicação: a quantidade de serviços avulsos é informada como atendimentos fora dos combos para evitar dupla contagem de receita, insumos ou tempo.
- Remoção: desmarcar um serviço remove seus dados dos cálculos.

### Etapa 4: Local e Capacidade de Trabalho
- Modalidades de atendimento:
  - Espaço próprio
  - Espaço alugado / sublocação de sala
  - Espaço compartilhado / comissão em salão parceiro
  - Atendimento em residência própria (home studio)
  - Atendimento em domicílio das clientes
  - Combinação de mais de uma modalidade
- Capacidade semanal e mensal:
  - Dias disponíveis para trabalho por semana.
  - Horas disponíveis por dia.
  - Horas semanais ou mensais dedicadas a preparação, esterilização, limpeza de bancada, compras/administração e deslocamentos (com definição clara para não duplicar com o tempo de atendimento).

### Etapa 5: Despesas Profissionais do Negócio
- Categorias pertinentes normalizadas para referência mensal:
  - Aluguel, condomínio e taxa de espaço
  - Energia elétrica, água, internet e telefone
  - Produtos de limpeza, higienização e descartáveis gerais
  - Manutenção de equipamentos (cabines, motores, autoclave) e reposição
  - Transporte, combustível e estacionamento
  - Sistemas, softwares de agendamento e contabilidade/MEI
  - Taxas médias sobre pagamentos (cartão/PIX) e impostos
  - Possibilidade de despesa personalizada
- Periodicidade (mensal, anual convertida em mensal).
- Em despesas compartilhadas (ex.: espaço em casa, internet ou veículo): informar percentual atribuído ao trabalho ($0\%$ a $100\%$) para distinguir rateio operacional de desembolso pessoal efetivo.

### Etapa 6: Finanças Pessoais (Opcional)
- Bloco que pode ser pulado integralmente sem interromper o diagnóstico profissional.
- Modo resumido ou detalhado por categorias:
  - Moradia e habitação
  - Alimentação e supermercado
  - Contas residenciais (água, luz, telecomunicações)
  - Transporte pessoal
  - Dependentes e despesas familiares essenciais
  - Outras despesas pessoais
  - Outras fontes de renda da casa
  - Retirada atual (pró-labore que retira hoje)
  - Retirada necessária ou desejada
- Privacidade: nenhum documento, número de conta bancária ou nome de dependente é solicitado.
- Despesas compartilhadas já rateadas na etapa 5 não são cobradas em duplicidade.

### Etapa 7: Divulgação e Aquisição de Clientes
- Canais utilizados: Instagram orgânico, Anúncios pagos (tráfego), Parcerias locais, Indicação/Boca a boca, WhatsApp/Lista de transmissão.
- Gasto mensal aproximado por canal.
- Tempo semanal/mensal dedicado a redes sociais e captação (se souber).
- Estimativa de novas clientes mensais por canal (se souber).
- Não calcular CAC sem dados suficientes; centralizar gastos de marketing para não somar em duplicidade com as despesas fixas da Etapa 5.

### Etapa 8: Reservas, Investimentos e Dívidas (Aprofundamento Opcional)
- Bloco opcional com preenchimento granular:
  - Caixa de giro do negócio.
  - Reserva de emergência pessoal.
  - Valores separados para compromissos futuros (ex.: reposição anual, 13º/férias próprias).
  - Dívidas profissionais e parcelamentos ativos (valor da parcela mensal e parcelas restantes, se souber).
  - Dívidas pessoais (se preenchido).
- Limitação transparente de conclusões na ausência de dados.

### Etapa 9: Histórico Mensal (Opcional)
- Linha do tempo de até 12 meses (permitindo preencher de 1 a 12 meses disponíveis, ex.: últimos 3 meses):
  - Faturamento bruto recebido dos serviços.
  - Despesas e pagamentos totais efetuados no mês.
  - Retiradas pessoais realizadas no mês.
  - Campo indicativo de "valor estimado" por mês.
- Não somar histórico à rotina mensal estimada: são duas visões complementares (rotina contratada/estimada vs. fluxo histórico realizado). Apontar eventuais divergências entre a rotina teórica e o faturamento histórico.

## 4. Metodologia de Cálculo Determinística

Todos os cálculos usam representação de alta precisão (`Decimal.js`), sem arredondamentos prematuros:
1. **Receita Bruta Estimada Mensal**:
   $$R_{\text{mensal}} = \sum (P_{\text{avulso}} \times Q_{\text{avulso}}) + \sum (P_{\text{combo}} \times Q_{\text{combo}})$$
2. **Custos Variáveis de Materiais**:
   $$C_{\text{materiais}} = \sum (M_{\text{avulso}} \times Q_{\text{avulso}}) + \sum (M_{\text{combo}} \times Q_{\text{combo}})$$
3. **Custos Variáveis Financeiros**:
   $$C_{\text{taxas}} = R_{\text{mensal}} \times \text{taxa\_media}$$
4. **Margem de Contribuição Total e por Serviço**:
   $$MC_{\text{total}} = R_{\text{mensal}} - C_{\text{materiais}} - C_{\text{taxas}}$$
   $$MC_{\text{serviço}} = P_{\text{serviço}} \times (1 - \text{taxa\_media}) - M_{\text{serviço}}$$
   $$MC/\text{hora}_{\text{serviço}} = \frac{MC_{\text{serviço}}}{\text{Duração em horas}}$$
5. **Despesas Fixas Operacionais Mensais**:
   $$DF = \sum (\text{Valor mensal} \times \%_{\text{trabalho}}) + \text{Gastos marketing fixos}$$
6. **Capacidade e Ocupação**:
   $$\text{Horas Atendimento Disponíveis} = \text{Horas Disponíveis Totais} - \text{Horas Apoio/Limpeza/Deslocamento}$$
   $$\text{Horas Demandadas} = \sum (\text{Duração minutos} \times Q) / 60$$
   $$\text{Taxa de Ocupação} = \frac{\text{Horas Demandadas}}{\text{Horas Atendimento Disponíveis}}$$
7. **Ponto de Equilíbrio Operacional**:
   $$PE_{\text{operacional}} = \frac{DF}{\text{Margem Contribuição Média \%}}$$
8. **Resultado Líquido do Negócio**:
   $$\text{Lucro Operacional} = MC_{\text{total}} - DF - \text{Retirada Atual}$$
9. **Preço Sugerido por Serviço (Metodologia Sebrae)**:
   $$\text{Custo Hora Fixa} = \frac{DF}{\text{Horas Demandadas (ou disponíveis)}}$$
   $$\text{Custo Hora Remuneração} = \frac{\text{Retirada Pretendida}}{\text{Horas Demandadas (ou disponíveis)}}$$
   $$\text{Custo Base} = M + \left(\frac{\text{Duração}}{60}\right) \times (\text{Custo Hora Fixa} + \text{Custo Hora Remuneração})$$
   $$\text{Preço Sugerido} = \frac{\text{Custo Base}}{1 - \text{Taxa} - \text{Margem Alvo}}$$

## 5. Prévia Gratuita e Relatório Completo Demonstrativo

- **Prévia Gratuita**:
  - Resumo de serviços ativos e tempo médio de mesa.
  - Faturamento mensal estimado e margem de contribuição média.
  - Indicador de capacidade e taxa de ocupação (com alerta se ultrapassar 100%).
  - Comparativo dos serviços mais e menos rentáveis por hora de dedicação.
  - 2 a 3 pontos prioritários de ajuste baseados estritamente nas respostas.
  - Declaração de premissas, limitações e campos não preenchidos.
- **Relatório Completo (Demonstrativo)**:
  - Resumo executivo do negócio.
  - Demonstração do resultado operacional estimado (DRE simples).
  - Análise detalhada de cada serviço e combo (preço atual vs preço sugerido).
  - Diagnóstico de capacidade e rotina de trabalho.
  - Quadro pessoal (se preenchido) comparando retirada atual com necessidade familiar.
  - Quadro de reservas, endividamento e fluxo de caixa.
  - Plano de ação priorizado para 30, 60 e 90 dias.
  - Cenários de sensibilidade (aumento de preço, otimização de tempo, redução de despesas).
  - Metodologia documentada com links para referências oficiais.

## 6. Suporte Declarativo a Recomendações e Afiliados

- Suporte estruturado no modelo de dados para recomendações de aprimoramento e materiais.
- Recomendações só são exibidas quando houver regras declarativas correspondentes às respostas autodeclaradas (ex.: técnica com interesse em aprender e autoavaliação 'nunca aprendi' ou 'estou aprendendo').
- Não exibir itens fictícios: sem catálogo real verificado, a lista permanece vazia ou exibe orientações gratuitas verificadas.

## 7. Critérios de Aceitação e Verificação

- **AC1 (Engine Configurável)**: Engine aceita novos tipos de entrada (múltipla escolha, numérico com unidade, despesas repetidas/categorizadas, registros mensais e blocos condicionais) sem quebrar quizzes anteriores (`preferencia-atendimento` e schema v1/v2).
- **AC2 (Validação Estrita)**: Todos os identificadores são validados; entradas numéricas rejeitam valores negativos inválidos e formatam corretamente decimais.
- **AC3 (Cálculos Determinísticos)**: Testes unitários cobrem cenários com serviços avulsos, combos, exclusão mútua de volume, despesas compartilhadas, capacidade excedida e omissão de blocos opcionais.
- **AC4 (Acessibilidade e Mobile)**: Interface funcional em viewport móvel de 360px sem transbordamento horizontal; navegação completa por teclado.
- **AC5 (Privacidade)**: Respostas em memória durante a sessão; nenhum dado pessoal persistido em localStorage, URL ou enviado para servidores.
- **AC6 (Testes de Regressão)**: 100% dos testes unitários e de integração E2E existentes continuam passando, além da nova suíte de testes do diagnóstico.

