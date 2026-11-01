# Contrato da interface

- / mostra seleção; /?quiz=<id> mostra identificação. ID desconhecido retorna erro amigável e link para seleção.
- Informar uso exclusivo de dados de teste antes de nome/email. Sem envio de email.
- Cada página renderiza todos os blocos. Piloto: cinco páginas com uma pergunta; segundo quiz: uma página com duas perguntas.
- Form, label, fieldset/legend e radios nativos. Anterior/Continuar/Ver prévia. Enter submete; erro foca primeiro campo inválido com aria-describedby. Título recebe foco após troca de página. Progresso textual “Página X de Y”.
- Trim na identificação, formato de email, sem exigir duas palavras no nome. Opções ausentes ou manipuladas bloqueiam conclusão.
- Prévia com perfil textual, duração, compatibilidade, mínimo e premissas no piloto. Selo de simulação em todos os resultados. Sem termômetro de risco pessoal.
- “Ver relatório de demonstração” apenas em pricing-v1. Relatório com custos, três cenários e dois pacotes, sem compra ou promessa de envio.
- Editar invalida resultados; reiniciar limpa memória. Sem identidade/respostas em URL, logs, storage ou rede.
- Temas rose/teal com tokens locais e contraste WCAG AA para texto; foco visível, texto equivalente e verificação em 360 px e desktop.
- Sem analytics, fontes ou recursos externos. Requisições de recursos locais não devem incluir dados pessoais.
