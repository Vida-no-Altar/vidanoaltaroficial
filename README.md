# Vida no Altar - Landing Page

Site estático oficial do projeto cristão Vida no Altar. A base continua leve, responsiva e simples de publicar, agora com conteúdo editável e assistentes próprios baseados em regras e arquivos JSON locais.

## Como rodar localmente

Use Node.js 20 ou superior.

Para preview com URL local:

~~~powershell
npm start
~~~

ou:

~~~powershell
node serve.mjs
~~~

URL local de preview:

~~~text
http://127.0.0.1:4321/
~~~

Também é possível abrir o arquivo index.html diretamente no navegador, mas a camada editável em JSON só carrega pelo servidor local ou por hospedagem web:

~~~powershell
Start-Process .\index.html
~~~

## Como testar

Antes de publicar ou commitar mudanças, rode:

~~~powershell
npm test
~~~

Esse teste valida:

- JSON de conteúdo;
- JSONs dos assistentes;
- sitemap;
- links internos;
- arquivos referenciados pelo HTML/CSS;
- configuração do painel `/admin/`;
- ausência de links/canais provisórios indesejados;
- rotas principais servidas localmente.

Também existe uma verificação automática no GitHub Actions em todo push, pull request e execução manual.

## Conteúdo editável

O conteúdo principal fica em:

~~~text
content/site-content.json
~~~

Esse arquivo concentra textos, links, cards, conteúdos em destaque, área de vídeos/produtos, contato, SEO e imagem do hero. O site carrega esse JSON automaticamente quando está rodando por servidor local ou publicado.

Para alterar links oficiais, edite o bloco `links` em `content/site-content.json`:

- YouTube: `youtube`
- Instagram: `instagram`
- TikTok: `tiktok`
- E-mail: `email`

Links atuais:

- YouTube: https://www.youtube.com/@vidanoaltar.oficial
- Instagram: https://www.instagram.com/vidanoaltar.oficial
- TikTok: https://www.tiktok.com/@vidanoaltar.oficial
- E-mail: contato@vidanoaltaroficial.com.br

## Assistentes VnA

O projeto tem dois assistentes próprios, sem IA generativa, sem backend obrigatório, sem banco de dados e sem chave secreta.

- Assistente VnA: aparece no site público como widget flutuante.
- Assistente Admin VnA: fica em `/admin/assistente.html` e orienta edições do site.

Arquivos principais:

~~~text
assets/vna-agents.css
assets/vna-agents.js
content/knowledge-base.json
content/agent-public.json
content/agent-admin.json
admin/assistente.html
docs/agentes-vna.md
~~~

### Como editar respostas

Para respostas do visitante comum, edite:

~~~text
content/agent-public.json
~~~

Para respostas internas do admin, edite:

~~~text
content/agent-admin.json
~~~

A base com informações centrais da marca fica em:

~~~text
content/knowledge-base.json
~~~

### Como adicionar novas intenções

Em `content/agent-public.json` ou `content/agent-admin.json`, adicione um item em `intents` com:

- `id`: nome interno curto;
- `keywords`: palavras e frases que ativam a resposta;
- `response`: resposta controlada;
- `quickReplies`: sugestões rápidas, quando fizer sentido;
- `links`: links seguros, apenas no assistente público quando necessário;
- `suggestedFiles`: arquivos sugeridos, no assistente admin.

### Como alterar palavras-chave

Edite o campo `keywords` da intenção desejada. Use termos simples, com variações que uma pessoa realmente digitaria. Depois rode `npm test`.

### Como desativar o assistente público

Edite `index.html` e remova estas linhas:

~~~html
<link rel="stylesheet" href="assets/vna-agents.css" />
<script src="assets/vna-agents.js" defer data-vna-agent="public"></script>
~~~

Se o Assistente Admin continuar ativo, mantenha os arquivos `assets/vna-agents.css`, `assets/vna-agents.js` e os JSONs em `content/`.

### Limitações da versão atual

- As respostas são controladas e não são geradas livremente.
- O assistente só responde bem ao que estiver mapeado nos JSONs.
- O admin não altera arquivos automaticamente.
- A busca é por palavras-chave e pontuação simples.
- Para evoluir, adicione novas intenções com base nas dúvidas reais dos visitantes.

Documentação completa:

~~~text
docs/agentes-vna.md
~~~

## Painel administrativo

A rota preparada para administração fica em:

~~~text
/admin/
~~~

Ela usa Decap CMS como base de painel visual para editar `content/site-content.json` sem mexer no código. Essa rota não aparece no menu público do site.

Antes de usar em produção, ainda é necessário configurar autenticação segura com GitHub OAuth no provedor de hospedagem escolhido. Não coloque senha, token ou segredo dentro do repositório.

O painel foi preparado para editar:

- textos principais;
- imagem do hero;
- links sociais;
- cards de projetos;
- conteúdos em destaque;
- vídeos e links úteis;
- links futuros de produtos;
- contato e SEO básico.

## Como trocar a logo

O arquivo usado no header e no footer é a PNG oficial enviada ao repositório:

~~~text
Logo Vida no Altar.png
~~~

Para trocar a logo no futuro:

1. Substitua esse arquivo por uma nova imagem PNG oficial.
2. Prefira uma versão quadrada e leve, com boa leitura em tamanho pequeno.
3. Mantenha o nome `Logo Vida no Altar.png` para não precisar alterar o `index.html`.
4. Depois rode `npm test` para conferir se a imagem referenciada continua existindo.

O CSS usa `object-fit: contain` para manter a logo inteira no header e no footer.

## Como trocar a imagem da seção Sobre

A imagem exibida na seção Sobre fica em:

~~~text
public/images/matheus-sobre-vna.webp
~~~

Há também um fallback PNG organizado em:

~~~text
public/images/matheus-sobre-vna.png
~~~

Para trocar no futuro:

1. Substitua os arquivos por imagens com o mesmo nome, mantendo transparência quando possível.
2. Use uma versão WebP leve para o carregamento principal.
3. Mantenha o texto alternativo no `index.html`: `Matheus, criador do Vida no Altar, segurando uma Bíblia`.
4. Depois rode `npm test` para conferir se os arquivos referenciados continuam existindo.

Os textos da seção Sobre são carregados de `content/site-content.json`, no bloco `about`.

## Como trocar a imagem do hero

Pelo conteúdo editável, altere o campo abaixo em `content/site-content.json`:

~~~text
hero.image
~~~

O visual atual usado no hero fica em:

~~~text
public/images/hero-devocional.webp
~~~

Prefira uma imagem horizontal, leve, com boa leitura em fundo escuro. A PNG original gerada também fica em `public/images/hero-devocional.png` como reserva.

## Como adicionar vídeos ou produtos

Edite a lista abaixo em `content/site-content.json`:

~~~text
resourceHub.items
~~~

Use essa área para links de vídeos, páginas internas futuras, produtos, materiais, livros e recomendações. Enquanto não houver loja própria, prefira links externos oficiais ou botões que levem para contato.

## Como publicar futuramente

Como é um site estático, basta enviar estes arquivos para uma hospedagem estática, como Netlify, Vercel, Cloudflare Pages, GitHub Pages ou o servidor do domínio futuro.

Para usar o painel `/admin/`, escolha uma hospedagem que permita configurar OAuth com GitHub para o Decap CMS. O site público não precisa de backend próprio para continuar funcionando.

## Escopo atual

Ainda não há loja completa, carrinho, pagamento, área de membros, blog ou banco de dados. A atualização atual prepara edição de conteúdo, vídeos, links, produtos futuros e assistentes próprios baseados em regras.
