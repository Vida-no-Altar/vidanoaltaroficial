# Auditor Admin VnA

## Função

O Auditor Admin VnA é uma ferramenta interna para orientar o administrador do site oficial do Vida no Altar.

Ele ajuda a:

- entender onde editar arquivos;
- classificar riscos;
- revisar conteúdo;
- orientar SEO;
- explicar limites de segurança;
- preparar publicação;
- manter histórico local inicial.

## Local

```text
/admin/auditor.html
```

Arquivos principais:

```text
assets/vna-intelligence.js
assets/vna-intelligence.css
content/admin-auditor.json
content/vna-core.json
```

## Modos

Conteúdo:
Textos, projetos, catálogo, linguagem e organização editorial.

Técnico:
Arquivos, assets, JSONs, scripts e estrutura estática.

SEO:
Title, description, Open Graph, headings, imagens e alt text.

Segurança:
Limites reais da V1, riscos, permissões e segredos.

Publicação:
GitHub Pages, Cloudflare Pages, domínio, DNS e checklist de deploy.

## Riscos

Baixo:
Correções simples de texto, typos e ajustes pequenos.

Médio:
Mudança de texto institucional, links e descrições de projeto.

Alto:
Alteração de estrutura, remoção de projeto, troca de imagem principal ou SEO principal.

Crítico:
Usuários, permissões, integrações, domínio, DNS, publicação e estrutura do admin.

## Histórico local

A V1 usa `localStorage` para manter um histórico local das perguntas feitas ao auditor.

Isso serve como apoio pessoal no navegador, mas não é auditoria real multiusuário.

O histórico pode ser apagado, alterado ou perdido. Não use isso como prova de autoria ou controle de segurança.

## Segurança real

O Auditor não cria login real, permissões reais ou proteção de arquivos.

Como o site é estático, tudo que está em HTML, CSS, JavaScript e JSON público pode ser lido por visitantes. Não coloque senha, token, chave secreta ou dados sensíveis no repositório.

Segurança real deve ser tratada em fase futura com autenticação e infraestrutura apropriadas.

## Como editar respostas

Edite:

```text
content/admin-auditor.json
```

Cada intenção pode conter:

- `id`
- `keywords`
- `risk`
- `response`
- `suggestedFiles`

Responda sempre indicando arquivo, o que editar, sugestão e motivo.
