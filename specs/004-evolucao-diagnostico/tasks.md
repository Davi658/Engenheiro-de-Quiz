# Tarefas: Diagnóstico de Precificação e Saúde do Negócio para Nail Designers

- [X] T001 [Motor/Core] Estender `Engine/core/schema.ts` para suportar `schemaVersion: 3`, resultado `business-diagnosis-v1`, novos tipos de entrada (`multi-choice`, `number`, `custom-text`), blocos condicionais (`condition`) e catálogo declarativo de recomendações.
- [X] T002 [Motor/Core] Atualizar `Engine/core/answers.ts` e `Engine/core/validate.ts` com validação de novos tipos de entrada, unicidade de identificadores e integridade referencial mantendo compatibilidade v1 e v2.
- [X] T003 [Motor/Core] Implementar `Engine/core/business.ts` com os cálculos determinísticos via Decimal.js (receita de serviços e combos sem dupla contagem, custos de materiais, margens de contribuição, despesas fixas com rateio e periodicidade, capacidade e ocupação, preço sugerido Sebrae, ponto de equilíbrio, e cenários 30/60/90 dias).
- [X] T004 [Motor/Core] Integrar `Engine/core/evaluate.ts` e `Engine/core/presentation.ts` para processar e estruturar os resultados da prévia e do relatório de `business-diagnosis-v1`.
- [X] T005 [Testes/Unit] Criar `tests/unit/business.test.ts` com testes unitários cobrindo todos os cálculos: serviços avulsos, combos, exclusão de volume duplicado, despesas compartilhadas, capacidade de atendimento, omissão de blocos opcionais e tratamento de zero vs ausente.
- [X] T006 [Motor/UI] Estender `Engine/ui/form.ts` para renderizar `multi-choice`, campos numéricos com unidade, campos de texto personalizado e avaliação condicional de blocos por página.
- [X] T007 [Motor/UI] Implementar renderizadores em `Engine/ui/preview.ts` e `Engine/ui/report.ts` para os blocos da prévia gratuita e do relatório executivo demonstrativo (DRE, capacidade, precificação Sebrae, finanças pessoais se presentes, reservas e plano de ação).
- [X] T008 [Motor/UI] Ajustar `Engine/styles.css` e `Engine/ui/app.ts` para suporte responsivo (360px), estados visuais, avisos de autodeclaração e navegação por teclado.
- [X] T009 [Conteúdo] Reformular `data/beleza-unhas/quiz.json` com as 9 etapas completas, textos explicativos, técnicas da área, categorias de despesas, fontes legais/metodológicas (Sebrae, LGPD, CDC) e recomendações declarativas.
- [X] T010 [Testes/E2E] Atualizar e expandir a suíte de testes Playwright (`tests/e2e/`) cobrindo o fluxo de 9 etapas do diagnóstico no navegador, teste de 360px, acessibilidade por teclado e compatibilidade com o quiz de preferências.
- [X] T011 [Verificação] Executar `npm run validate:quizzes`, `npm run typecheck`, `npm test` e `npx playwright test`, corrigindo qualquer inconsistência até 100% de aprovação.
- [X] T012 [Documentação] Atualizar `README.md` e registrar documentação técnica das fontes e cálculos implementados.
