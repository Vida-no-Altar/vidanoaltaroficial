# Vida no Altar - Landing Page

Site estático oficial do projeto cristão Vida no Altar. A base continua leve, responsiva e simples de publicar, com conteúdo editável, VnA Studio em Fase 0, assistentes próprios por regras e o VnA Intelligence Core.

## Como rodar localmente

Use Node.js 20 ou superior.

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

Também é possível abrir `index.html` diretamente no navegador, mas os arquivos JSON só carregam corretamente por servidor local ou hospedagem web.

## Como testar

Antes de publicar ou commitar mudanças, rode:

~~~powershell
npm test
~~~

Esse teste valida JSONs, links internos, arquivos referenciados, rotas públicas, Studio, Admin legado, assistentes, VnA Intelligence Core e ausência de caminhos locais absolutos ou canais provisórios indesejados.

Também existe verificação automática no GitHub Actions em todo push, pull request e execução manual.

## VnA Studio

O VnA Studio é a evolução do Admin existente. Ele não é um painel separado.

Rota oficial:

~~~text
/studio/
~~~

Descrição:

~~~text
O painel visual para criar, editar e publicar o ecossistema Vida no Altar.
~~~

Rotas da Fase 0:

~~~text
/studio/              Dashboard
/studio/paginas/      Páginas
/studio/editor/       Editor visual
/studio/conteudos/    Conteúdos
/studio/produtos/     Produtos e indicações
/studio/midia/        Mídia
/studio/usuarios/     Usuários e permissões
/studio/historico/    Histórico e versões
/studio/auditor/      Auditor VnA
/studio/config/       Configurações
~~~

A Fase 0 é estática e navegável. Não há login real novo, banco de dados, API própria, upload real ou persistência real.

Arquivos principais:

~~~text
content/studio-core.json
assets/vna-studio.css
studio/
docs/vna-studio.md
docs/studio-migration-plan.md
~~~

## Admin legado

`/admin/` agora é rota legada temporária e aponta para `/studio/`.

`/admin/auditor.html` aponta para `/studio/auditor/`.

`/admin/assistente.html` fica marcado como assistente legado.

`/admin/legacy.html` preserva temporariamente o Decap CMS existente. Ele é ponte técnica, não o VnA Studio final.

## VnA Intelligence Core

O VnA Intelligence Core é a camada estática que organiza dados e regras para o ecossistema do site.

Ele sustenta:

- Assistente Público VnA;
- Auditor VnA;
- base institucional;
- catálogo de conteúdos;
- estrutura futura para recomendação de Bíblias e livros;
- transparência sobre links afiliados.

Tudo roda com HTML, CSS, JavaScript e JSON públicos. Não há backend obrigatório, banco de dados, chave secreta ou IA generativa nesta V1.

Arquivos principais:

~~~text
content/vna-core.json
content/content-catalog.json
content/product-catalog.json
content/public-assistant.json
content/admin-auditor.json
content/affiliate-disclosure.json
assets/vna-intelligence.js
assets/vna-intelligence.css
studio/auditor/index.html
docs/vna-intelligence-core.md
docs/public-assistant.md
docs/admin-auditor.md
~~~

## Conteúdo editável do site

O conteúdo principal da página fica em:

~~~text
content/site-content.json
~~~

Esse arquivo concentra textos, links, cards, conteúdos em destaque, área de vídeos/produtos, contato, SEO e imagem do hero.

Links oficiais ficam no bloco `links`:

- YouTube: `youtube`
- Instagram: `instagram`
- TikTok: `tiktok`
- E-mail: `email`

Links atuais:

- YouTube: https://www.youtube.com/@vidanoaltar.oficial
- Instagram: https://www.instagram.com/vidanoaltar.oficial
- TikTok: https://www.tiktok.com/@vidanoaltar.oficial
- E-mail: contato@vidanoaltaroficial.com.br

## Como editar a base institucional

Edite:

~~~text
content/vna-core.json
~~~

Esse arquivo guarda marca, slogan, descrição, público, valores, projetos, contato, redes oficiais, assets oficiais, limites do assistente e regras éticas para afiliados.

## Como editar o catálogo de conteúdos

Edite:

~~~text
content/content-catalog.json
~~~

Se ainda não existir link direto para um conteúdo, use `"#"`. Não invente URL.

## Como editar o catálogo de produtos

Edite:

~~~text
content/product-catalog.json
~~~

A V1 ainda não é loja. O arquivo prepara a estrutura para Bíblias, livros e materiais futuros.

Enquanto não houver produto real cadastrado, o assistente não recomenda produto específico nem inventa link.

## Links afiliados

O aviso fica em:

~~~text
content/affiliate-disclosure.json
~~~

Regra ética:

1. Perfil da pessoa.
2. Necessidade real.
3. Compatibilidade com a igreja.
4. Compreensão da tradução.
5. Objetivo de uso.
6. Orçamento.
7. Disponibilidade.
8. Link afiliado.

Comissão nunca é critério principal.

## Assistente Público VnA

O widget público é carregado em `index.html` por:

~~~html
<link rel="stylesheet" href="assets/vna-intelligence.css" />
<script src="assets/vna-intelligence.js" defer data-vna-intelligence="public"></script>
~~~

As respostas e modos ficam em:

~~~text
content/public-assistant.json
~~~

Para desativar o widget público, remova do `index.html` o CSS e o script `vna-intelligence`.

## Auditor VnA

Acesse:

~~~text
/studio/auditor/
~~~

As regras e respostas ficam em:

~~~text
content/admin-auditor.json
~~~

Modos:

- Conteúdo;
- Técnico;
- SEO;
- Segurança;
- Publicação.

O Auditor classifica risco como Baixo, Médio, Alto ou Crítico. O histórico é salvo em `localStorage`, apenas no navegador do admin. Isso não é auditoria real multiusuário.

## Como trocar a logo

O arquivo usado no header e no footer é:

~~~text
Logo Vida no Altar.png
~~~

Para trocar no futuro, substitua por uma nova PNG oficial, mantenha o nome do arquivo e rode `npm test`.

## Como trocar a imagem da seção Sobre

A imagem principal da seção Sobre fica em:

~~~text
public/images/matheus-sobre-vna.webp
~~~

Há fallback PNG em:

~~~text
public/images/matheus-sobre-vna.png
~~~

Nunca use caminhos locais do computador no HTML, CSS, JSON ou README. Use apenas caminhos relativos dentro do projeto.

Alt text preservado:

~~~text
Matheus, criador do Vida no Altar, segurando uma Bíblia
~~~

## Como trocar a imagem do hero

Edite o campo abaixo em `content/site-content.json`:

~~~text
hero.image
~~~

Imagem atual:

~~~text
public/images/hero-devocional.webp
~~~

## Como publicar

Como é um site estático, ele pode ser publicado em GitHub Pages, Cloudflare Pages, Netlify, Vercel ou hospedagem estática equivalente.

Para GitHub Pages, o repositório possui workflow de qualidade. Para Cloudflare Pages, publique a raiz do projeto como site estático, sem build obrigatório.

Antes de publicar:

~~~powershell
npm test
~~~

## Limitações atuais

- Não há IA generativa.
- Não há backend obrigatório.
- Não há banco de dados.
- Não há login real novo para o VnA Studio.
- Não há loja, carrinho ou checkout.
- O recomendador de Bíblias ainda não lista produtos reais.
- O histórico do auditor é local e pode ser apagado ou alterado pelo navegador.
- Segurança real depende de autenticação e infraestrutura futura.

## Próximos passos recomendados

1. Criar formulários reais no Studio para editar `content/site-content.json`.
2. Cadastrar conteúdos reais com links diretos em `content/content-catalog.json`.
3. Cadastrar produtos reais revisados em `content/product-catalog.json`.
4. Evoluir o Studio para API própria, banco e permissões reais.
5. Substituir o editor técnico legado por editor visual próprio.
