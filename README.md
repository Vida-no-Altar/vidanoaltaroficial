# Vida no Altar - Landing Page V1

Site estático oficial do projeto cristão Vida no Altar. A V1 foi feita como uma página única, leve, responsiva e simples de publicar.

## Como rodar localmente

Não há dependências obrigatórias para publicar. Para preview com URL local, use Node.js:

~~~powershell
node serve.mjs
~~~

URL local de preview:

~~~text
http://127.0.0.1:4321/
~~~

Também é possível abrir o arquivo index.html diretamente no navegador:

~~~powershell
Start-Process .\index.html
~~~

## Como alterar links

Os links sociais estão no arquivo index.html. Procure por href="#" nos botões e cards e substitua pelos links reais quando estiverem disponíveis.

Links preparados nesta V1:

- YouTube: #
- Instagram: #
- TikTok: #
- E-mail: mailto:contato@vidanoaltaroficial.com.br

## Como alterar o e-mail

Troque contato@vidanoaltaroficial.com.br no arquivo index.html.

## Como trocar a imagem do hero

O visual atual usado no hero fica em:

~~~text
public/images/hero-devocional.webp
~~~

Para usar uma imagem real futura:

1. Coloque a imagem otimizada em public/images/.
2. No arquivo assets/styles.css, altere a linha do background-image em .hero-background.
3. Prefira uma imagem horizontal, leve, com boa leitura em fundo escuro. A PNG original gerada também fica em public/images/hero-devocional.png como reserva.

## Como publicar futuramente

Como é um site estático, basta enviar estes arquivos para uma hospedagem estática, como Netlify, Vercel, Cloudflare Pages, GitHub Pages ou o servidor do domínio futuro.

Não há backend, banco de dados, painel, login, loja ou integração de WhatsApp nesta V1.
