# Correções autorizadas em 2026-11-02

Este documento substitui as afirmações de calibração real da especificação/plano anteriores. Os valores de materiais, despesas, remuneração e taxas são referências fictícias sem comprovação individual. O piloto volta a demo=true e passa à versão 3.0.0 pela mudança de formato da resposta de preço.

## Comportamento

- Campo monetário livre, obrigatório: aceitar vírgula ou ponto decimal, zero e no máximo duas casas; rejeitar negativos, agrupadores de milhar, expoentes, valores não numéricos e mais de nove dígitos inteiros. Preservar entrada ao voltar; normalizar apenas para calcular.
- A comparação usa o preço exato informado, nunca o limite de uma faixa. Continua sendo simulação com custos de referência, não diagnóstico de lucro real.
- Distinguir déficit operacional, remuneração abaixo da referência, equilíbrio (resultado exatamente zero) e resultado positivo. Não rotular qualquer resultado positivo como margem saudável garantida.
- Resultado estimado por atendimento = preço menos taxa e custos totais, incluindo remuneração de referência. Resultado estimado por hora = esse resultado × 60 / minutos estimados; duração zero exibe “Não disponível”, sem divisão por zero. Informar que esse resultado é excedente após a remuneração considerada, não remuneração líquida no bolso.
- Exibir resultado por hora na prévia e no relatório; custos, selos e mensagens devem identificar a simulação.
- Preservar fluxo perguntas -> identificação -> prévia e o quiz categórico.

## Plano

Adicionar input=money às perguntas do contrato, mantendo escolha única como padrão. Input monetário não tem alternativas e só pode ser usado como referência de preço praticado nesta versão. Validação de página e avaliação final compartilham a mesma normalização. Manter compatibilidade com quizzes anteriores que configuram preços por alternativas, mas o piloto passa a preço exato.

## Critérios de aceitação

R$ 20,00 não se converte em R$ 35,00. R$ 40,00 e R$ 1.000,00 podem ser informados sem faixas (digitar 1000,00). Preço 100, taxa 5% e custo total 95 retornam equilíbrio e zero, sem afirmar lucro positivo. No caso mínimo do piloto, preço 50, custo 32,50 e taxa 5% retornam excedente 15 por atendimento e 22,50 por hora (40 minutos). Mudança de preço invalida relatório anterior. Nenhuma tela promete custo real personalizado.
