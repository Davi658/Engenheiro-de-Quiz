# Modelo

Quiz v2 mantém perguntas e regras e exige presentation, offer e evidence. presentation contém preview e report anulável; blocos são enums ordenados sem duplicatas. offer possui mode demo, currency BRL e priceCents positivo seguro ou null. evidence contém sources (title,url,accessedOn,scope) e limitations.

pricing-v1 pode declarar inputs: minutes, materials, operatingHourly, compensationHourly, feePercent, marginPercent1, marginPercent2. Cada vínculo referencia pergunta numérica obrigatória distinta. Nesse modo nenhum parâmetro financeiro pré-fixado é usado: entradas substituem cenário e contribuições. Taxa mais cada margem deve ser menor que 100%; duração positiva. Pacotes não disponíveis sem dados específicos.

Respostas e snapshot permanecem somente na memória da página.
