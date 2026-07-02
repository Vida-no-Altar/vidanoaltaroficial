# Vida no Altar - Landing Page

Site estático oficial do projeto cristão Vida no Altar. A base continua leve, responsiva e simples de publicar, agora com uma camada inicial de conteúdo editável para preparar o futuro painel administrativo.

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

O arquivo usado no header e no footer fica em:

~~~text
public/images/logo-vida-no-altar.svg
~~~

Para usar uma versão PNG/WebP oficial sem fundo:

1. Coloque a imagem otimizada em `public/images/`.
2. No arquivo `index.html`, altere os dois caminhos `public/images/logo-vida-no-altar.svg` para o novo arquivo.
3. Prefira uma versão quadrada, com fundo transparente, para funcionar bem no header e no footer.

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

Ainda não há loja completa, carrinho, pagamento, área de membros, blog ou banco de dados. A atualização atual apenas prepara edição de conteúdo, vídeos, links e produtos futuros de forma organizada.
