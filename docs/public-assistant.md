# Assistente Público VnA

## Função

O Assistente Público VnA orienta visitantes dentro do site oficial do Vida no Altar.

Ele ajuda a:

- conhecer o VnA;
- entender projetos;
- encontrar conteúdos cadastrados;
- descobrir por onde começar;
- iniciar um diagnóstico futuro para escolha de Bíblia.

## Local

O widget aparece no site público, no canto inferior direito.

Arquivos:

```text
assets/vna-intelligence.js
assets/vna-intelligence.css
content/public-assistant.json
content/content-catalog.json
content/product-catalog.json
content/vna-core.json
```

## Modos

Descobrir:
Para quem não sabe por onde começar.

Encontrar:
Para procurar conteúdo por tema, projeto, versículo ou formato.

Entender:
Para entender o que é o VnA e seus projetos.

Escolher:
Para recomendação futura de Bíblias e livros.

## Como editar respostas

Edite:

```text
content/public-assistant.json
```

Cada intenção pode conter:

- `id`
- `keywords`
- `response`
- `quickReplies`
- `links`
- `useCatalogSearch`
- `startBibleFlow`

Use linguagem cristã, simples, respeitosa e brasileira. Evite jargões difíceis e promessas que o projeto não entrega.

## Como editar busca de conteúdos

Edite:

```text
content/content-catalog.json
```

O assistente procura por título, projeto, formato, tema, versículos, público e descrição curta.

Se não houver link direto, use `"#"`.

## Como funciona o fluxo de Bíblia

O fluxo fica em:

```text
content/product-catalog.json
```

O assistente faz uma pergunta por vez. Ele considera tradução usada na igreja, compreensão da pessoa, uso principal, orçamento, tamanho, letra e loja preferida.

Ele não afirma que uma tradução é espiritualmente superior a outra.

## Limites

O Assistente Público:

- não é pastor;
- não é psicólogo;
- não é conselheiro espiritual individual;
- não decide a vontade de Deus para a pessoa;
- não entra em briga de tradução bíblica;
- não inventa conteúdo;
- não inventa produto;
- não inventa link;
- não recomenda produto por comissão.

Quando não souber, usa fallback seguro.

## Desativar o widget

Remova de `index.html`:

```html
<link rel="stylesheet" href="assets/vna-intelligence.css" />
<script src="assets/vna-intelligence.js" defer data-vna-intelligence="public"></script>
```
