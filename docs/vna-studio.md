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

A Fase 0 entrega fundação, arquitetura e protótipos estáticos navegáveis. Ela não implementa login real, banco de dados, API própria, upload real, edição persistente nem editor visual completo.

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

## Auditor VnA

O Auditor VnA é um módulo interno do VnA Studio. Ele ensina o uso do Studio, ajuda a entender riscos, orienta revisão de mudanças e explica limites da Fase 0.

Ele deve orientar caminhos como:

```text
Studio > Páginas > Home
Studio > Editor
Studio > Conteúdos
Studio > Produtos
Studio > Mídia
Studio > Configurações
```

O Auditor VnA não deve orientar usuários leigos a editar JSON, HTML, CSS, JavaScript, GitHub ou arquivos do projeto. A camada técnica ainda existe por baixo, mas o objetivo do Studio é esconder isso da rotina.

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

Nada disso foi implementado na Fase 0.

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

Na Fase 0, o Studio ainda é estático. Por baixo da interface, estes arquivos sustentam o protótipo:

- Site público: `content/site-content.json`
- Conteúdos: `content/content-catalog.json`
- Produtos: `content/product-catalog.json`
- Auditor: `content/admin-auditor.json`
- Base do Studio: `content/studio-core.json`

Essas fontes são documentação e manutenção técnica. Para o usuário do Studio, a experiência deve ser pensada por módulos visuais, não por arquivos.

## Próximas fases

1. Transformar os protótipos em telas com formulários reais.
2. Criar API própria com Workers.
3. Persistir dados no D1.
4. Mover mídia para R2.
5. Implementar autenticação real e permissões.
6. Substituir o Decap legado por editor visual próprio.
