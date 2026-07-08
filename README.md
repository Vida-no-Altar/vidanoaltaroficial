# Vida no Altar - Landing Page

Site estático oficial do projeto cristão Vida no Altar. A base continua leve, responsiva e simples de publicar, com conteúdo editável, VnA Studio em Fase 0.4, assistentes próprios por regras e o VnA Intelligence Core.

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

Rotas da Fase 0.4:

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

A Fase 0.4 é estática, navegável e interativa em protótipo. Não há login real novo, banco de dados, API própria, upload real, publicação real ou persistência real.

As primeiras experiências visuais simuladas ficam em:

~~~text
/studio/editor/       formulário visual da Home com preview, rascunho local e revisão
/studio/conteudos/    cadastro simulado de conteúdo com preview, alertas e revisão
/studio/midia/        editor visual simulado de imagem com revisão local
/studio/historico/    histórico local do protótipo
~~~

Tudo nessas telas é rascunho local de teste. Alterar campos muda o preview, permite salvar neste navegador, comparar antes/depois e simular publicação, mas não altera o site publicado.

No uso normal, o Studio deve ser entendido como painel visual. O Auditor VnA orienta caminhos dentro do Studio, como `Studio > Páginas > Home`, `Studio > Editor`, `Studio > Conteúdos`, `Studio > Produtos` e `Studio > Mídia`. Ele não deve orientar usuários leigos a editar arquivos do projeto.

Arquivos principais:

~~~text
content/studio-core.json
content/studio-context.json
assets/vna-studio.css
studio/
docs/vna-studio.md
docs/vna-studio-roadmap.md
docs/vna-studio-architecture.md
docs/studio-migration-plan.md
~~~

## Auditor VnA contextual

Acesse:

~~~text
/studio/auditor/
~~~

Também é possível abrir o Auditor com contexto de um módulo:

~~~text
/studio/auditor/?context=editor
/studio/auditor/?context=midia
/studio/auditor/?context=produtos
~~~

Na Fase 0.4, as telas do Studio carregam um widget contextual do Auditor. Cada tela informa o contexto com `data-studio-context`, e os campos principais usam `data-studio-field`, `data-studio-section` e textos de ajuda para o Auditor responder pelo campo ativo.

A base de contexto fica em:

~~~text
content/studio-context.json
~~~

A base geral de respostas fica em:

~~~text
content/admin-auditor.json
~~~

O Auditor não altera, salva nem publica o site sozinho. Ele orienta caminhos, explica riscos simples e lembra quando uma ação ainda é protótipo.

## Formulários simulados, rascunho local e revisão

`/studio/editor/` simula a edição da Home por blocos:

- Hero;
- Sobre;
- Projetos;
- Conteúdos em destaque;
- Contato.

`/studio/conteudos/` simula um cadastro editorial com título, projeto, tipo, descrição, link, capa, temas, versículos, duração e status.

`/studio/midia/` simula configuração de imagem com caminho, alt text, opacidade, posição, tamanho, arredondamento e uso planejado.

Os previews, rascunhos locais, revisões antes/depois, descartes, simulações de publicação e registros locais são controlados pelo script:

~~~text
assets/vna-studio-prototype.js
~~~

Esse script usa `localStorage` apenas para teste no navegador. Isso não é persistência real, não publica conteúdo, não faz upload e não substitui auditoria real.

Na Fase 0.4, o fluxo visual é:

1. Alterar campos simulados.
2. Ver o badge de alterações não salvas.
3. Salvar rascunho local.
4. Revisar antes/depois.
5. Descartar alterações ou simular publicação.
6. Ver o registro local em `/studio/historico/`.

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
content/studio-context.json
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

## Como editar bases técnicas

Enquanto não existe persistência real no Studio, a manutenção técnica continua em arquivos JSON.

Bases principais:

~~~text
content/vna-core.json
content/site-content.json
content/content-catalog.json
content/product-catalog.json
content/admin-auditor.json
content/studio-context.json
content/affiliate-disclosure.json
~~~

Isso é manutenção do projeto, não fluxo normal para usuários do Studio.

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
- Não há upload real.
- Não há publicação real pelo Studio.
- Não há loja, carrinho ou checkout.
- O recomendador de Bíblias ainda não lista produtos reais.
- O histórico do auditor e o histórico de rascunhos são locais e podem ser apagados ou alterados pelo navegador.
- Segurança real depende de autenticação e infraestrutura futura.

## Próximos passos recomendados

1. Criar Fase 0.5 com expansão de rascunhos para Produtos e Páginas.
2. Preparar exportação/importação controlada de rascunhos para migração futura.
3. Preparar Fase 1 com persistência real, autenticação e permissões.
4. Implementar upload real de mídia em infraestrutura própria futura.
5. Substituir o editor técnico legado por editor visual próprio.
