# VnA Intelligence Core

## Visão geral

O VnA Intelligence Core é a primeira camada inteligente e estática do site oficial do Vida no Altar.

Ele não é IA generativa. Ele funciona com regras, intenções, palavras-chave, pontuação simples, catálogos JSON e respostas controladas.

Objetivo da V1:

- organizar a base institucional;
- orientar visitantes pelo Assistente Público VnA;
- orientar o administrador pelo Auditor Admin VnA;
- estruturar busca em catálogo de conteúdos;
- preparar recomendação futura de Bíblias e livros;
- registrar regras éticas para links afiliados.

## Arquitetura

Arquivos centrais:

```text
content/vna-core.json
content/content-catalog.json
content/product-catalog.json
content/public-assistant.json
content/admin-auditor.json
content/affiliate-disclosure.json
assets/vna-intelligence.js
assets/vna-intelligence.css
admin/auditor.html
```

Arquivos preservados por compatibilidade:

```text
content/knowledge-base.json
content/agent-public.json
content/agent-admin.json
assets/vna-agents.js
assets/vna-agents.css
admin/assistente.html
```

## Como funciona o motor

O arquivo `assets/vna-intelligence.js` faz:

1. Carrega JSONs locais com `fetch`.
2. Normaliza texto do usuário.
3. Converte para minúsculas.
4. Remove acentos.
5. Remove pontuação desnecessária.
6. Compara palavras-chave por intenção.
7. Calcula pontuação.
8. Escolhe a intenção mais forte.
9. Busca conteúdos no catálogo quando a pergunta pede tema, formato, projeto ou versículo.
10. Inicia fluxo guiado quando a pessoa pede ajuda para escolher uma Bíblia.
11. Usa fallback seguro quando não encontra resposta suficiente.

Tudo roda no navegador, sem servidor próprio obrigatório.

## Assistente Público e Auditor Admin

Assistente Público VnA:

- aparece no site público como widget;
- orienta visitantes;
- tem modos Descobrir, Encontrar, Entender e Escolher;
- usa `content/public-assistant.json`;
- consulta `content/content-catalog.json` e `content/product-catalog.json`.

Auditor Admin VnA:

- fica em `/admin/auditor.html`;
- orienta edição, revisão, segurança e publicação;
- tem modos Conteúdo, Técnico, SEO, Segurança e Publicação;
- usa `content/admin-auditor.json`;
- registra histórico local em `localStorage`.

## Regras éticas

O assistente público:

- não assume papel pastoral;
- não substitui liderança madura da igreja local;
- não faz aconselhamento médico, psicológico, jurídico ou financeiro;
- não decide a vontade de Deus para uma pessoa;
- não entra em disputa de tradução bíblica;
- não inventa conteúdo, produto ou link.

O recomendador futuro precisa respeitar esta ordem:

1. Perfil da pessoa.
2. Necessidade real.
3. Compatibilidade com a igreja.
4. Compreensão da tradução.
5. Objetivo de uso.
6. Orçamento.
7. Disponibilidade.
8. Link afiliado.

Comissão nunca é critério principal.

## Recomendador de Bíblias

A estrutura inicial fica em:

```text
content/product-catalog.json
```

A V1 tem fluxo guiado, mas ainda não possui produtos reais cadastrados.

O fluxo pergunta em etapas sobre:

- uso pessoal ou presente;
- faixa etária;
- tradução usada na igreja;
- certeza dessa informação;
- abertura para outras traduções;
- facilidade de leitura;
- uso principal;
- costume de leitura;
- preferência de linguagem;
- notas de estudo;
- recursos úteis;
- tamanho, peso e letra;
- orçamento;
- preferência de loja.

Se houver conflito entre tradução da igreja e compreensão da pessoa, o assistente explica caminhos práticos sem diminuir nenhuma tradução.

## Afiliados

O aviso fica em:

```text
content/affiliate-disclosure.json
```

Texto base:

```text
Alguns links podem ser de afiliado. Isso significa que o Vida no Altar pode receber uma comissão se você comprar por eles, sem custo adicional para você.
```

Na V1, produtos reais ainda não estão cadastrados. O assistente não deve inventar recomendações.

## Limites técnicos da V1

- O site é estático.
- Os JSONs são públicos.
- Não há banco de dados.
- Não há autenticação própria do Intelligence Core.
- O histórico do auditor é local no navegador.
- Não existe auditoria real multiusuário.
- Alterações de conteúdo ainda são feitas no repositório ou painel configurado.

## Próximos passos

- Cadastrar conteúdos reais com links diretos.
- Cadastrar produtos revisados e aprovados.
- Editar novos JSONs pelo painel admin no futuro.
- Criar páginas internas para conteúdos.
- Criar auditoria real apenas quando houver backend ou integração segura.
