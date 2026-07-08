# Arquitetura do VnA Studio

## Visão geral

O VnA Studio continua sendo estático na Fase 0.4. Ele roda com HTML, CSS, JavaScript e JSON públicos.

A evolução desta fase é o fluxo de rascunho local e revisão antes/depois. O Studio informa ao JavaScript qual tela está aberta, quais campos estão ativos e o Auditor usa isso para orientar o usuário pelo módulo, pelo campo e pelo impacto da mudança.

## Camadas atuais

Site público:

- `index.html`
- `assets/styles.css`
- `assets/script.js`
- `content/site-content.json`

Studio:

- `studio/`
- `assets/vna-studio.css`
- `assets/vna-studio-prototype.js`
- `content/studio-core.json`
- `content/studio-context.json`

Auditor e assistentes:

- `assets/vna-intelligence.js`
- `assets/vna-intelligence.css`
- `content/admin-auditor.json`
- `content/public-assistant.json`

## Contexto por tela

Cada tela do Studio usa `data-studio-context` no `body`.

Exemplos:

```html
<body class="studio-body" data-studio-context="editor">
```

O Auditor também pode receber contexto pela URL:

```text
/studio/auditor/?context=editor
```

O arquivo `content/studio-context.json` define:

- rota;
- nome do módulo;
- descrição;
- status;
- ações principais;
- itens editáveis planejados;
- riscos comuns;
- sugestões rápidas;
- respostas de tarefas comuns.

## Contexto por campo

As telas `/studio/editor/`, `/studio/conteudos/` e `/studio/midia/` usam atributos em campos do formulário:

```html
data-studio-field
data-studio-section
data-studio-field-label
data-studio-field-help
```

Quando o usuário foca um campo e pergunta algo como "O que coloco aqui?", o Auditor usa esses atributos para responder de forma específica.

## Como o Auditor responde

1. Carrega a base institucional e os dados do Intelligence Core.
2. Carrega `content/admin-auditor.json`.
3. Carrega `content/studio-context.json` quando está no Studio.
4. Detecta o contexto pela URL, pelo `data-studio-context` ou pela rota.
5. Procura uma tarefa contextual no módulo atual.
6. Se não encontrar, usa as intenções gerais do Auditor.
7. Monta a resposta com linguagem simples, risco em frase humana e nota de protótipo somente quando faz sentido.

## Motor de rascunhos locais

`assets/vna-studio-prototype.js` controla:

- estado original dos campos;
- estado atual;
- detecção de alterações não salvas;
- salvamento local de rascunho;
- carregamento de rascunho local;
- descarte;
- revisão antes/depois;
- registro local no histórico;
- simulação de publicação.

Os dados ficam em `localStorage` apenas para teste no navegador. Isso não é banco de dados, não é segurança real, não é publicação real e não substitui auditoria multiusuário.

## Limites técnicos da Fase 0.4

- O Studio não salva alterações reais.
- Os formulários atualizam previews locais e podem salvar rascunhos apenas neste navegador.
- O widget do Auditor orienta, mas não executa mudanças.
- O histórico do Auditor e o histórico de rascunhos usam apenas armazenamento local do navegador.
- Não existe autenticação real.
- `noindex` e `robots.txt` ajudam organização, mas não protegem acesso.

## Arquitetura futura planejada

- Cloudflare Pages para hospedar site e Studio.
- API própria para salvar e publicar dados.
- Banco para conteúdos, páginas, produtos e usuários.
- Armazenamento de mídia para imagens e arquivos.
- Autenticação real com permissões por função.
- Histórico real com antes/depois, autor e versão publicada.

Nada disso é implementado na Fase 0.4.
