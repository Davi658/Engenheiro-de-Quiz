# Implementation Plan: Engine de quizzes configuráveis

**Feature**: 001-quiz-configuravel | **Date**: 2026-11-01 | **Spec**: [spec.md](spec.md)
**Branch**: nenhuma branch Git criada; identificador corresponde à funcionalidade ativa.

## Summary
Aplicação estática HTML/CSS com TypeScript. JSON em data/ define conteúdo e regras suportadas; Engine valida, controla participação e calcula resultados. Entregar piloto de unhas, segundo quiz categórico e relatório demonstrativo sem compra.

## Technical Context
**Language/Version**: TypeScript >=5.5 strict; Node 24 LTS (24.22.0 local), npm 11.19.1.
**Primary Dependencies**: Vite 8.3, Zod 4, decimal.js; fixar versões exatas compatíveis em package-lock.json na implementação.
**Storage**: JSON versionado; participação apenas em memória.
**Testing**: Vitest 5; Playwright em Ubuntu 24.04 suportado, inspeção manual local.
**Target Platform**: navegadores modernos desktop/móvel; desenvolvimento Windows 10. Playwright não declara suporte ao Windows 10.
**Project Type**: aplicação web estática, sem API.
**Performance Goals**: navegação e cálculo sem requisições externas; sem benchmark de produção nesta entrega.
**Constraints**: dados de teste, pt-BR, 360 px sem rolagem horizontal, teclado, configuração sem código executável.
**Scale/Scope**: dois quizzes; piloto com cinco perguntas; prévia e relatório demonstrativo.

## Constitution Check
Antes da pesquisa e após desenho: todos os gates atendidos.
- I: dois quizzes por descoberta automática, sem registro manual no Engine.
- II: Zod estrito e validação semântica antes de dev/build e no carregamento; sem eval/HTML bruto.
- III: snapshot de definição e versão por participação e resultado.
- IV: sem persistência, logs pessoais, integrações ou credenciais.
- V/VI: pagamento e entrega não implementados; nenhum dado do cliente autoriza compra. Backend obrigatório em etapa futura.
- VII: formulários semânticos, foco, texto equivalente e layout móvel.
- VIII: testes de regras, validação e jornadas; limitações registradas.
- IX: todas as estimativas identificadas como fictícias, escolhas técnicas documentadas.

## Project Structure
### Documentation (this feature)
spec.md, plan.md, research.md, data-model.md, contracts/quiz-format.md, contracts/ui.md, quickstart.md e tasks.md.

### Source Code (repository root)
```text
data/{beleza-unhas,preferencia-atendimento}/quiz.json
Engine/core/{schema,validate,evaluate,pricing,session}.ts
Engine/content/catalog.ts
Engine/ui/{app,form,preview,report}.ts
Engine/main.ts
Engine/styles.css
scripts/validate-quizzes.ts
tests/unit/{validation,evaluation,session,report}.test.ts
tests/fixtures/invalid-quizzes.ts
tests/e2e/{journey,catalog,report,accessibility}.spec.ts
index.html
package.json
package-lock.json
tsconfig.json
vite.config.ts
vitest.config.ts
playwright.config.ts
.github/workflows/validate.yml
```
**Structure Decision**: manter data e Engine. Núcleo puro sem DOM/Vite/rede; catálogo usa import.meta.glob e validação usa filesystem com o mesmo núcleo. Nenhuma abstração de provedores futuros.

## Design
Fase 0: decisões em research.md. Fase 1: entidades, contratos e guia de validação. Implementação somente após tarefas e análise.
Zod é fonte executável do contrato. Validador semântico confere referências, unicidade, cobertura de tabelas e números. Estratégias pricing-v1 e category-table-v1 usam parâmetros declarativos, sem nomes de serviços/perfis codificados no Engine. Novo tipo de regra exige alteração explícita do contrato; novo quiz com recursos existentes não exige código.
Rota /?quiz=<slug>; sem slug mostra catálogo. Estado em memória, recarregar reinicia. Todo conteúdo do protótipo é público demonstrativo. Pagamento e relatório privado exigirão backend; cálculos puros poderão ser reaproveitados sem confiar em resultados enviados pelo navegador.

## Complexity Tracking
Nenhuma violação. Sem banco, servidor de negócio, framework de componentes ou linguagem de regras arbitrárias.
