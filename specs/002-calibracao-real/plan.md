# Implementation Plan: correções da comparação de preço

**Feature**: 002-calibracao-real | **Updated**: 2026-11-02

## Summary

Preservar TypeScript/Vite, Zod e Decimal.js. Adicionar input=money ao contrato de pergunta, com escolha única como padrão. Preço livre não tem options; preço por alternativas continua suportado para outros conteúdos. Piloto passa a versão 3.0.0, demo=true, preço livre.

## Technical Context

- Normalização de moeda e validação de respostas em Engine/core/answers.ts, compartilhadas por session.ts e evaluate.ts.
- Schema exige alternativas para choice e nenhuma para money. Validação semântica permite money apenas como actualPriceQuestion, sem actualPriceKey; demais estratégias continuam categóricas.
- pricing.ts mantém status healthy por compatibilidade interna, mas texto do produto diz resultado estimado positivo. Novo status break_even para zero exato.
- profitPerHour = profit * 60 / minutos estimados; null se minutos=0.
- Interface mostra ressalvas e resultado por hora na prévia/relatório. Entrada via text/inputmode=decimal para suportar vírgula sem arredondamento do navegador.
- Estado exclusivamente em memória; nenhum serviço externo.

## Constitution Check

Motor configurável, validação centralizada, snapshot versionado e privacidade preservados. Simulação explícita atende ao princípio IX. Pagamentos e entrega continuam fora do escopo. Testes cobrem cálculo, entradas e navegação.

## Validation

Unitários com preços exatos, zero, erros de formato, referências de schema e quatro estados. E2E com teclado, preenchimento/edição do preço, resultado/hora, aviso de simulação, 360 px e quiz categórico. Build, typecheck e validação dos dois JSON. Resultados reais registrados em docs/validacao-primeira-entrega.md, com plataforma e limitações.
