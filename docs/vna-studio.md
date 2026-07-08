# VnA Studio

## Visão geral

O VnA Studio é a evolução do Admin existente do Vida no Altar. Ele não é um painel separado nem concorrente.

Rota oficial:

```text
/studio/
```

Descrição oficial:

```text
O painel visual para criar, editar e publicar o ecossistema Vida no Altar.
```

A Fase 0.4 mantém o Studio estático, mas adiciona rascunhos locais, revisão antes/depois, descarte, simulação de publicação e histórico local do protótipo. Ainda não há login real, banco de dados, API própria, upload real, edição persistente nem publicação real.

## Rotas

```text
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
```

## Status das telas

A Fase 0.4 usa badges para evitar confusão:

- Protótipo visual: fluxo desenhado, sem salvar de verdade.
- Funcional parcial: algo já funciona no navegador, mas sem backend real.
- Planejado: conceito documentado para fase futura.
- Futuro: ação ainda indisponível.
- Legado: ponte temporária herdada do Admin antigo.

## Auditor VnA contextual

O Auditor VnA é um módulo interno do VnA Studio. Ele ensina o uso do Studio, ajuda a entender riscos, orienta revisão de mudanças e explica limites da fase atual.

Na Fase 0.4, ele usa o contexto da tela, o campo ativo e o fluxo de rascunho/revisão. A mesma pergunta pode receber resposta diferente em módulos diferentes ou conforme o campo selecionado.

Exemplo:

- Em `Studio > Editor`, "Como troco uma imagem?" orienta selecionar o bloco e usar a área Imagem.
- Em `Studio > Mídia`, a mesma pergunta orienta organizar a imagem na biblioteca e depois aplicar em uma página.

Cada tela informa o contexto com `data-studio-context`, e o Auditor também pode receber contexto pela URL:

```text
/studio/auditor/?context=editor
```

A base de contexto fica em:

```text
content/studio-context.json
```

O Auditor VnA não deve orientar usuários leigos a editar JSON, HTML, CSS, JavaScript, GitHub ou arquivos do projeto. A camada técnica ainda existe por baixo, mas o objetivo do Studio é esconder isso da rotina.

## Formulários simulados da Fase 0.4

`/studio/editor/` cria a experiência visual de edição da Home. Ele tem abas para Hero, Sobre, Projetos, Conteúdos em destaque e Contato. Cada campo atualiza um preview local da Home, detecta alterações não salvas e permite salvar rascunho local.

`/studio/conteudos/` simula cadastro de conteúdo com título, projeto, tipo, descrições, link, botão, capa, tema, versículos, duração e status. O preview mostra um card editorial, e a revisão aponta campos importantes vazios ou status publicado em protótipo.

`/studio/midia/` simula a configuração de imagem com URL/caminho, alt text, opacidade, posição, tamanho, arredondamento e uso planejado. A revisão mostra valores alterados e alerta quando alt text está vazio, opacidade está baixa demais ou a imagem fica pequena. Upload real continua fora desta fase.

Todos esses fluxos são apenas protótipos no navegador. O rascunho local usa `localStorage`, mas não é persistência real, não publica e não altera o site real.

## Revisão e histórico local

A Fase 0.4 adiciona:

- badge de alterações não salvas;
- botão Salvar rascunho local;
- botão Revisar alterações;
- botão Descartar alterações;
- botão Simular publicação;
- comparação antes/depois;
- registro em `/studio/historico/`.

O histórico local mostra data, módulo, seção, tipo de alteração, status, usuário simulado Matheus, risco estimado e detalhes antes/depois. Isso ainda não é auditoria real multiusuário.

## Relação com o Admin antigo

`/admin/` agora é legado temporário. A rota mostra aviso claro apontando para `/studio/`.

`/admin/auditor.html` aponta para `/studio/auditor/`.

`/admin/assistente.html` fica marcado como legado porque o Auditor VnA cobre melhor os fluxos úteis.

`/admin/legacy.html` preserva temporariamente o Decap CMS existente. Ele é uma ponte técnica, não o Studio final.

## Arquitetura futura

Planejamento técnico:

- Cloudflare Pages para o site público e o Studio.
- Cloudflare Workers para API própria.
- Cloudflare D1 para banco de dados.
- Cloudflare R2 para imagens e arquivos.
- Cloudflare Access como camada extra opcional.
- Login futuro por e-mail e senha.
- Segunda etapa obrigatória.
- Permissões por função.
- Reautenticação em ações críticas.

Nada disso foi implementado na Fase 0.4.

## Segurança

Não existe autenticação real nova nesta fase.

Não há senha no JavaScript.

Não há tokens ou segredos no repositório.

Tudo em `/studio/` é estático e público do ponto de vista técnico, por isso as páginas usam `noindex` e são bloqueadas no `robots.txt`, mas isso não substitui autenticação real.

## Usuários planejados

- Matheus: proprietário, permissão total.
- Everaldo: editor, textos, imagens, links, conteúdos e produtos básicos.
- Eliana: editora, textos, imagens, links, conteúdos e produtos básicos.

Os e-mails futuros ficam documentados em `content/studio-core.json`. Não há cadastro real de usuários nesta fase.

## Fontes técnicas atuais de dados

Na Fase 0.4, o Studio ainda é estático. Por baixo da interface, estes arquivos sustentam o protótipo:

- Site público: `content/site-content.json`
- Conteúdos: `content/content-catalog.json`
- Produtos: `content/product-catalog.json`
- Auditor: `content/admin-auditor.json`
- Contexto do Studio: `content/studio-context.json`
- Base do Studio: `content/studio-core.json`
- Preview, rascunho e revisão do Studio: `assets/vna-studio-prototype.js`

Essas fontes são documentação e manutenção técnica. Para o usuário do Studio, a experiência deve ser pensada por módulos visuais, não por arquivos.

## Próximas fases

1. Criar Fase 0.5 expandindo rascunhos para Produtos e Páginas.
2. Preparar exportação/importação controlada de rascunhos.
3. Evoluir para persistência real.
4. Implementar autenticação real e permissões.
5. Substituir o editor técnico legado por editor visual próprio.
