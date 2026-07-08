# Rascunhos locais do VnA Studio

## Visão geral

A Fase 0.4 adiciona rascunhos locais ao VnA Studio para testar a experiência de edição antes de existir login, banco de dados, API ou publicação real.

O objetivo é validar o fluxo:

1. editar campos simulados;
2. ver alterações não salvas;
3. salvar rascunho local;
4. revisar antes/depois;
5. descartar alterações ou simular publicação;
6. ver o registro em `/studio/historico/`.

## O que é rascunho local

Rascunho local é um estado salvo apenas no navegador usando `localStorage`.

Ele serve para testar a experiência do Studio. Ele não é persistência real, não é banco de dados, não é auditoria real e não altera o site público.

## Revisão antes/depois

A revisão mostra:

- seção alterada;
- campo alterado;
- valor original;
- valor novo;
- tipo de alteração;
- risco estimado;
- observação simples do Auditor.

Em Conteúdos, a revisão também alerta sobre título, link, projeto, descrição e status publicado em protótipo.

Em Mídia, a revisão alerta sobre alt text vazio, opacidade baixa e imagem pequena demais.

## Histórico local

`/studio/historico/` lista registros locais do protótipo:

- rascunho local;
- revisão feita;
- simulação de publicação;
- descarte.

O usuário simulado é Matheus. Isso não é segurança real nem auditoria multiusuário.

## O que ainda não é real

- login;
- permissões;
- banco de dados;
- API;
- upload;
- publicação;
- restauração;
- auditoria multiusuário.

## Como testar

Abra:

```text
/studio/editor/
/studio/conteudos/
/studio/midia/
```

Altere campos, salve rascunho local, revise antes/depois e acesse:

```text
/studio/historico/
```

## Próximo passo

A Fase 0.5 deve expandir o mesmo padrão para Produtos e Páginas e preparar exportação/importação controlada de rascunhos para a Fase 1.
