# Roadmap do VnA Studio

## Fase 0

Fundação do Studio:

- rota oficial `/studio/`;
- rotas internas navegáveis;
- `/admin/` como legado temporário;
- Auditor VnA reposicionado como módulo do Studio;
- documentação da arquitetura futura.

## Fase 0.1

Correção de direção do Auditor:

- deixou de orientar usuários comuns a editar arquivos;
- passou a orientar por caminhos visuais do Studio;
- reforçou que a Fase 0 não tem salvamento real;
- manteve site público, Assistente Público e Intelligence Core.

## Fase 0.2

Auditor contextual e UX mais honesta:

- contexto por tela em `content/studio-context.json`;
- widget contextual do Auditor nas telas do Studio;
- sugestões rápidas por módulo;
- respostas diferentes para a mesma pergunta conforme a tela atual;
- linguagem de risco mais humana;
- badges de status como Protótipo visual, Funcional parcial e Planejado;
- botões e fluxos futuros identificados como protótipo.

## Fase 0.3

Formulários simulados e preview local:

- edição simulada da Home em `/studio/editor/`;
- cadastro simulado de conteúdo em `/studio/conteudos/`;
- editor visual simulado de imagem em `/studio/midia/`;
- preview local de Home, card de conteúdo e mídia;
- Auditor com leitura de campo ativo;
- avisos claros de que nada publica de verdade.

## Fase 0.4

Rascunhos locais, revisão antes/depois e preparação do fluxo de publicação:

- detecção visual de alterações não salvas;
- botão Salvar rascunho local;
- revisão antes/depois com campo, seção, tipo, risco e observação;
- descarte de alterações;
- simulação de publicação sem alterar o site real;
- histórico local do protótipo em `/studio/historico/`;
- Auditor orientando rascunhos, revisão, histórico e limites.

## Próxima fase recomendada

Fase 0.5 deve expandir o protótipo sem backend real:

1. rascunhos locais para Produtos e Páginas;
2. checklist visual mais completo antes de simular publicação;
3. exportação/importação local de rascunho para fase futura;
4. filtros no histórico local por módulo e status;
5. preparação do modelo de dados para a Fase 1.

## Fases futuras

Fase 1:
Primeiros formulários reais com persistência controlada.

Fase 2:
API própria, banco, armazenamento de mídia e autenticação real.

Fase 3:
Publicação com rascunho, preview, aprovação, histórico real e restauração.

## Fora do escopo atual

- login real;
- autenticação simulada;
- banco de dados;
- API;
- upload real;
- publicação real pelo Studio;
- loja, carrinho ou checkout;
- edição automática feita pelo Auditor.
