# Tasks: Engine de quizzes configuráveis

**Input**: spec.md, plan.md, research.md, data-model.md e contracts/ deste diretório.
**Tests**: necessários para regras/validação por constituição VIII e critérios da especificação. Escrever casos antes da implementação correspondente e confirmar falha significativa. Nenhuma tarefa concluída nesta etapa de planejamento.

## Phase 1: Setup

- [ ] T001 Criar package.json, package-lock.json, tsconfig.json, vite.config.ts e index.html: Node 24, TypeScript strict, Vite 8.3, Zod 4, decimal.js, Vitest 5, Playwright e tsx para scripts; fixar versões compatíveis, scripts validate:quizzes/typecheck/test/build/dev/test:e2e, porta 5173 strictPort; build e dev dependem de validação.
- [ ] T002 Criar vitest.config.ts e playwright.config.ts: unitários em tests/unit, E2E em tests/e2e, servidor local automático; documentar execução suportada em Linux e não exigir Playwright local no Windows 10.

## Phase 2: Foundational

- [ ] T003 Escrever tests/unit/validation.test.ts e tests/fixtures/invalid-quizzes.ts: configurações válidas, chaves desconhecidas, duplicação, referência inválida, opções insuficientes, números inválidos, tabela incompleta/duplicada e taxa+margem >=1.
- [ ] T004 Implementar Engine/core/schema.ts: “schemaVersion = 1”, “id no padrão ^[a-z0-9]+(-[a-z0-9]+)*$”, “version no formato N.N.N”, “title não vazio”, “locale = pt-BR”, “demo = true”, “theme = rose ou teal”; objetos estritos e tipos completos de contracts/quiz-format.md.
- [ ] T005 Implementar Engine/core/validate.ts: “id único” para identificação/página/pergunta, “type = text ou email”, “label não vazio”, “required boolean”, “blocks não vazio”, “options com pelo menos duas alternativas”, “id único na pergunta”; values com “strings decimais não negativas”, “minutos inteiros e dinheiro com até duas casas”; “taxa e margens >=0 e <1”, “taxa + cada margem <1”, custos/hora não negativos; conferir referências, métricas obrigatórias, cobertura de tabelas e “perguntas usadas por regras são obrigatórias”. Fazer T003 passar.
- [ ] T006 Criar scripts/validate-quizzes.ts e Engine/content/catalog.ts: descoberta automática data/*/quiz.json, slug=id, colisões de IDs, validação pré-dev/build e runtime; erro por arquivo/propriedade ao autor, indisponibilidade amigável ao visitante; núcleo sem IO e sem logs pessoais.
- [ ] T007 Escrever tests/unit/evaluation.test.ts para caso mínimo, regras de classificação, moedas, arredondamento, prioridade sem mudança financeira, tempo insuficiente e respostas desconhecidas/incompletas; implementar Engine/core/pricing.ts e Engine/core/evaluate.ts com pricing-v1/category-table-v1 conforme contrato, sem nomes de quizzes nem eval. Validar números de referência.

## Phase 3: US1 — Responder um quiz (P1)

Objetivo: identificação, respostas e prévia. Teste independente: percurso do piloto com caso de referência.

- [ ] T008 [P] [US1] Criar tests/unit/session.test.ts: snapshot/version, retorno preservando respostas, alteração invalidando resultado, reinício e quiz diferente isolados; nenhuma persistência.
- [ ] T009 [P] [US1] Escrever tests/e2e/journey.spec.ts: identificação, email inválido, cinco perguntas, avanço bloqueado, retorno, prévia e mensagens para quiz inexistente.
- [ ] T010 [US1] Implementar Engine/core/session.ts: “quizId, version, snapshot imutável, identification, answers, pageIndex, status”, “somente memória”; valor obrigatório não vazio após trim e email por formato; transições e invalidação conforme data-model.md; fazer T008 passar.
- [ ] T011 [US1] Criar data/beleza-unhas/quiz.json com roteiro aprovado, cinco páginas, todos os valores fictícios, perfis/textos, scenario e dois packages de acabamento; somente nome/email de teste, tema rose e versão 1.0.0; validar pelo script.
- [ ] T012 [US1] Implementar Engine/main.ts, Engine/ui/app.ts e Engine/ui/form.ts: catálogo, query quiz, identificação e blocos; labels/fieldset/radios nativos, erros associados, foco, progresso, voltar, reiniciar; mensagens desconhecido/indisponível distintas sem detalhes internos.
- [ ] T013 [US1] Implementar Engine/ui/preview.ts e Engine/styles.css: perfil textual, duração, mínimo e premissas, aviso de tempo, selo fictício e temas rose/teal; contraste AA e largura 360 px; executar T009 em plataforma suportada.

## Phase 4: US2 — Resultados coerentes (P1)

Objetivo: verificar variações e recálculo. Teste independente do núcleo: respostas conhecidas retornam valores esperados; integração de interface usa US1.

- [ ] T014 [US2] Ampliar tests/unit/evaluation.test.ts com todas as 162 combinações válidas do piloto (3×3×2×3×3), determinismo, custo não negativo, tempo, taxa/margem, três preços de referência e arredondamento sempre cobrindo margem-alvo; corrigir Engine/core/pricing.ts se necessário.
- [ ] T015 [US2] Ampliar tests/e2e/journey.spec.ts para alterar alongamento/nail art/remoção com disponibilidade 60: 160 minutos e aviso; conferir versão no resultado, nenhum valor antigo e prioridade alterando só texto; ajustar Engine/ui/preview.ts se necessário.

## Phase 5: US3 — Adicionar outro quiz (P1)

Objetivo: provar reutilização por conteúdo. Teste independente: validar o segundo arquivo e suas quatro categorias; jornada usa interface de US1.

- [ ] T016 [P] [US3] Criar data/preferencia-atendimento/quiz.json: nome sem email, duas perguntas obrigatórias na mesma página, category-table-v1 com quatro combinações exatas, tema teal; sem duração, dinheiro ou relatório.
- [ ] T017 [P] [US3] Escrever tests/e2e/catalog.spec.ts: descoberta de quizzes, páginas com vários blocos, identificação configurável, quatro categorias e ausência de UI financeira no segundo quiz; testar fixtures inválidas no catálogo em tests/unit/validation.test.ts.
- [ ] T018 [US3] Documentar autoria em data/README.md e ampliar tests/unit/evaluation.test.ts com os quatro casos categóricos; provar que T016 não exigiu editar Engine e que a inserção de arquivo inválido bloqueia dev/build.

## Phase 6: US4 — Relatório demonstrativo (P2)

Objetivo: inspecionar custos, cenários e pacotes. Teste independente: renderizar relatório com resultado e respostas de teste.

- [ ] T019 [P] [US4] Criar tests/unit/report.test.ts: materiais/operacional/remuneração, taxa em reais, margem efetiva após arredondamento, três cenários e dois overrides recalculados sem recursão nem desconto inventado.
- [ ] T020 [P] [US4] Criar tests/e2e/report.spec.ts: selo fictício, três preços de referência, dois pacotes, ausência de cobrança/envio e invalidação após edição.
- [ ] T021 [US4] Implementar Engine/ui/report.ts e integrar em Engine/ui/app.ts/preview.ts; estender Engine/core/evaluate.ts para relatório com “três cenários e duas alternativas de pacote” usando respostas derivadas imutáveis; sem relatório em category-table-v1; fazer T019/T020 passar.

## Phase 7: Polish & Cross-Cutting

- [ ] T022 Criar tests/e2e/accessibility.spec.ts e ajustar Engine/styles.css/Engine/ui/form.ts: teclado completo, foco e mensagens, 360 px sem overflow, texto equivalente; verificar localStorage/sessionStorage vazios, nenhuma identificação em URL/requisições e ausência de recursos externos. Registrar inspeção manual de contraste em docs/validacao-primeira-entrega.md.
- [ ] T023 [P] Criar .github/workflows/validate.yml para Ubuntu 24.04 e Node 24: npm ci, validação, typecheck, unitários, build e Playwright Chromium; sem deploy nem segredos. Execução remota depende de repositório conectado e não deve ser declarada realizada antes disso.
- [ ] T024 Executar quickstart.md, conferir links e atualizar README.md e docs/validacao-primeira-entrega.md com comandos/resultados reais, ambiente, evidências e pendências; não marcar validação final concluída sem E2E suportado. Atualizar .gitignore para node_modules, dist e relatórios de testes.

## Dependencies & Execution Order

T001 -> T002 -> T003 -> T004 -> T005 -> T006 -> T007. Fundação inclui cálculo genérico para US1 não depender de implementação posterior em US2.
US1: T008/T009 podem ser escritos juntos após fundação; T010 e T011 antecedem T012 e T013.
US2: T014 após T011; T015 após US1. US3: T016/T017 após fundação; integração E2E após US1; T018 após ambos. US4: T019/T020 após US1; T021 após testes. T022 após todas as histórias; T023 após T001/T002, independente de T022; T024 após todo o restante.

## Parallel Examples

US1: T008 e T009 usam arquivos distintos. US2: executar sequencialmente para evitar conflito em testes/cálculos. US3: T016 e T017 podem ser preparados juntos. US4: T019 e T020 podem ser escritos juntos. [P] só indica independência após pré-requisitos, não autorização para pular dependências.

## Implementation Strategy

Primeiro incremento demonstrável: fundação + US1, com cálculo real do cenário fictício. Depois ampliar verificação US2, demonstrar segundo quiz US3 e relatório US4. Entrega completa exige as quatro histórias e validação final; não confundir protótipo parcial com todos os critérios satisfeitos.

## Cobertura

RF01 T004/T006/T010; RF02 T004/T011/T012/T016; RF03 T008/T010/T015; RF04 T003–T007; RF05 T006/T007/T018; RF06 T006/T009/T012; RF07 T011/T013/T020/T021; RF08 T005/T007/T014/T019; RF09 T010/T012/T022; RF10 T018/T024.
Sucesso 1 T016–T018; 2 T003/T007/T014; 3 T013/T022; 4 T013/T020; 5 T019–T021.
