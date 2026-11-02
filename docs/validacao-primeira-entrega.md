# Validação atual do protótipo

**Data:** 2026-11-02
**Piloto de unhas:** 3.0.0, simulação com custos fictícios e preço exato informado.
**Ambiente efetivamente utilizado:** Windows 10, Node 24.22.0, npm 11.19.1, Playwright 1.64.1/Chromium local.

## Resultados executados nesta correção

| Verificação | Resultado observado |
| --- | --- |
| Spec Kit check-prerequisites -RequireSpec -RequireTasks -IncludeTasks | Resolve specs/002-calibracao-real corretamente |
| npm test | 5 arquivos, 70 testes aprovados |
| npm run typecheck | Sem erros |
| npm run build | Dois quizzes válidos; tipos e build aprovados |
| npm run test:e2e -- --workers=1 | 20 aprovados; teste novo falhou somente por expectativa do formato do sinal negativo |
| npm run test:e2e -- tests/e2e/corrections.spec.ts --workers=1 | Aprovado após corrigir expectativa de “-R$” para “R$ -”, sem alteração de código da aplicação |
| git diff --check | Sem erros de whitespace |

Os 21 cenários de navegador foram cobertos pelas duas execuções acima. Não foi realizada uma nova execução integral após a correção exclusiva da expectativa do teste.

## Casos de regressão

- 162 combinações de respostas categóricas, cada uma com cinco amostras de preço livre (810 avaliações).
- Entrada 20,00 usa exatamente 20; aceita ponto/vírgula, zero e 1000,00; rejeita vazio, negativo, expoente, separador de milhar, excesso de casas/dígitos.
- Preço 100, taxa 5%, custo 95: equilíbrio exato, sem mensagem de lucro positivo. Fronteiras 99,99 e 100,01 também verificadas.
- Caso mínimo com preço 50 e custo 32,50: excedente estimado de 15 por atendimento e 22,50 por hora, após remuneração de referência.
- Duração zero retorna null no resultado por hora, apresentado como indisponível.
- Campo de preço preservado ao editar; erros acessíveis; recálculo chega à prévia e ao relatório.
- Formato monetário livre validado em schema/regra/página/avaliação; compatibilidade preservada para preço por alternativas em outros conteúdos.
- Teclado, foco, viewport 360 px sem overflow e ausência de dados pessoais em URL/storage/requisições testados. Segundo quiz categórico preservado.

## Limitações e escopo

O Windows 10 local não consta entre plataformas oficialmente suportadas pelo Playwright adotadas no plano. Os testes passaram localmente, mas não comprovam execução em Linux. O workflow Ubuntu existe; não foi disparado nem verificado remotamente nesta sessão. Não há auditoria visual completa ou nova medição manual de contraste nesta correção.

Os custos continuam referências fictícias e não comprovam a situação individual da profissional. Não foram implementados pagamento, email, PDF ou persistência. Os testes e o build precisaram de execução autorizada fora das restrições locais devido ao executor TypeScript/navegador.
