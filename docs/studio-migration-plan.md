# Plano de migração do Admin para o VnA Studio

## Objetivo

Migrar o Admin atual para o VnA Studio sem quebrar o site público, o Assistente Público VnA, o VnA Intelligence Core, GitHub Pages ou Cloudflare Pages.

## Estado anterior

O Admin antigo tinha três funções principais:

- `/admin/`: editor técnico baseado em Decap CMS.
- `/admin/auditor.html`: rota legada do auditor administrativo.
- `/admin/assistente.html`: assistente administrativo legado.

## Estado da Fase 0

- `/studio/` passa a ser a rota oficial.
- `/studio/auditor/` recebe o Auditor VnA como módulo interno do Studio.
- `/admin/` passa a exibir aviso de migração.
- `/admin/auditor.html` aponta para `/studio/auditor/`.
- `/admin/assistente.html` fica marcado como legado.
- `/admin/legacy.html` preserva o Decap CMS temporariamente.

## Decisão sobre o assistente legado

O assistente administrativo antigo é redundante em relação ao Auditor VnA. Ele deve ser mantido apenas como referência durante a transição e removido em uma fase futura, depois que o Auditor VnA cobrir todos os fluxos necessários no Studio.

## Decisão sobre o Auditor VnA

O Auditor VnA deve ensinar o uso do Studio, não transformar o usuário comum em editor técnico.

Para perguntas de rotina, a orientação correta é por módulos visuais:

- Studio > Páginas
- Studio > Editor
- Studio > Conteúdos
- Studio > Produtos
- Studio > Mídia
- Studio > Configurações

A camada de arquivos continua existindo apenas como base técnica da Fase 0 e deve ficar restrita à manutenção do projeto.

## Riscos

Baixo:
Correções de texto nas telas do Studio e avisos legados.

Médio:
Alterar caminhos de rotas internas ou nomes de módulos.

Alto:
Remover o Decap legado antes de existir editor visual real.

Crítico:
Adicionar autenticação improvisada, senha no front-end, tokens no repositório, alterações de DNS ou publicação sem validação.

## Critérios de saída da Fase 0

- `/studio/` abre como dashboard estático.
- Todas as rotas planejadas de `/studio/` são navegáveis.
- O Auditor VnA funciona em `/studio/auditor/`.
- `/admin/` não compete mais como painel principal.
- O editor técnico legado continua disponível como ponte temporária.
- A documentação explica limites e arquitetura futura.
- `npm test` passa.

## Próxima fase sugerida

Fase 1 deve priorizar formulários reais no Studio para editar textos, páginas, conteúdos e produtos sem abrir arquivos manualmente. A persistência real deve vir depois, com API própria, banco e fluxo de publicação controlado.
