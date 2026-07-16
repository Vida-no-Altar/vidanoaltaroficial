import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function readText(path) {
  return readFile(join(root, path), 'utf8');
}

async function readJson(path) {
  return JSON.parse(await readText(path));
}

async function exists(path) {
  try {
    await access(join(root, path));
    return true;
  } catch {
    return false;
  }
}

function findAll(text, regex, group = 1) {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  return [...String(text).matchAll(new RegExp(regex.source, flags))].map((match) => match[group]);
}

function cleanPath(ref) {
  const clean = String(ref || '').split('#')[0].split('?')[0].replace(/^\.\//, '').replace(/^\//, '');
  const normalized = normalize(clean).replace(/\\/g, '/');
  return normalized === '.' ? '' : normalized;
}

function hasNoIndexNoFollow(text) {
  return /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/?\s*>/i.test(text);
}

function hasLocalAbsolutePath(text) {
  return /(^|[\s"'(`])[A-Za-z]:[\\/]/.test(text);
}

function isExternal(ref) {
  return /^(https?:|mailto:|tel:)/i.test(ref);
}

function basePathFor(filePath, text) {
  const baseMatch = String(text).match(/<base\s+href="([^"]+)"\s*\/?\s*>/i);
  if (!baseMatch) return dirname(filePath).replace(/\\/g, '/');
  return cleanPath(`${dirname(filePath)}/${baseMatch[1]}`);
}

function refsFor(filePath, text) {
  const base = basePathFor(filePath, text);
  return findAll(text, /(?:href|src)="(?!https?:|mailto:|#)([^"]+)"/g).map((ref) => `${base}/${ref}`);
}

const htmlFiles = [
  'index.html',
  'admin/index.html',
  'admin/auditor.html',
  'admin/assistente.html',
  'admin/legacy.html',
  'studio/index.html',
  'studio/paginas/index.html',
  'studio/editor/index.html',
  'studio/conteudos/index.html',
  'studio/produtos/index.html',
  'studio/midia/index.html',
  'studio/usuarios/index.html',
  'studio/historico/index.html',
  'studio/auditor/index.html',
  'studio/config/index.html',
];

const requiredFiles = [
  ...htmlFiles,
  'README.md',
  'robots.txt',
  'sitemap.xml',
  'hero-devocional.webp',
  'assets/styles.css',
  'assets/about-section.css',
  'assets/vna-intelligence.css',
  'assets/vna-intelligence.js',
  'assets/vna-studio.css',
  'assets/vna-studio-prototype.js',
  'content/site-content.json',
  'content/vna-core.json',
  'content/studio-core.json',
  'content/studio-context.json',
  'content/content-catalog.json',
  'content/product-catalog.json',
  'content/public-assistant.json',
  'content/admin-auditor.json',
  'content/affiliate-disclosure.json',
  'admin/config.yml',
  'docs/vna-studio.md',
  'docs/vna-studio-roadmap.md',
  'docs/vna-studio-architecture.md',
  'docs/vna-studio-drafts.md',
  'docs/studio-migration-plan.md',
  'docs/vna-intelligence-core.md',
  'docs/public-assistant.md',
  'docs/admin-auditor.md',
];

async function validateFilesExist() {
  for (const path of requiredFiles) check(await exists(path), `Arquivo obrigatório não encontrado: ${path}`);
}

async function validateJson() {
  const site = await readJson('content/site-content.json');
  const core = await readJson('content/vna-core.json');
  const studio = await readJson('content/studio-core.json');
  const studioContext = await readJson('content/studio-context.json');
  const contentCatalog = await readJson('content/content-catalog.json');
  const productCatalog = await readJson('content/product-catalog.json');
  const publicAssistant = await readJson('content/public-assistant.json');
  const auditor = await readJson('content/admin-auditor.json');
  const affiliate = await readJson('content/affiliate-disclosure.json');

  check(site.links?.youtube === 'https://www.youtube.com/@vidanoaltar.oficial', 'YouTube oficial incorreto.');
  check(site.links?.instagram === 'https://www.instagram.com/vidanoaltar.oficial', 'Instagram oficial incorreto.');
  check(site.links?.tiktok === 'https://www.tiktok.com/@vidanoaltar.oficial', 'TikTok oficial incorreto.');
  check(site.links?.email === 'contato@vidanoaltaroficial.com.br', 'E-mail oficial incorreto.');
  check(site.about?.image === 'public/images/matheus-sobre-vna.webp', 'Imagem da seção Sobre incorreta.');
  check(site.about?.imageAlt === 'Matheus, criador do Vida no Altar, segurando uma Bíblia', 'Alt text da seção Sobre incorreto.');

  check(core.name === 'VnA Intelligence Core', 'VnA Intelligence Core não identificado.');
  check(core.brand?.name === 'Vida no Altar', 'Marca institucional incorreta.');
  check(Array.isArray(core.projects) && core.projects.length >= 3, 'Projetos institucionais ativos insuficientes.');

  check(studio.name === 'VnA Studio', 'studio-core.json precisa nomear o VnA Studio.');
  check(studio.version === '0.4.0', 'studio-core.json precisa registrar versão 0.4.0.');
  check(studio.phase === 'Fase 0.4', 'studio-core.json precisa registrar Fase 0.4.');
  check(studio.contextSource === 'content/studio-context.json', 'Studio precisa apontar para content/studio-context.json.');
  check(studio.officialRoute === '/studio/', 'A rota oficial do Studio precisa ser /studio/.');
  check(Array.isArray(studio.routes) && studio.routes.length === 10, 'Studio precisa registrar as 10 rotas planejadas.');
  check(studio.routes.some((route) => route.path === '/studio/auditor/' && route.name === 'Auditor VnA'), 'Studio precisa registrar /studio/auditor/ como Auditor VnA.');
  check(studio.futureArchitecture?.hosting?.includes('Cloudflare Pages'), 'Arquitetura futura precisa documentar Cloudflare Pages.');
  check(studio.futureArchitecture?.api?.includes('Cloudflare Workers'), 'Arquitetura futura precisa documentar Workers.');
  check(studio.futureArchitecture?.database?.includes('Cloudflare D1'), 'Arquitetura futura precisa documentar D1.');
  check(studio.futureArchitecture?.storage?.includes('Cloudflare R2'), 'Arquitetura futura precisa documentar R2.');
  check(studio.plannedUsers?.some((user) => user.name === 'Matheus' && user.role === 'Proprietário'), 'Matheus precisa estar planejado como Proprietário.');
  check(studio.plannedUsers?.some((user) => user.name === 'Everaldo'), 'Everaldo precisa estar planejado.');
  check(studio.plannedUsers?.some((user) => user.name === 'Eliana'), 'Eliana precisa estar planejada.');
  check(studio.nonGoals?.includes('senha no JavaScript'), 'Studio precisa registrar que senha no JavaScript está fora do escopo.');
  check(Array.isArray(studio.phase03Scope) && studio.phase03Scope.length >= 6, 'studio-core.json precisa documentar escopo da Fase 0.3.');
  check(Array.isArray(studio.phase04Scope) && studio.phase04Scope.length >= 6, 'studio-core.json precisa documentar escopo da Fase 0.4.');

  check(studioContext.version === '0.4.0', 'studio-context.json precisa registrar versão 0.4.0.');
  check(studioContext.phase === 'Fase 0.4', 'studio-context.json precisa registrar Fase 0.4.');
  const expectedContexts = ['dashboard', 'paginas', 'editor', 'conteudos', 'produtos', 'midia', 'usuarios', 'historico', 'auditor', 'config'];
  for (const key of expectedContexts) {
    const context = studioContext.contexts?.[key];
    check(Boolean(context), `Contexto ausente no Studio: ${key}`);
    check(Array.isArray(context?.quickReplies) && context.quickReplies.length >= 4, `Contexto ${key} precisa ter sugestões rápidas.`);
    check(Array.isArray(context?.actions) && context.actions.length >= 3, `Contexto ${key} precisa listar ações.`);
    check(typeof context?.status === 'string' && context.status.length > 0, `Contexto ${key} precisa ter status.`);
  }
  const editorImageTask = studioContext.contexts?.editor?.tasks?.find((task) => task.id === 'change_image');
  const mediaImageTask = studioContext.contexts?.midia?.tasks?.find((task) => task.id === 'change_image');
  check(editorImageTask?.response?.includes('Você está no Editor visual'), 'Resposta contextual de imagem no Editor precisa citar Editor visual.');
  check(mediaImageTask?.response?.includes('Você está na Mídia'), 'Resposta contextual de imagem em Mídia precisa citar Mídia.');
  check(editorImageTask?.response !== mediaImageTask?.response, 'Mesma pergunta precisa ter respostas diferentes entre Editor e Mídia.');
  check(studioContext.contexts?.editor?.status === 'Funcional parcial', 'Editor precisa estar como Funcional parcial na Fase 0.4.');
  check(studioContext.contexts?.conteudos?.status === 'Funcional parcial', 'Conteúdos precisa estar como Funcional parcial na Fase 0.4.');
  check(studioContext.contexts?.midia?.status === 'Funcional parcial', 'Mídia precisa estar como Funcional parcial na Fase 0.4.');
  check(studioContext.contexts?.historico?.status === 'Funcional parcial', 'Histórico precisa estar como Funcional parcial na Fase 0.4.');
  check(studioContext.contexts?.editor?.quickReplies?.includes('Como salvo rascunho local?'), 'Editor precisa ter sugestão rápida de rascunho local.');
  check(studioContext.contexts?.conteudos?.quickReplies?.includes('Como reviso o conteúdo?'), 'Conteúdos precisa ter sugestão rápida de revisão.');
  check(studioContext.contexts?.midia?.quickReplies?.includes('Como reviso a mídia?'), 'Mídia precisa ter sugestão rápida de revisão de mídia.');
  check(studioContext.contexts?.produtos?.quickReplies?.includes('Como adicionar link afiliado?'), 'Produtos precisa ter sugestão rápida de afiliado.');
  check(studioContext.contexts?.usuarios?.quickReplies?.includes('Quando pedir aprovação ao Matheus?'), 'Usuários precisa ter sugestão rápida de aprovação.');

  check(Array.isArray(contentCatalog.items), 'Catálogo de conteúdos precisa ter lista items.');
  check(contentCatalog.note?.includes('link real publicado'), 'Catálogo público precisa deixar claro que só recebe itens com link real.');
  check(Array.isArray(productCatalog.products), 'Catálogo de produtos precisa ter lista products.');
  check(productCatalog.guidedBibleDiagnosis?.questions?.some((item) => item.key === 'churchTranslation'), 'Diagnóstico precisa perguntar tradução usada na igreja.');
  check(publicAssistant.name === 'Assistente VnA', 'Assistente Público incorreto.');
  check(publicAssistant.modes?.length >= 3, 'Assistente Público precisa manter modos públicos úteis.');

  check(auditor.name === 'Auditor VnA', 'Auditor precisa se apresentar como Auditor VnA.');
  check(auditor.type === 'studio-auditor', 'Auditor precisa ser módulo do VnA Studio.');
  check(auditor.initialMessage?.startsWith('Olá! Eu sou o Auditor VnA.'), 'Mensagem inicial do Auditor precisa usar Auditor VnA.');
  check(auditor.fallback?.includes('VnA Studio'), 'Auditor precisa orientar a estrutura do VnA Studio.');

  const requiredQuickReplies = [
    'Onde edito textos no Studio?',
    'Como criar uma página?',
    'Como cadastrar um conteúdo?',
    'Como cadastrar uma Bíblia ou livro?',
    'Como trocar uma imagem?',
    'Como revisar antes de publicar?',
    'O que ainda é protótipo?',
  ];
  for (const reply of requiredQuickReplies) {
    check(auditor.quickReplies?.includes(reply), `Sugestão rápida ausente no Auditor: ${reply}`);
  }

  const auditorIntents = (auditor.modes || []).flatMap((mode) => (mode.intents || []).map((intent) => ({ ...intent, modeId: mode.id })));
  const editTextIntent = auditorIntents.find((intent) => intent.id === 'edit_site_texts');
  check(editTextIntent?.response?.includes('Studio > Páginas > Home'), 'Resposta de edição de textos precisa apontar para Studio > Páginas > Home.');
  check(editTextIntent?.response?.includes('Studio > Editor'), 'Resposta de edição de textos precisa apontar para Studio > Editor.');
  check(!editTextIntent?.response?.includes('content/site-content.json'), 'Resposta de edição de textos não deve citar content/site-content.json.');

  const commonForbiddenPatterns = [
    /content\/site-content\.json/i,
    /content\/content-catalog\.json/i,
    /content\/product-catalog\.json/i,
    /edite o arquivo/i,
    /abra o json/i,
    /mexa no html/i,
    /altere o css/i,
    /vá no github/i,
    /va no github/i,
  ];
  for (const mode of auditor.modes || []) {
    if (mode.id === 'tecnico') continue;
    for (const intent of mode.intents || []) {
      for (const pattern of commonForbiddenPatterns) {
        check(!pattern.test(intent.response || ''), `Resposta comum do Auditor não deve orientar edição técnica: ${mode.id}/${intent.id}`);
      }
    }
  }
  for (const context of Object.values(studioContext.contexts || {})) {
    for (const task of context.tasks || []) {
      for (const pattern of commonForbiddenPatterns) {
        check(!pattern.test(task.response || ''), `Resposta contextual do Auditor não deve orientar edição técnica: ${context.module}/${task.id}`);
      }
    }
  }

  check(affiliate.text?.includes('Alguns links podem ser de afiliado'), 'Aviso de afiliado ausente.');
}

async function validateHtml() {
  const entries = await Promise.all(htmlFiles.map(async (path) => [path, await readText(path)]));
  const files = Object.fromEntries(entries);

  check(files['index.html'].includes('<html lang="pt-BR">'), 'index.html precisa declarar pt-BR.');
  check(files['index.html'].includes('data-vna-intelligence="public"'), 'Site público precisa preservar o Assistente Público.');
  check(files['index.html'].includes('public/images/matheus-sobre-vna.png'), 'Site público precisa preservar a imagem do Sobre.');
  check(files['index.html'].includes('type="application/ld+json"'), 'Site público precisa manter dados estruturados JSON-LD.');
  check(files['index.html'].includes('"@type": "Organization"'), 'JSON-LD precisa identificar o Vida no Altar como organização.');
  check(files['index.html'].includes('"url": "https://vidanoaltaroficial.com.br/"'), 'JSON-LD precisa preservar a URL oficial.');
  check(files['index.html'].includes('"logo": "https://vidanoaltaroficial.com.br/public/images/logo-vida-no-altar.svg"'), 'JSON-LD precisa apontar para a logo oficial.');
  check(files['index.html'].includes('"https://www.youtube.com/@vidanoaltar.oficial"'), 'JSON-LD precisa preservar o YouTube oficial.');
  check(files['index.html'].includes('"https://www.instagram.com/vidanoaltar.oficial"'), 'JSON-LD precisa preservar o Instagram oficial.');
  check(files['index.html'].includes('"https://www.tiktok.com/@vidanoaltar.oficial"'), 'JSON-LD precisa preservar o TikTok oficial.');
  check(files['index.html'].includes('"email": "contato@vidanoaltaroficial.com.br"'), 'JSON-LD precisa preservar o e-mail oficial.');

  check(files['admin/index.html'].includes('O Admin agora é VnA Studio'), '/admin/ precisa avisar migração.');
  check(files['admin/index.html'].includes('../studio/'), '/admin/ precisa apontar para /studio/.');
  check(files['admin/auditor.html'].includes('../studio/auditor/'), '/admin/auditor.html precisa apontar para /studio/auditor/.');
  check(files['admin/assistente.html'].includes('Assistente legado'), '/admin/assistente.html precisa ser legado.');
  check(files['admin/legacy.html'].includes('Editor técnico legado'), '/admin/legacy.html precisa preservar editor legado.');
  check(files['admin/legacy.html'].includes('decap-cms'), '/admin/legacy.html precisa manter Decap CMS temporariamente.');

  for (const path of htmlFiles.filter((item) => item.startsWith('admin/') || item.startsWith('studio/'))) {
    check(hasNoIndexNoFollow(files[path]), `${path} precisa ser noindex,nofollow.`);
  }

  check(files['studio/index.html'].includes('VnA Studio'), '/studio/ precisa abrir dashboard.');
  check(files['studio/index.html'].includes('Fase 0.4'), '/studio/ precisa indicar Fase 0.4.');
  check(files['studio/auditor/index.html'].includes('data-vna-intelligence="auditor"'), '/studio/auditor/ precisa carregar o Auditor.');
  check(files['studio/auditor/index.html'].includes('<base href="../../"'), '/studio/auditor/ precisa ter base compatível com GitHub Pages.');
  const oldAuditorName = ['Auditor', 'Admin', 'VnA'].join(' ');
  check(!files['studio/auditor/index.html'].includes(oldAuditorName), '/studio/auditor/ não deve mostrar o nome antigo do módulo.');
  check(files['studio/auditor/index.html'].includes('Registros salvos apenas neste navegador para apoiar testes do protótipo. Isso ainda não é auditoria real multiusuário.'), 'Histórico local do Auditor precisa usar o texto correto.');

  const studioContextByFile = {
    'studio/index.html': 'dashboard',
    'studio/paginas/index.html': 'paginas',
    'studio/editor/index.html': 'editor',
    'studio/conteudos/index.html': 'conteudos',
    'studio/produtos/index.html': 'produtos',
    'studio/midia/index.html': 'midia',
    'studio/usuarios/index.html': 'usuarios',
    'studio/historico/index.html': 'historico',
    'studio/auditor/index.html': 'auditor',
    'studio/config/index.html': 'config',
  };
  for (const [path, context] of Object.entries(studioContextByFile)) {
    check(files[path].includes(`data-studio-context="${context}"`), `${path} precisa declarar data-studio-context="${context}".`);
    check(files[path].includes('studio-status'), `${path} precisa mostrar badges/status da fase.`);
  }
  for (const path of Object.keys(studioContextByFile).filter((item) => item !== 'studio/auditor/index.html')) {
    check(files[path].includes('data-vna-intelligence="studio-auditor"'), `${path} precisa carregar o widget contextual do Auditor.`);
    check(files[path].includes('data-vna-root='), `${path} precisa informar raiz para carregar JSONs.`);
  }
  check(files['studio/editor/index.html'].includes('data-studio-prototype="home-editor"'), '/studio/editor/ precisa ter protótipo de edição da Home.');
  check(files['studio/editor/index.html'].includes('data-studio-field="hero-title"'), '/studio/editor/ precisa ter campo de título do Hero.');
  check(files['studio/editor/index.html'].includes('Salvar rascunho local'), '/studio/editor/ precisa permitir salvar rascunho local.');
  check(files['studio/editor/index.html'].includes('Revisar alterações'), '/studio/editor/ precisa permitir revisar alterações.');
  check(files['studio/editor/index.html'].includes('Descartar alterações'), '/studio/editor/ precisa permitir descartar alterações.');
  check(files['studio/editor/index.html'].includes('Simular publicação'), '/studio/editor/ precisa permitir simular publicação.');
  check(files['studio/conteudos/index.html'].includes('data-studio-prototype="content-editor"'), '/studio/conteudos/ precisa ter formulário simulado de conteúdo.');
  check(files['studio/conteudos/index.html'].includes('data-studio-field'), '/studio/conteudos/ precisa usar data-studio-field nos campos.');
  check(files['studio/conteudos/index.html'].includes('data-studio-field="content-status"'), '/studio/conteudos/ precisa ter campo de status.');
  check(files['studio/conteudos/index.html'].includes('Este cadastro ainda é simulado'), '/studio/conteudos/ precisa avisar que cadastro é simulado.');
  check(files['studio/conteudos/index.html'].includes('Salvar rascunho local'), '/studio/conteudos/ precisa permitir salvar rascunho local.');
  check(files['studio/conteudos/index.html'].includes('Revisar conteúdo'), '/studio/conteudos/ precisa permitir revisar conteúdo.');
  check(files['studio/conteudos/index.html'].includes('Simular publicação'), '/studio/conteudos/ precisa permitir simular publicação.');
  check(files['studio/conteudos/index.html'].includes('preview-content-card') || files['studio/conteudos/index.html'].includes('Preview do card'), '/studio/conteudos/ precisa ter preview de card.');
  check(files['studio/midia/index.html'].includes('data-studio-prototype="media-editor"'), '/studio/midia/ precisa ter editor visual simulado de mídia.');
  check(files['studio/midia/index.html'].includes('data-studio-field'), '/studio/midia/ precisa usar data-studio-field nos campos.');
  check(files['studio/midia/index.html'].includes('data-studio-field="image-opacity"'), '/studio/midia/ precisa ter controle de opacidade.');
  check(files['studio/midia/index.html'].includes('data-studio-field="alt-text"') || files['studio/midia/index.html'].includes('Alt text'), '/studio/midia/ precisa ter campo de alt text.');
  check(files['studio/midia/index.html'].includes('Upload real será implementado'), '/studio/midia/ precisa avisar que upload real é futuro.');
  check(files['studio/midia/index.html'].includes('Salvar rascunho local'), '/studio/midia/ precisa permitir salvar rascunho local.');
  check(files['studio/midia/index.html'].includes('Revisar alterações'), '/studio/midia/ precisa permitir revisar alterações.');
  check(files['studio/midia/index.html'].includes('Simular publicação'), '/studio/midia/ precisa permitir simular publicação.');
  check(files['studio/historico/index.html'].includes('data-studio-history'), '/studio/historico/ precisa listar histórico local.');
  check(!files['studio/historico/index.html'].includes('Comparação: futuro'), '/studio/historico/ não pode manter texto antigo de comparação futura.');
  check(!files['studio/historico/index.html'].includes('Restaurar: futuro'), '/studio/historico/ não pode manter texto antigo de restauração futura.');
  check(!files['studio/historico/index.html'].includes('Histórico local parcial'), '/studio/historico/ não pode manter texto antigo de histórico parcial.');
  for (const path of ['studio/editor/index.html', 'studio/conteudos/index.html', 'studio/midia/index.html', 'studio/historico/index.html']) {
    check(files[path].includes('assets/vna-studio-prototype.js') || files[path].includes('../../assets/vna-studio-prototype.js'), `${path} precisa carregar assets/vna-studio-prototype.js.`);
  }

  const ids = findAll(files['index.html'], /\sid="([^"]+)"/g);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  check(duplicates.length === 0, `IDs duplicados no site público: ${[...new Set(duplicates)].join(', ')}`);

  const anchors = findAll(files['index.html'], /href="#([^"]+)"/g);
  const missingAnchors = [...new Set(anchors)].filter((anchor) => !ids.includes(anchor));
  check(missingAnchors.length === 0, `Âncoras sem destino: ${missingAnchors.join(', ')}`);

  const refs = entries.flatMap(([path, text]) => refsFor(path, text));
  const missingRefs = [];
  for (const ref of [...new Set(refs)]) {
    const path = cleanPath(ref);
    if (!path || isExternal(path)) continue;
    if (!(await exists(path))) missingRefs.push(ref);
  }
  check(missingRefs.length === 0, `Arquivos referenciados não encontrados: ${missingRefs.join(', ')}`);
}

async function validateDocsSafetyAndConfig() {
  const texts = await Promise.all(requiredFiles.map(readText));
  const allText = texts.join('\n');
  const robots = await readText('robots.txt');
  const readme = await readText('README.md');
  const config = await readText('admin/config.yml');
  const intelligence = await readText('assets/vna-intelligence.js');
  const studioPrototype = await readText('assets/vna-studio-prototype.js');

  check(robots.includes('Disallow: /admin/'), 'robots.txt precisa bloquear /admin/.');
  check(robots.includes('Disallow: /studio/'), 'robots.txt precisa bloquear /studio/.');
  check(readme.includes('VnA Studio'), 'README precisa documentar VnA Studio.');
  check(readme.includes('Fase 0.4'), 'README precisa documentar Fase 0.4.');
  check(readme.includes('/studio/auditor/'), 'README precisa documentar /studio/auditor/.');
  check(readme.includes('content/studio-context.json'), 'README precisa documentar content/studio-context.json.');
  check(readme.includes('assets/vna-studio-prototype.js'), 'README precisa documentar o script de preview local.');
  check(readme.includes('/studio/historico/'), 'README precisa documentar o histórico local do Studio.');
  check(readme.includes('Ele não deve orientar usuários leigos a editar arquivos do projeto.'), 'README precisa explicar o papel correto do Auditor VnA.');
  check(intelligence.includes('studioContext'), 'Motor precisa carregar contexto do Studio.');
  check(intelligence.includes('data-vna-intelligence') && intelligence.includes('studio-auditor'), 'Motor precisa suportar widget contextual do Studio.');
  check(studioPrototype.includes('data-preview-text') && studioPrototype.includes('data-preview-opacity'), 'Script de protótipo precisa atualizar textos e opacidade.');
  check(studioPrototype.includes('saveLocalDraft') && studioPrototype.includes('renderReview'), 'Script de protótipo precisa controlar rascunho local e revisão.');
  check(studioPrototype.includes('registerLocalHistory') && studioPrototype.includes('simulatePublish'), 'Script de protótipo precisa registrar histórico local e simular publicação.');
  check(!intelligence.includes('Risco estimado:'), 'Auditor não deve montar respostas começando com Risco estimado.');
  check(!intelligence.includes('Não coloque segredos no repositório'), 'Auditor não deve despejar aviso técnico de repositório em perguntas comuns.');
  check(config.includes('repo: Vida-no-Altar/vidanoaltaroficial'), 'admin/config.yml precisa apontar para o repositório oficial.');
  check(config.includes('file: "content/site-content.json"'), 'admin/config.yml precisa editar content/site-content.json.');
  check(config.includes('media_folder: "public/uploads"'), 'admin/config.yml precisa salvar mídias em public/uploads.');
  check(!/wa\.me|vidanoaltar\.store@gmail\.com|whatsapp/i.test(allText), 'Não deve haver canal provisório ou mensageiro externo proibido.');
  check(!hasLocalAbsolutePath(allText), 'Não deve haver caminho local absoluto em arquivos publicados.');
  check(!['OpenAI', 'ChatGPT', 'Gemini', 'Claude'].some((term) => allText.toLowerCase().includes(term.toLowerCase())), 'Interface e documentação não devem mencionar fornecedores de IA.');
}

async function waitForServer(url, tries = 40) {
  for (let index = 0; index < tries; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 150));
    }
  }
  return false;
}

async function validateServerRoutes() {
  const port = String(4700 + Math.floor(Math.random() * 1000));
  const server = spawn(process.execPath, ['serve.mjs'], { cwd: root, env: { ...process.env, PORT: port }, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

  try {
    const baseUrl = `http://127.0.0.1:${port}`;
    const ready = await waitForServer(`${baseUrl}/`);
    check(ready, `Servidor local não iniciou corretamente. Saída: ${serverOutput.trim()}`);
    if (!ready) return;

    const routes = [
      ['/', 'VIDA NO ALTAR'],
      ['/projetos/', '../#projetos'],
      ['/links/', '../#links'],
      ['/sobre/', '../#sobre'],
      ['/contato/', '../#contato'],
      ['/studio/', 'Fase 0.4'],
      ['/studio/paginas/', 'data-studio-context="paginas"'],
      ['/studio/editor/', 'data-studio-context="editor"'],
      ['/studio/conteudos/', 'data-studio-context="conteudos"'],
      ['/studio/produtos/', 'data-studio-context="produtos"'],
      ['/studio/midia/', 'data-studio-context="midia"'],
      ['/studio/usuarios/', 'data-studio-context="usuarios"'],
      ['/studio/historico/', 'data-studio-context="historico"'],
      ['/studio/auditor/', 'Auditor VnA'],
      ['/studio/config/', 'data-studio-context="config"'],
      ['/admin/', 'O Admin agora é VnA Studio'],
      ['/admin/auditor.html', 'Auditor agora está no VnA Studio'],
      ['/admin/assistente.html', 'Assistente legado'],
      ['/admin/legacy.html', 'Editor técnico legado'],
      ['/assets/vna-intelligence.js', 'startBibleFlow'],
      ['/assets/vna-intelligence.js', 'studioContext'],
      ['/assets/vna-intelligence.css', '.vna-intel-fab'],
      ['/assets/vna-studio.css', '.studio-shell'],
      ['/assets/vna-studio-prototype.js', 'saveLocalDraft'],
      ['/content/vna-core.json', 'VnA Intelligence Core'],
      ['/content/studio-core.json', 'Fase 0.4'],
      ['/content/studio-context.json', 'Editor visual'],
      ['/content/content-catalog.json', 'link real publicado'],
      ['/content/product-catalog.json', 'Bíblia para começar'],
      ['/content/public-assistant.json', 'Assistente VnA'],
      ['/content/admin-auditor.json', 'Auditor VnA'],
      ['/content/affiliate-disclosure.json', 'Alguns links podem ser de afiliado'],
      ['/content/site-content.json', 'Presença que transforma gerações'],
      ['/robots.txt', 'Disallow: /studio/'],
      ['/sitemap.xml', '<urlset'],
    ];

    for (const [route, expectedText] of routes) {
      const response = await fetch(`${baseUrl}${route}`);
      const body = await response.text();
      check(response.ok, `Rota ${route} retornou status ${response.status}.`);
      check(body.includes(expectedText), `Rota ${route} não contém o texto esperado.`);
    }
  } finally {
    server.kill('SIGTERM');
  }
}

async function main() {
  await validateFilesExist();
  await validateJson();
  await validateHtml();
  await validateDocsSafetyAndConfig();
  await validateServerRoutes();

  if (failures.length > 0) {
    console.error('Validação encontrou problemas:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Validação do Vida no Altar concluída com sucesso.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});



