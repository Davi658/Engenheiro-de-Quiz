# Como adicionar um quiz

Cada quiz é um arquivo `data/<slug>/quiz.json`. O nome da pasta precisa ser igual ao `id` do quiz. O Engine descobre os arquivos sozinho: **não é preciso editar código** para publicar um quiz que use os recursos já suportados. O contrato completo está em [quiz-format.md](../specs/001-quiz-configuravel/contracts/quiz-format.md).

## Passo a passo

1. Crie `data/meu-quiz/quiz.json` (o slug usa só letras minúsculas, números e hífens).
2. Rode `npm run validate:quizzes`. Erros mostram arquivo, propriedade e motivo, por exemplo:
   `data/meu-quiz/quiz.json: result.rows: Tabela incompleta.`
3. Reinicie `npm run dev` (ou gere `npm run build`) e acesse `/?quiz=meu-quiz`.

`dev` e `build` executam a validação antes e **param** se algum arquivo for inválido. No navegador, um quiz inválido aparece como “Quiz indisponível”, sem detalhes internos.

## Estrutura mínima

```json
{
  "schemaVersion": 1,
  "id": "meu-quiz",
  "version": "1.0.0",
  "title": "Título exibido",
  "locale": "pt-BR",
  "demo": true,
  "theme": "teal",
  "identification": [{ "id": "nome", "type": "text", "label": "Seu nome", "required": true }],
  "pages": [
    {
      "id": "pagina-1",
      "title": "Título da página",
      "blocks": [
        { "type": "text", "text": "Texto informativo opcional." },
        { "type": "question", "id": "cor", "label": "Qual cor?", "required": true,
          "options": [{ "id": "azul", "label": "Azul" }, { "id": "verde", "label": "Verde" }] }
      ]
    }
  ],
  "result": {
    "kind": "category-table-v1",
    "questionIds": ["cor"],
    "rows": [
      { "answers": { "cor": "azul" }, "label": "Perfil Azul", "description": "Descrição." },
      { "answers": { "cor": "verde" }, "label": "Perfil Verde", "description": "Descrição." }
    ]
  }
}
```

## Regras importantes

- Chaves desconhecidas são rejeitadas. Textos são exibidos literalmente: HTML, scripts e expressões não são executados.
- `identification` pode ser vazio (o quiz começa direto nas perguntas). `type` aceita `text` ou `email`.
- IDs de campos, páginas e perguntas são únicos no quiz; IDs de alternativas são únicos na pergunta; cada pergunta de escolha tem pelo menos duas alternativas; perguntas monetárias não têm alternativas.
- Perguntas usadas por regras de resultado precisam ser obrigatórias.
- `theme`: `rose` ou `teal`. `demo` aceita boolean, mas ambos os quizzes atuais usam `true`. O valor `false` não comprova custos reais.
- Ao mudar conteúdo publicado, aumente `version`. Cada participação guarda a versão usada no resultado.

## Tipos de resultado

| `kind` | Uso | Exemplo |
| --- | --- | --- |
| `category-table-v1` | Combinação exata de respostas → categoria. A tabela deve cobrir **todas** as combinações, sem repetir. | [preferencia-atendimento](preferencia-atendimento/quiz.json) |
| `pricing-v1` | Soma minutos e materiais das alternativas, aplica cenário fictício (custo/hora, taxa, três margens com uma igual a zero) e gera prévia + relatório com dois pacotes. | [beleza-unhas](beleza-unhas/quiz.json) |

Em `pricing-v1`, valores ficam em `values` de cada alternativa como strings decimais (`"40"`, `"8.50"`): minutos inteiros e dinheiro com até duas casas. Taxa e cada margem precisam somar menos de 1. Um novo tipo de regra exige mudar o contrato e o Engine; quizzes com os tipos acima não exigem.


## Preço exato (piloto 3.0.0)

Uma pergunta com `type: "question"`, `input: "money"`, id, label e required=true recebe um preço livre, sem options. Em result, apontar actualPriceQuestion para seu id e omitir actualPriceKey. Perguntas sem input continuam de escolha única. Outros quizzes podem manter preço por alternativas usando actualPriceKey.

Entrada aceita zero, até nove dígitos inteiros e duas casas decimais com ponto ou vírgula. Não aceita separadores de milhar, negativos nem expoentes. O piloto tem seis páginas e identifica a pessoa após responder.

O preço é informado pela pessoa; materiais, taxa, despesas/hora e remuneração/hora permanecem referências fictícias. O relatório mostra excedente estimado por atendimento e por hora, após descontar a remuneração considerada. Duração zero gera resultado/hora indisponível. Dados pessoais devem ser apenas de teste.
