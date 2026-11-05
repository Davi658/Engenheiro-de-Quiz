# Engenheiro de Quizzes

Projeto de Davi Diniz para executar quizzes web a partir de definições próprias, apresentar uma prévia e oferecer relatórios completos pagos, entregues por email.

## Documentação inicial

- [Visão do produto](docs/visao-do-produto.md)
- [Proposta de princípios](docs/principios-propostos.md)
- [Escopo da primeira entrega](docs/primeira-entrega.md)
- [Quiz piloto de beleza](docs/quiz-beleza.md)

Spec Kit 1.2.5 instalado localmente com Python 3.14 e integração Codex. Constituição e especificações foram redigidas seguindo as skills e os modelos instalados. O piloto de beleza de unhas 5.0.0 adota o formato de autoria v3 (`schemaVersion: 3`) com diagnóstico autodeclarado de negócio em 9 etapas, metodologia Sebrae de formação de preços, DRE gerencial, auditoria de capacidade e plano de ação em 30/60/90 dias, mantendo compatibilidade integral com quizzes em versões anteriores.

- [Constituição v1.0.0](.specify/memory/constitution.md)
- [Especificação da primeira funcionalidade](specs/001-quiz-configuravel/spec.md)
- [Especificação de calibração e preço exato](specs/002-calibracao-real/spec.md)
- [Especificação de formato de autoria e evidências](specs/003-formato-autoria/spec.md)
- [Especificação de evolução para diagnóstico de negócio](specs/004-evolucao-diagnostico/spec.md)
- [Como adicionar um quiz](data/README.md)

## Como rodar o projeto

Pré-requisitos: Node 24 LTS e npm.

```bash
# Instalar dependências
npm ci

# Validar configurações de quizzes
npm run validate:quizzes

# Checagem estática de tipos
npm run typecheck

# Executar testes unitários (Vitest)
npm test

# Executar testes ponta a ponta (Playwright)
npm run test:e2e

# Build de produção
npm run build

# Iniciar servidor de desenvolvimento local
npm run dev
```

Acesse no navegador: `http://127.0.0.1:5173` ou diretamente `http://127.0.0.1:5173/?quiz=beleza-unhas`.

## Próximos passos

A evolução 005 conecta objetivos pessoais/profissionais e público atendido ao plano de 30/60/90 dias. Na primeira página, informe seu objetivo; na etapa de divulgação, informe o que suas clientes valorizam. O relatório mostra a direção escolhida e permite copiar voluntariamente um texto com apenas o objetivo. Preço definido: R$19,90 por resultado único; oferta ainda demonstrativa, sem cobrança.

Consulte [a análise comercial e os cenários de conversão](docs/analise-comercial-e-conversao.md) e [o escopo desta evolução](specs/005-plano-evolucao/spec.md). Não há taxa de compra observada. Antes de venda real, revisar as simplificações financeiras documentadas e implementar pagamento/entrega verificáveis.

1. Implementar backend e gateway de pagamento em etapas futuras.
2. Armazenamento de dados reais e entrega por email.
3. Personalização dinâmica das entradas de custo e jornada de trabalho da profissional.
