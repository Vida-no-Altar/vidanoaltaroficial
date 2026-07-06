# Auditor VnA

## Função

O Auditor VnA é um módulo interno do VnA Studio para revisar, orientar e proteger alterações feitas dentro do Studio.

Ele ajuda a:

- encontrar o módulo certo do Studio;
- entender riscos antes de alterar páginas, conteúdos, produtos, imagens e configurações;
- revisar linguagem, SEO, segurança e publicação;
- explicar o que ainda é protótipo na Fase 0;
- apoiar testes com histórico local no navegador.

O Auditor VnA não deve orientar usuários leigos a editar arquivos do projeto. A rotina esperada é sempre pelo Studio: Páginas, Editor, Conteúdos, Produtos, Mídia, Configurações e Publicação futura.

## Local

```text
/studio/auditor/
```

Rotas legadas:

```text
/admin/auditor.html
```

A rota legada deve apenas apontar para o Studio e não competir como painel antigo.

## Como deve responder

Para perguntas comuns, o Auditor deve responder em formato de uso do Studio.

Exemplo de estrutura recomendada:

```text
Caminho no Studio:
Studio > Páginas > Home ou Studio > Editor

O que revisar:
Bloco Hero, Sobre, Projetos ou Conteúdos em destaque.

Risco:
Médio ou alto, dependendo da mudança.

Observação da Fase 0:
A tela ainda é protótipo e o salvamento real virá na fase de persistência.
```

Ele não deve responder perguntas comuns com instruções como abrir JSON, mexer em HTML, alterar CSS ou ir para o GitHub.

## Modos

Conteúdo:
Páginas, blocos, textos, conteúdos, produtos, projetos e linguagem do VnA Studio.

Técnico:
Limitações da Fase 0, protótipo estático, arquitetura futura, Pages, Workers, D1 e R2. Mesmo neste modo, a resposta deve explicar que o objetivo do Studio é esconder a camada técnica da rotina.

SEO:
SEO de páginas, conteúdos, compartilhamento, headings e imagens pelo fluxo planejado do Studio.

Segurança:
Limites reais da Fase 0, ausência de login real, noindex/robots como organização e não como segurança, permissões futuras e ações críticas.

Publicação:
Fluxo planejado de rascunho, revisão, preview, aprovação e publicação pelo Studio.

## Riscos

Baixo:
Correções simples de texto, typos e ajustes pequenos em blocos já existentes.

Médio:
Mudança de texto institucional, links, descrições, cards, conteúdos comuns e produtos básicos.

Alto:
Alteração de estrutura visual, remoção de projeto, troca de imagem principal, status de projeto ativo ou SEO principal.

Crítico:
Usuários, permissões, autenticação, domínio, DNS, publicação, integrações e ações irreversíveis.

## Histórico local

A Fase 0 usa `localStorage` para manter um histórico local das perguntas feitas ao Auditor.

Texto oficial do histórico:

```text
Registros salvos apenas neste navegador para apoiar testes do protótipo. Isso ainda não é auditoria real multiusuário.
```

Esse histórico pode ser apagado, alterado ou perdido. Ele não substitui auditoria real com usuário, data, ação, antes/depois e versão publicada.

## Segurança real

O Auditor não cria login real, permissões reais, proteção de rota ou auditoria multiusuário.

Como a Fase 0 é estática, o Studio deve ser tratado como protótipo público do ponto de vista técnico. `noindex` e `robots.txt` ajudam a evitar indexação, mas não são segurança.

Segurança real deve vir em fase futura com autenticação, permissões por função, segunda etapa obrigatória, reautenticação em ações críticas e backend próprio.

## Manutenção técnica das respostas

A base técnica do Auditor fica em:

```text
content/admin-auditor.json
```

Esse arquivo é manutenção do projeto, não fluxo de uso para o usuário comum do Studio.

Ao alterar respostas, mantenha a orientação pelo Studio:

- `Studio > Páginas > Home`
- `Studio > Editor`
- `Studio > Conteúdos`
- `Studio > Produtos`
- `Studio > Mídia`
- `Studio > Configurações`

Evite respostas comuns que mandem editar arquivos diretamente. A exceção é uma pergunta claramente técnica, e mesmo assim a resposta deve explicar que a meta do Studio é esconder essa camada da rotina.
