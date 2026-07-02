# Assistentes VnA

## Visão geral

Os Assistentes VnA são uma camada simples, estática e própria do Vida no Altar para orientar visitantes e o administrador do site.

Eles não são IA generativa. As respostas são controladas em arquivos JSON e escolhidas por um motor de intenções baseado em palavras-chave e pontuação.

## Arquitetura

Arquivos principais:

- `assets/vna-agents.css`: estilos do widget público e da página admin.
- `assets/vna-agents.js`: motor de intenções e interface dos chats.
- `content/knowledge-base.json`: base central com informações da marca, projetos, contato e redes.
- `content/agent-public.json`: intenções e respostas do Assistente VnA público.
- `content/agent-admin.json`: modos, intenções e respostas do Assistente Admin VnA.
- `admin/assistente.html`: página interna do Assistente Admin.
- `docs/agentes-vna.md`: documentação do sistema.

## Como funciona o motor

O arquivo `assets/vna-agents.js` faz o seguinte:

1. Carrega os arquivos JSON locais com `fetch`.
2. Normaliza a pergunta do usuário.
3. Converte tudo para minúsculas.
4. Remove acentos.
5. Remove pontuação desnecessária.
6. Compara a pergunta com palavras-chave de cada intenção.
7. Soma pontos para cada intenção encontrada.
8. Escolhe a intenção com maior pontuação.
9. Usa fallback se a pontuação for baixa.
10. Exibe a resposta controlada no chat.

Tudo roda no navegador, sem backend obrigatório, banco de dados, chave secreta ou serviço pago.

## Assistente Público

Local:

- Site público, como widget flutuante no canto inferior direito.

Arquivo de conteúdo:

- `content/agent-public.json`

Função:

- Ajudar visitantes a entenderem o que é o Vida no Altar.
- Indicar projetos.
- Mostrar redes sociais oficiais.
- Orientar contato.
- Ajudar a pessoa a saber por onde começar.

Limites:

- Não inventa links.
- Não assume função pastoral.
- Não oferece atendimento individual.
- Não responde assuntos sensíveis fora do escopo do site.
- Usa fallback quando não tem resposta pronta.

## Assistente Admin

Local:

- `/admin/assistente.html`

Arquivo de conteúdo:

- `content/agent-admin.json`

Função:

- Ajudar o administrador a entender onde editar o site.
- Orientar melhorias de conteúdo.
- Explicar estrutura técnica.
- Sugerir ajustes básicos de SEO.

Modos:

- Conteúdo: textos, títulos, descrições, projetos, cards e chamadas.
- Técnico: arquivos, links, imagem do hero, publicação e estrutura.
- SEO: title, description, Open Graph, headings, imagens e palavras-chave.

Limites:

- Não altera arquivos automaticamente.
- Não finge que executou mudanças.
- Sempre orienta qual arquivo editar.
- Usa sugestões claras em vez de promessas automáticas.

## Como adicionar uma nova intenção pública

Edite:

```text
content/agent-public.json
```

Adicione um objeto dentro de `intents`:

```json
{
  "id": "novo_assunto",
  "title": "Novo assunto",
  "keywords": ["palavra", "frase exemplo"],
  "response": "Resposta controlada do assistente.",
  "quickReplies": ["Sugestão rápida"],
  "links": [
    { "label": "Instagram", "url": "https://www.instagram.com/vidanoaltar.oficial" }
  ]
}
```

## Como adicionar uma nova intenção admin

Edite:

```text
content/agent-admin.json
```

Escolha um modo em `modes` e adicione um objeto dentro de `intents`:

```json
{
  "id": "nova_orientacao",
  "keywords": ["arquivo", "editar", "exemplo"],
  "response": "Arquivo:\ncontent/site-content.json\n\nO que editar:\ncampo exemplo\n\nSugestão:\nTexto sugerido.\n\nMotivo:\nExplicação simples.",
  "suggestedFiles": ["content/site-content.json"]
}
```

## Como alterar palavras-chave

As palavras-chave ficam em `keywords` dentro de cada intenção.

Boas práticas:

- Use termos que a pessoa realmente digitaria.
- Inclua variações com e sem acento quando fizer sentido.
- Evite listas enormes.
- Prefira palavras específicas do assunto.

## Por que não usa serviço externo

A proposta desta V1 é manter o site leve, previsível e gratuito para rodar em hospedagem estática. Como as respostas são controladas, o VnA evita respostas inventadas e mantém o tom da marca sob controle.

## Como desativar o Assistente Público

Edite:

```text
index.html
```

Remova estas linhas:

```html
<link rel="stylesheet" href="assets/vna-agents.css" />
<script src="assets/vna-agents.js" defer data-vna-agent="public"></script>
```

Se o Assistente Admin ainda for usado, mantenha os arquivos em `assets/` e `content/`.

## Próximos passos possíveis

- Criar mais intenções públicas conforme dúvidas reais dos visitantes.
- Criar respostas específicas para produtos quando a vitrine futura existir.
- Adicionar testes de interface com navegador quando o projeto tiver ambiente próprio para isso.
- Melhorar as sugestões rápidas com base nos conteúdos mais acessados.
- Criar uma página interna de perguntas frequentes alimentada pelos mesmos JSONs.
