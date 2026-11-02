# Engenheiro de Quizzes

Projeto de Davi Diniz para executar quizzes web a partir de definições próprias, apresentar uma prévia e oferecer relatórios completos pagos, entregues por email.

## Documentação inicial

- [Visão do produto](docs/visao-do-produto.md)
- [Proposta de princípios](docs/principios-propostos.md)
- [Escopo da primeira entrega](docs/primeira-entrega.md)
- [Quiz piloto de beleza](docs/quiz-beleza.md)

Spec Kit 1.2.5 instalado localmente com Python 3.14 e integração Codex. Constituição e especificações foram redigidas seguindo as skills e os modelos instalados. O piloto de unhas 4.0.0 adota o formato de autoria v2 (`schemaVersion: 2`) com apresentação modular (`presentation`), oferta transparente (`offer`) e fontes metodológicas declaradas (`evidence`). Os resultados utilizam custos de referência para fins de simulação e orientação gerencial.

- [Constituição v1.0.0](.specify/memory/constitution.md)
- [Especificação da primeira funcionalidade](specs/001-quiz-configuravel/spec.md)
- [Especificação de calibração e preço exato](specs/002-calibracao-real/spec.md)
- [Especificação de formato de autoria e evidências](specs/003-formato-autoria/spec.md)
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

1. Implementar backend e gateway de pagamento em etapas futuras.
2. Armazenamento de dados reais e entrega por email.
3. Personalização dinâmica das entradas de custo e jornada de trabalho da profissional.
