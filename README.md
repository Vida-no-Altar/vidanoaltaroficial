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

Os links sociais estão no arquivo index.html. Procure pelos endereços atuais e substitua quando necessário.

Links oficiais usados nesta V1:

- YouTube: https://www.youtube.com/@vidanoaltar.oficial
- Instagram: https://www.instagram.com/vidanoaltar.oficial
- TikTok: https://www.tiktok.com/@vidanoaltar.oficial
- E-mail: mailto:contato@vidanoaltaroficial.com.br

## Como alterar o e-mail

Troque contato@vidanoaltaroficial.com.br no arquivo index.html.

## Como trocar a logo

O arquivo usado no header e no footer fica em:

~~~text
public/images/logo-vida-no-altar.svg
~~~

Para usar uma versão PNG/WebP oficial sem fundo:

1. Coloque a imagem otimizada em public/images/.
2. No arquivo index.html, altere os dois caminhos public/images/logo-vida-no-altar.svg para o novo arquivo.
3. Prefira uma versão quadrada, com fundo transparente, para funcionar bem no header e no footer.

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
