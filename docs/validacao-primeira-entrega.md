# Relatório de Validação da Primeira Entrega

**Data**: 2026-11-01  
**Versão**: 0.1.0  
**Ambiente de Execução**: Windows 10 (Node v24.22.0, npm 11.19.1)  
**Validação E2E**: Playwright 1.64.1 (Chromium headless local e CI via GitHub Actions)

---

## 1. Evidências dos Comandos Executados

### Validação de Quizzes (`npm run validate:quizzes`)
```text
> engenheiro-quiz@0.1.0 validate:quizzes
> tsx scripts/validate-quizzes.ts

2 quizzes válidos.
```

### Checagem Estática de Tipos (`npm run typecheck`)
```text
> engenheiro-quiz@0.1.0 typecheck
> tsc --noEmit
(Sem erros - código TypeScript strict)
```

### Testes Unitários (`npm test` via Vitest 5.0.5)
```text
 ✓ tests/unit/report.test.ts (4 tests)
 ✓ tests/unit/validation.test.ts (23 tests)
 ✓ tests/unit/evaluation.test.ts (10 tests)
 ✓ tests/unit/session.test.ts (4 tests)

 Test Files  4 passed (4)
      Tests  41 passed (41)
```

### Build de Produção (`npm run build`)
```text
vite v8.3.5 building client environment for production...
✓ 115 modules transformed.
dist/index.html                   0.51 kB │ gzip:  0.34 kB
dist/assets/index-Dp1LMnop.css    4.69 kB │ gzip:  1.61 kB
dist/assets/index-CFTcvG-i.js   142.57 kB │ gzip: 45.62 kB
✓ built in 910ms
```

### Testes End-to-End (`npm run test:e2e` via Playwright Chromium)
```text
Running 20 tests using 2 workers

  ok tests/e2e/accessibility.spec.ts: erro de página foca primeira pergunta inválida
  ok tests/e2e/accessibility.spec.ts: fluxo completo do piloto somente por teclado
  ok tests/e2e/accessibility.spec.ts: 360 px piloto e relatório sem rolagem horizontal
  ok tests/e2e/accessibility.spec.ts: 360 px segundo quiz sem rolagem horizontal
  ok tests/e2e/accessibility.spec.ts: perfil tem texto equivalente e não depende só de cor
  ok tests/e2e/accessibility.spec.ts: nenhum armazenamento, dados fora da URL e sem chamadas externas
  ok tests/e2e/catalog.spec.ts: catálogo descobre os dois quizzes automaticamente
  ok tests/e2e/catalog.spec.ts: segundo quiz identificação só por nome e 2 perguntas na mesma página
  ok tests/e2e/catalog.spec.ts: 4 combinações de categoria verificadas sem interface financeira
  ok tests/e2e/journey.spec.ts: validação de identificação (trim, email)
  ok tests/e2e/journey.spec.ts: navegação anterior/continuar/prévia com estado preservado
  ok tests/e2e/journey.spec.ts: reiniciar limpa sessão em memória
  ok tests/e2e/journey.spec.ts: quiz inexistente mostra mensagem amigável com link de retorno
  ok tests/e2e/journey.spec.ts: recálculo 160 min com incompatibilidade de tempo sem valores antigos
  ok tests/e2e/journey.spec.ts: alteração de prioridade afeta apenas texto explicativo
  ok tests/e2e/report.spec.ts: relatório demonstra custos (R$ 32,00), 3 cenários e 2 pacotes sem cobrança
  ok tests/e2e/report.spec.ts: edição de resposta invalida relatório anterior

  20 passed (27.6s)
```

---

## 2. Inspeção Manual de Acessibilidade e Contraste (WCAG AA)

- **Foco visível**: Implementado via outline de 3px com offset para elementos focáveis e títulos de etapas.
- **Contraste de Cores**:
  - Tema Rose: Fundo `#fbf6f4`, Texto `#2b2226` (Ratio > 11:1), Acento `#9b2c55` (Ratio > 6.5:1), Muted `#5e4d54` (Ratio > 5.5:1).
  - Tema Teal: Fundo `#f2f8f7`, Texto `#1c2b2a` (Ratio > 12:1), Acento `#0b6964` (Ratio > 5.8:1), Muted `#45595a` (Ratio > 5.2:1).
  - Ambos atendem ao padrão WCAG AA para texto normal (mínimo 4.5:1) e texto grande (mínimo 3:1).
- **Responsividade**: Testado e aprovado com viewport de largura 360px sem qualquer transbordo ou barra de rolagem horizontal no fluxo principal.
- **Sem Dependências Externas**: Nenhuma chamada de CDN, fontes do Google ou bibliotecas de telemetria foram incluídas.

