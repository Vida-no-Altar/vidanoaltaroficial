# Auditor VnA

## Função

O Auditor VnA é um módulo interno do VnA Studio para orientar o uso do painel, revisar riscos simples e proteger decisões antes de publicar alterações.

Na Fase 0.4, ele deixa de ser apenas uma lista de respostas gerais e passa a funcionar como guia contextual por tela, por campo ativo e pelo fluxo de rascunho/revisão.

Ele ajuda a:

- encontrar o módulo certo do Studio;
- responder conforme a tela atual;
- explicar riscos em linguagem simples;
- sugerir o que revisar antes de publicar;
- explicar rascunho local e alterações não salvas;
- orientar revisão antes/depois;
- explicar limites do histórico local;
- explicar o que ainda é protótipo;
- apoiar testes com histórico local no navegador.

O Auditor VnA não deve orientar usuários leigos a editar arquivos do projeto. A rotina esperada é sempre pelo Studio: Páginas, Editor, Conteúdos, Produtos, Mídia, Configurações e Publicação futura.

## Local

```text
/studio/auditor/
```

Também é possível abrir o Auditor com contexto:

```text
/studio/auditor/?context=editor
/studio/auditor/?context=midia
/studio/auditor/?context=produtos
```

Rotas legadas:

```text
/admin/auditor.html
```

A rota legada deve apenas apontar para o Studio e não competir como painel antigo.

## Contexto por tela

O contexto fica em:

```text
content/studio-context.json
```

Cada tela informa ao JavaScript qual módulo está aberto usando `data-studio-context`.

O contexto define:

- rota atual;
- nome do módulo;
- descrição do módulo;
- ações principais;
- itens editáveis planejados;
- riscos comuns;
- status da tela;
- sugestões rápidas;
- respostas de tarefas daquele módulo.

## Contexto por campo

Na Fase 0.4, os formulários simulados do Editor, Conteúdos e Mídia usam atributos como:

```text
data-studio-field
data-studio-section
data-studio-field-label
data-studio-field-help
```

Quando um campo está em foco e a pessoa pergunta "O que coloco aqui?", o Auditor prioriza a ajuda daquele campo. Isso permite explicar, por exemplo, título do Hero, opacidade de imagem, alt text, link de conteúdo e status sem mandar a pessoa editar nada manualmente.

## Como deve responder

O Auditor deve soar como guia do painel, não como relatório técnico.

Formato esperado:

```text
Você está no Editor visual. Para trocar uma imagem, selecione o bloco onde a imagem aparece, abra a área Imagem no painel de edição e escolha Substituir imagem.

Essa é uma alteração comum, mas vale revisar antes de publicar porque pode aparecer para todo visitante.

Nesta fase, o Studio ainda é um protótipo. Algumas ações mostram o caminho, mas ainda não salvam de verdade.
```

Evite começar respostas comuns com frases secas como "Risco estimado".

Evite avisos técnicos fora de contexto.

Evite mandar usuários comuns abrir JSON, HTML, CSS, GitHub ou arquivos do projeto.

## Modos

Os modos continuam existindo:

- Conteúdo;
- Técnico;
- SEO;
- Segurança;
- Publicação.

Mas o usuário não precisa escolher perfeitamente. Se a pergunta parecer de outro modo, o Auditor pode orientar por esse lado naturalmente.

## Riscos em linguagem humana

Baixo:
Mudança simples, mas ainda merece uma conferida.

Médio:
Alteração comum que pode aparecer para todo visitante.

Alto:
Mudança que pode afetar estrutura, mensagem principal ou navegação.

Crítico:
Mudança sensível que deve exigir aprovação clara em fase futura.

## Histórico local

A Fase 0.4 usa `localStorage` para manter histórico local das perguntas feitas ao Auditor e dos fluxos simulados de rascunho/revisão.

Texto oficial do histórico:

```text
Registros salvos apenas neste navegador para apoiar testes do protótipo. Isso ainda não é auditoria real multiusuário.
```

Esse histórico pode ser apagado, alterado ou perdido. Ele não substitui auditoria real com usuário, data, ação, antes/depois e versão publicada.

Perguntas novas que o Auditor deve responder:

- O que é rascunho local?
- Como reviso antes de publicar?
- O que significa alteração não salva?
- Posso confiar nesse histórico?
- Isso já publica no site?
- Como descarto uma alteração?

## Segurança real

O Auditor não cria login real, permissões reais, proteção de rota ou auditoria multiusuário.

Como a Fase 0.4 é estática, o Studio deve ser tratado como protótipo público do ponto de vista técnico. `noindex` e `robots.txt` ajudam a evitar indexação, mas não são segurança.

Segurança real deve vir em fase futura com autenticação, permissões por função, segunda etapa obrigatória, reautenticação em ações críticas e backend próprio.

## Manutenção técnica das respostas

Bases técnicas:

```text
content/admin-auditor.json
content/studio-context.json
assets/vna-intelligence.js
```

Esses arquivos são manutenção do projeto, não fluxo de uso para o usuário comum do Studio.

Ao alterar respostas, mantenha a orientação pelo Studio:

- `Studio > Páginas > Home`
- `Studio > Editor`
- `Studio > Conteúdos`
- `Studio > Produtos`
- `Studio > Mídia`
- `Studio > Configurações`

A exceção é uma pergunta claramente técnica, e mesmo assim a resposta deve explicar que a meta do Studio é esconder essa camada da rotina.
