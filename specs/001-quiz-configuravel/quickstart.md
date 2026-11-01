# Validação após implementação

Comandos planejados: aplicação ainda não existe. Pré-requisitos: Node 24 LTS, npm e tarefas concluídas. Após criação do lockfile, executar na raiz:

```powershell
npm ci
npm run validate:quizzes
npm run typecheck
npm test
npm run build
npm run dev -- --host 127.0.0.1
```

Porta 5173 com strictPort. Build e dev validam configurações; build também verifica tipos.

1. Abrir /?quiz=beleza-unhas; usar Pessoa Teste e teste@example.com. Conferir campos obrigatórios e formato inválido antes de avançar.
2. Manicure tradicional, discreto, sem remoção, praticidade, 60 min: Minimalista Elegante, 40 min, mínimo R$ 33,69. Relatório: custo R$ 32,00 e preços R$ 33,69, R$ 40,00, R$ 45,72.
3. Voltar e selecionar alongamento, nail art, remoção, 60 min: 160 minutos e aviso; nenhum resultado antigo.
4. /?quiz=preferencia-atendimento: quatro combinações, somente nome, duas perguntas na página, sem valores financeiros.
5. /?quiz=inexistente: mensagem amigável. Fixtures inválidas testam duplicação, referência inexistente, tabela incompleta, negativos, resposta inválida e taxa+margem >=1.
6. Inspecionar dois pacotes recalculados e selo fictício. Recarregar limpa participação. Conferir ausência de armazenamento pessoal e requisições externas.
7. Percorrer por teclado, verificar foco/erros e 360 px sem rolagem horizontal.

## E2E

Windows 10 local não consta como suportado pelo Playwright. Em Ubuntu 24.04 ou plataforma suportada:

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

playwright.config.ts inicia servidor automaticamente. .github/workflows/validate.yml reproduzirá validação, tipos, unitários, build e E2E quando houver remoto configurado; não presumir serviço conectado. Registrar evidências em docs/validacao-primeira-entrega.md; ambiente indisponível é pendência, não aprovação.
