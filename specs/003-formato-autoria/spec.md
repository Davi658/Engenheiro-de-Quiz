# Formato de autoria e rastreabilidade

Data: 2026-11-02. Etapa 1, sem implementar armazenamento ou venda.

## Histórias e aceitação
- US1: autor configura título e ordem dos blocos de prévia e relatório sem alterar Engine. Blocos desconhecidos, repetidos e incompatíveis são rejeitados; v1 continua funcionando.
- US2: autor define oferta demonstrativa separada dos preços calculados, com preço em centavos ou não definido. Não há cobrança nem proteção de conteúdo neste protótipo estático.
- US3: participante consulta fontes e limites das informações. Referências externas não validam automaticamente parâmetros numéricos. O piloto permanece demonstrativo até calibração verificável.

## Requisitos
- schemaVersion 2 exige presentation, offer e evidence. Temas locais rose/teal; texto seguro, sem HTML/CSS/código arbitrário.
- presentation.preview: title, blocks ordenados. report nulo ou template pricing-report-v1, title, blocks ordenados.
- Avisos de demonstração, premissas, fontes e versão não são removíveis por configuração.
- offer: mode demo, currency BRL, priceCents nulo ou inteiro positivo seguro. Sem relatório, preço deve ser nulo.
- evidence: sources com título, URL HTTPS, data de consulta, escopo; limitations obrigatórias. Metadados não são certificação automática.
- Preço do relatório não definido: Davi solicitou fontes reais em vez de aceitar R$19,90 arbitrário. Não presumir valor comercial.
- Preservar dados fictícios apenas como fixture demonstrativa claramente identificada; não alegar que etapa de calibração real foi concluída.

## Sucesso
Dois quizzes válidos, compatibilidade v1, teste de apresentação personalizada e oferta, testes existentes aprovados, guia de autoria e inventário de pendências de fontes.
