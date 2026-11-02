# Execução e validação do protótipo atual

Pré-requisitos: Node 24 LTS e npm. Estado atual: piloto de unhas 3.0.0; primeira especificação preservada como histórico. Correções normativas em ../002-calibracao-real/spec.md.

```powershell
npm ci
npm run validate:quizzes
npm run typecheck
npm test
npm run build
npm run dev
```

Abrir http://127.0.0.1:5173/?quiz=beleza-unhas. Responder manicure tradicional, discreto, sem remoção, praticidade, 60 minutos e preço exato 50,00. Depois informar nome/email de teste. Esperar custo 32,50, mínimo 34,22, resultado por hora 22,50 e preços 34,22 / 40,63 / 46,43 no relatório. O selo de simulação deve estar visível.

Ao editar o preço para 20,00, esperar abaixo da remuneração de referência e resultado por hora -20,25. Recarregar reinicia. O segundo quiz, /?quiz=preferencia-atendimento, não apresenta dinheiro nem relatório.

Para testes de navegador:

```sh
npx playwright install --with-deps chromium
npm run test:e2e -- --workers=1
```

Preferir Ubuntu 24.04 ou outra plataforma suportada. As execuções locais Windows 10 e suas limitações estão registradas em docs/validacao-primeira-entrega.md na raiz. O workflow remoto não deve ser considerado executado apenas por existir.
