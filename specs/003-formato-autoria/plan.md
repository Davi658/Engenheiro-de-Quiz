# Plano — autoria e dados informados

2026-11-02 | spec.md | feature 003-formato-autoria

## Contexto técnico
Manter TypeScript, Zod, Decimal, Vite, Vitest e Playwright nas versões instaladas. Aplicação web estática, respostas somente em memória. Sem novas dependências. Dois quizzes. Nenhum recurso de rede necessário para calcular; fontes são links opcionais.

## Constituição
Gates antes e depois do desenho: aprovados. Configuração validada, compatibilidade v1, fontes explícitas, sem armazenamento, sem venda. Relatório demonstrativo é público. Valores informados não são verificados independentemente.

## Desenho
Engine/core/schema.ts adiciona apresentação/oferta/fontes e vínculos opcionais de entradas numéricas aos cálculos. Engine/core/presentation.ts fornece defaults legados. Engine/ui renderiza blocos ordenados e fontes obrigatórias. Piloto usa dados fornecidos, sem presets numéricos. Preservar fixture v1 para regressão. Relatório de pacotes desabilitado no piloto: não inferir custos de outros serviços.

## Verificação
Testes de validação, fórmulas com valores declarados, fronteiras e regressão v1; navegador para fluxo móvel, edição, ordem de blocos, fontes e ausência de cobrança. Build e typecheck. Não requer backend.

