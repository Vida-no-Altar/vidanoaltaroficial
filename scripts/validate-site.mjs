import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function fail(message) { failures.push(message); }
function check(condition, message) { if (!condition) fail(message); }

async function readText(path) { return readFile(join(root, path), 'utf8'); }
async function readJson(path) { return JSON.parse(await readText(path)); }

async function exists(path) {
  try {
    await access(join(root, path));
    return true;
  } catch {
    return false;
  }
}

function unique(values) { return [...new Set(values)]; }
function collectMatches(text, regex, group = 1) { return [...text.matchAll(regex)].map((match) => match[group]); }
function isExternal(ref) { return /^(https?:|mailto:|tel:)/i.test(ref); }

function localPathFromRef(ref) {
  const clean = String(ref || '').split('#')[0].split('?')[0].replace(/^\.\//, '').replace(/^\//, '');
  const normalized = normalize(clean).replace(/\\/g, '/').replace(/^\.\//, '');
  return normalized === '.' ? '' : normalized;
}

function hasNoIndexNoFollow(text) {
  return /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/>/i.test(text);
}

function includesAny(text, terms) {
  return terms.some((term) => text.toLowerCase().includes(term.toLowerCase()));
}

function hasLocalAbsolutePath(text) {
  return /(^|[^a-zA-Z])[a-zA-Z]:[\\/]/.test(text);
}

async function validateSiteContent() {
  const data = await readJson('content/site-content.json');

  check(data.meta?.title, 'content/site-content.json precisa de meta.title.');
  check(data.meta?.description, 'content/site-content.json precisa de meta.description.');
  check(data.links?.youtube === 'https://www.youtube.com/@vidanoaltar.oficial', 'Link do YouTube precisa ser o oficial.');
  check(data.links?.instagram === 'https://www.instagram.com/vidanoaltar.oficial', 'Link do Instagram precisa ser o oficial.');
  check(data.links?.tiktok === 'https://www.tiktok.com/@vidanoaltar.oficial', 'Link do TikTok precisa ser o oficial.');
  check(data.links?.email === 'contato@vidanoaltaroficial.com.br', 'E-mail oficial precisa ser contato@vidanoaltaroficial.com.br.');
  check(Array.isArray(data.projects?.items) && data.projects.items.length >= 6, 'Projetos precisam ter pelo menos 6 itens.');
  check(data.about?.image === 'public/images/matheus-sobre-vna.webp', 'Seção Sobre precisa apontar para a imagem WebP do Matheus.');
  check(data.about?.imageAlt === 'Matheus, criador do Vida no Altar, segurando uma Bíblia', 'Alt text da imagem Sobre precisa ser preservado.');

  if (data.hero?.image) check(await exists(localPathFromRef(data.hero.image)), `Imagem do hero nao encontrada: ${data.hero.image}`);
}

async function validateIntelligenceCore() {
  const core = await readJson('content/vna-core.json');
  const contentCatalog = await readJson('content/content-catalog.json');
  const productCatalog = await readJson('content/product-catalog.json');
  const publicAssistant = await readJson('content/public-assistant.json');
  const adminAuditor = await readJson('content/admin-auditor.json');
  const affiliate = await readJson('content/affiliate-disclosure.json');
  const knowledge = await readJson('content/knowledge-base.json');
  const publicLegacy = await readJson('content/agent-public.json');
  const adminLegacy = await readJson('content/agent-admin.json');
  const intelligenceScript = await readText('assets/vna-intelligence.js');
  const intelligenceCss = await readText('assets/vna-intelligence.css');

  check(core.name === 'VnA Intelligence Core', 'vna-core.json precisa nomear o núcleo VnA Intelligence Core.');
  check(core.brand?.name === 'Vida no Altar', 'vna-core.json precisa conter a marca Vida no Altar.');
  check(core.contact?.email === 'contato@vidanoaltaroficial.com.br', 'vna-core.json precisa usar o e-mail oficial.');
  check(Array.isArray(core.projects) && core.projects.length >= 6, 'vna-core.json precisa listar os projetos do VnA.');
  check(core.social?.youtube === 'https://www.youtube.com/@vidanoaltar.oficial', 'vna-core.json precisa usar o YouTube oficial.');

  check(Array.isArray(contentCatalog.items) && contentCatalog.items.length >= 6, 'content-catalog.json precisa ter exemplos iniciais.');
  for (const item of contentCatalog.items || []) check(item.id && item.title && item.project && item.primaryTheme && item.status, `Conteudo incompleto no catalogo: ${item.id || item.title}`);

  check(Array.isArray(productCatalog.categories) && productCatalog.categories.includes('Bíblia para começar'), 'product-catalog.json precisa ter categorias iniciais.');
  check(Array.isArray(productCatalog.products), 'product-catalog.json precisa ter lista products.');
  check(productCatalog.recommendationRule?.includes('Comissão nunca deve ser critério principal'), 'product-catalog.json precisa registrar regra ética de afiliados.');
  const questions = productCatalog.guidedBibleDiagnosis?.questions || [];
  check(questions.length >= 16, 'Diagnóstico de Bíblia precisa ter pelo menos 16 perguntas.');
  check(questions.some((item) => item.key === 'churchTranslation'), 'Diagnóstico precisa perguntar qual tradução a igreja usa.');
  check(questions.some((item) => item.key === 'certainty'), 'Diagnóstico precisa perguntar se a informação é certeza ou impressão.');

  check(affiliate.text?.includes('Alguns links podem ser de afiliado'), 'affiliate-disclosure.json precisa conter aviso de afiliado.');
  check(affiliate.ethicalRule?.includes('Comissão nunca deve ser critério principal'), 'affiliate-disclosure.json precisa conter regra ética.');

  check(publicAssistant.name === 'Assistente VnA', 'public-assistant.json precisa usar o nome Assistente VnA.');
  check(Array.isArray(publicAssistant.modes) && publicAssistant.modes.length === 4, 'Assistente público precisa ter 4 modos conceituais.');
  check(publicAssistant.modes.map((mode) => mode.id).join(',') === 'descobrir,encontrar,entender,escolher', 'Modos públicos precisam ser Descobrir, Encontrar, Entender e Escolher.');
  check(publicAssistant.modes.some((mode) => (mode.intents || []).some((intent) => intent.startBibleFlow)), 'Assistente público precisa iniciar o fluxo de Bíblia.');

  check(adminAuditor.name === 'Auditor Admin VnA', 'admin-auditor.json precisa manter compatibilidade com o Auditor Admin VnA.');
  check(adminAuditor.fallback?.includes('studio/'), 'admin-auditor.json precisa orientar a nova estrutura studio/.');
  check(Array.isArray(adminAuditor.modes) && adminAuditor.modes.length === 5, 'Auditor precisa ter 5 modos.');
  check(adminAuditor.modes.map((mode) => mode.id).join(',') === 'conteudo,tecnico,seo,seguranca,publicacao', 'Modos do auditor precisam ser Conteúdo, Técnico, SEO, Segurança e Publicação.');
  check(Array.isArray(adminAuditor.riskMatrix) && adminAuditor.riskMatrix.length === 4, 'Auditor precisa ter matriz de risco com 4 níveis.');

  check(knowledge.brand?.name === 'Vida no Altar', 'knowledge-base.json precisa continuar compatível.');
  check(publicLegacy.name === 'Assistente VnA', 'agent-public.json legado precisa continuar válido.');
  check(adminLegacy.name === 'Assistente Admin VnA', 'agent-admin.json legado precisa continuar válido.');

  check(intelligenceScript.includes('scoreIntent'), 'vna-intelligence.js precisa calcular pontuação por intenção.');
  check(intelligenceScript.includes('searchContentCatalog'), 'vna-intelligence.js precisa buscar no catálogo de conteúdos.');
  check(intelligenceScript.includes('startBibleFlow'), 'vna-intelligence.js precisa ter fluxo guiado de Bíblia.');
  check(intelligenceScript.includes('localStorage'), 'vna-intelligence.js precisa documentar histórico local do auditor.');
  check(intelligenceCss.includes('.vna-intel-fab'), 'vna-intelligence.css precisa estilizar o widget público.');
  check(intelligenceCss.includes('.vna-intel-admin-page'), 'vna-intelligence.css precisa estilizar o Auditor.');
}

async function validateStudio() {
  const studioCore = await readJson('content/studio-core.json');
  const studioCss = await readText('assets/vna-studio.css');
  const docs = await readText('docs/vna-studio.md') + '\n' + await readText('docs/studio-migration-plan.md');
  const routePaths = ['studio/index.html', 'studio/paginas/index.html', 'studio/editor/index.html', 'studio/conteudos/index.html', 'studio/produtos/index.html', 'studio/midia/index.html', 'studio/usuarios/index.html', 'studio/historico/index.html', 'studio/auditor/index.html', 'studio/config/index.html'];
  const pages = await Promise.all(routePaths.map((path) => readText(path)));

  check(studioCore.name === 'VnA Studio', 'studio-core.json precisa nomear o VnA Studio.');
  check(studioCore.officialRoute === '/studio/', 'studio-core.json precisa registrar /studio/ como rota oficial.');
  check(Array.isArray(studioCore.routes) && studioCore.routes.length === 10, 'studio-core.json precisa registrar as 10 rotas planejadas.');
  check(studioCore.routes.some((route) => route.path === '/studio/auditor/'), 'studio-core.json precisa registrar /studio/auditor/.');
  check(studioCore.futureArchitecture?.hosting?.includes('Cloudflare Pages'), 'studio-core.json precisa documentar Cloudflare Pages.');
  check(studioCore.futureArchitecture?.api?.includes('Cloudflare Workers'), 'studio-core.json precisa documentar Workers.');
  check(studioCore.futureArchitecture?.database?.includes('Cloudflare D1'), 'studio-core.json precisa documentar D1.');
  check(studioCore.futureArchitecture?.storage?.includes('Cloudflare R2'), 'studio-core.json precisa documentar R2.');
  check(studioCore.plannedUsers?.some((user) => user.name === 'Matheus' && user.role === 'Proprietário'), 'studio-core.json precisa planejar Matheus como Proprietário.');
  check(studioCore.plannedUsers?.some((user) => user.name === 'Everaldo'), 'studio-core.json precisa planejar Everaldo.');
  check(studioCore.plannedUsers?.some((user) => user.name === 'Eliana'), 'studio-core.json precisa planejar Eliana.');
  check(studioCore.nonGoals?.includes('senha no JavaScript'), 'studio-core.json precisa registrar que senha no JavaScript não faz parte do escopo.');

  check(studioCss.includes('.studio-shell'), 'vna-studio.css precisa estilizar o shell do Studio.');
  check(studioCss.includes('.studio-warning'), 'vna-studio.css precisa estilizar avisos legados.');
  check(docs.includes('O VnA Studio é a evolução do Admin existente'), 'docs/vna-studio.md precisa explicar a evolução do Admin.');
  check(docs.includes('/admin/legacy.html'), 'Plano de migração precisa documentar o editor técnico legado.');

  for (const [index, page] of pages.entries()) {
    check(hasNoIndexNoFollow(page), `${routePaths[index]} precisa ser noindex,nofollow.`);
    check(page.includes('VnA Studio') || page.includes('Auditor VnA'), `${routePaths[index]} precisa identificar o Studio.`);
  }

  const auditorPage = pages[8];
  check(auditorPage.includes('data-vna-intelligence="auditor"'), 'studio/auditor/ precisa carregar o Auditor pelo Intelligence Core.');
  check(auditorPage.includes('<base href="../../"'), 'studio/auditor/ precisa usar base compatível com GitHub Pages.');
}

function documentBasePath(filePath, text) {
  const baseHref = collectMatches(text, /<base\s+href="([^"]+)"\s*\/>/i)[0];
  if (!baseHref) return dirname(filePath).replace(/\\/g, '/');
  return localPathFromRef(`${dirname(filePath)}/${baseHref}`);
}

function refsFor(filePath, text) {
  const base = documentBasePath(filePath, text);
  return collectMatches(text, /(?:href|src)="(?!https?:|mailto:|#)([^"]+)"/g).map((ref) => `${base}/${ref}`);
}

async function validateHtmlAndAssets() {
  const filePaths = [
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
  const entries = await Promise.all(filePaths.map(async (path) => [path, await readText(path)]));
  const files = Object.fromEntries(entries);
  const html = files['index.html'];
  const admin = files['admin/index.html'];
  const adminAssistant = files['admin/assistente.html'];
  const adminAuditor = files['admin/auditor.html'];
  const adminLegacy = files['admin/legacy.html'];
  const robots = await readText('robots.txt');
  const sitemap = await readText('sitemap.xml');
  const readme = await readText('README.md');
  const docs = [await readText('docs/agentes-vna.md'), await readText('docs/vna-intelligence-core.md'), await readText('docs/public-assistant.md'), await readText('docs/admin-auditor.md'), await readText('docs/vna-studio.md'), await readText('docs/studio-migration-plan.md')].join('\n');
  const css = [await readText('assets/styles.css'), await readText('assets/about-section.css'), await readText('assets/vna-intelligence.css'), await readText('assets/vna-studio.css')].join('\n');
  const jsonText = [await readText('content/site-content.json'), await readText('content/vna-core.json'), await readText('content/content-catalog.json'), await readText('content/product-catalog.json'), await readText('content/public-assistant.json'), await readText('content/admin-auditor.json'), await readText('content/studio-core.json')].join('\n');

  check(html.includes('<html lang="pt-BR">'), 'index.html precisa declarar lang="pt-BR".');
  check(html.includes('<main id="conteudo">'), 'index.html precisa ter main com id="conteudo".');
  check(html.includes('data-vna-intelligence="public"'), 'index.html precisa carregar o Assistente VnA pelo Intelligence Core.');
  check(html.includes('public/images/matheus-sobre-vna.png'), 'index.html precisa usar a imagem do Matheus no projeto.');

  check(admin.includes('O Admin agora é VnA Studio'), 'admin/index.html precisa avisar que o Admin virou VnA Studio.');
  check(admin.includes('../studio/'), 'admin/index.html precisa apontar para /studio/.');
  check(hasNoIndexNoFollow(admin), 'admin/index.html precisa ser noindex,nofollow.');
  check(adminAuditor.includes('../studio/auditor/'), 'admin/auditor.html precisa apontar para /studio/auditor/.');
  check(hasNoIndexNoFollow(adminAuditor), 'admin/auditor.html precisa ser noindex,nofollow.');
  check(adminAssistant.includes('Assistente Admin legado'), 'admin/assistente.html precisa marcar o assistente como legado.');
  check(hasNoIndexNoFollow(adminAssistant), 'admin/assistente.html precisa ser noindex,nofollow.');
  check(adminLegacy.includes('Editor técnico legado'), 'admin/legacy.html precisa preservar o editor técnico legado.');
  check(adminLegacy.includes('decap-cms'), 'admin/legacy.html precisa manter o Decap CMS temporariamente.');
  check(hasNoIndexNoFollow(adminLegacy), 'admin/legacy.html precisa ser noindex,nofollow.');

  check(robots.includes('Disallow: /admin/'), 'robots.txt precisa bloquear /admin/.');
  check(robots.includes('Disallow: /studio/'), 'robots.txt precisa bloquear /studio/.');
  check(sitemap.includes('<urlset'), 'sitemap.xml precisa ter urlset.');
  check(readme.includes('VnA Studio'), 'README.md precisa documentar o VnA Studio.');
  check(readme.includes('/studio/auditor/'), 'README.md precisa documentar a nova rota do Auditor.');
  check(docs.includes('VnA Studio'), 'docs precisam documentar o VnA Studio.');

  const ids = collectMatches(html, /\sid="([^"]+)"/g);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  check(duplicateIds.length === 0, `IDs duplicados no HTML: ${unique(duplicateIds).join(', ')}`);

  const anchors = collectMatches(html, /href="#([^"]+)"/g);
  const missingAnchors = unique(anchors).filter((anchor) => !ids.includes(anchor));
  check(missingAnchors.length === 0, `Ancora sem destino no HTML: ${missingAnchors.join(', ')}`);

  const refs = [
    ...entries.flatMap(([path, text]) => refsFor(path, text)),
    ...collectMatches(css, /url\("?\.\.\/([^"\)]+)"?\)/g),
  ];
  const missingRefs = [];

  for (const ref of unique(refs)) {
    const cleanRef = localPathFromRef(ref);
    if (!cleanRef || isExternal(cleanRef)) continue;
    if (!(await exists(cleanRef))) missingRefs.push(ref);
  }
  check(missingRefs.length === 0, `Arquivos referenciados nao encontrados: ${missingRefs.join(', ')}`);

  const publicText = [html, css, robots, sitemap, readme, docs, jsonText, ...Object.values(files)].join('\n');
  check(!/wa\.me|vidanoaltar\.store@gmail\.com|whatsapp/i.test(publicText), 'Nao deve haver canal provisório ou mensageiro externo proibido no site/repo publico.');
  check(!hasLocalAbsolutePath(publicText), 'Nao deve haver caminho local absoluto em arquivos publicados.');
  check(!includesAny(publicText, ['OpenAI', 'ChatGPT', 'Gemini', 'Claude']), 'Interface e documentação nao devem mencionar fornecedores de IA.');
}

async function validateAdminConfig() {
  const config = await readText('admin/config.yml');
  check(!config.includes('\t'), 'admin/config.yml nao deve usar tabs.');
  check(config.includes('repo: Vida-no-Altar/vidanoaltaroficial'), 'admin/config.yml precisa apontar para o repositorio oficial.');
  check(config.includes('file: "content/site-content.json"'), 'admin/config.yml precisa editar content/site-content.json.');
  check(config.includes('media_folder: "public/uploads"'), 'admin/config.yml precisa salvar midias em public/uploads.');
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
    check(ready, `Servidor local nao iniciou corretamente. Saida: ${serverOutput.trim()}`);
    if (!ready) return;

    const routes = [
      ['/', 'VIDA NO ALTAR'],
      ['/studio/', 'VnA Studio'],
      ['/studio/paginas/', 'Páginas'],
      ['/studio/editor/', 'Editor visual'],
      ['/studio/conteudos/', 'Conteúdos'],
      ['/studio/produtos/', 'Produtos'],
      ['/studio/midia/', 'Mídia'],
      ['/studio/usuarios/', 'Usuários'],
      ['/studio/historico/', 'Histórico'],
      ['/studio/auditor/', 'Auditor VnA'],
      ['/studio/config/', 'Configurações'],
      ['/admin/', 'O Admin agora é VnA Studio'],
      ['/admin/auditor.html', 'Auditor agora está no VnA Studio'],
      ['/admin/assistente.html', 'Assistente Admin legado'],
      ['/admin/legacy.html', 'Editor técnico legado'],
      ['/assets/vna-intelligence.js', 'startBibleFlow'],
      ['/assets/vna-intelligence.css', '.vna-intel-fab'],
      ['/assets/vna-studio.css', '.studio-shell'],
      ['/content/vna-core.json', 'VnA Intelligence Core'],
      ['/content/studio-core.json', 'VnA Studio'],
      ['/content/content-catalog.json', 'Lei da Semeadura'],
      ['/content/product-catalog.json', 'Bíblia para começar'],
      ['/content/public-assistant.json', 'Assistente VnA'],
      ['/content/admin-auditor.json', 'Auditor Admin VnA'],
      ['/content/affiliate-disclosure.json', 'Alguns links podem ser de afiliado'],
      ['/content/site-content.json', 'Presença que transforma gerações'],
      ['/robots.txt', 'Disallow: /studio/'],
      ['/sitemap.xml', '<urlset'],
    ];

    for (const [route, expectedText] of routes) {
      const response = await fetch(`${baseUrl}${route}`);
      const body = await response.text();
      check(response.ok, `Rota ${route} retornou status ${response.status}.`);
      check(body.includes(expectedText), `Rota ${route} nao contem o texto esperado.`);
    }
  } finally {
    server.kill('SIGTERM');
  }
}

async function main() {
  await validateSiteContent();
  await validateIntelligenceCore();
  await validateStudio();
  await validateHtmlAndAssets();
  await validateAdminConfig();
  await validateServerRoutes();

  if (failures.length > 0) {
    console.error('Validacao encontrou problemas:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Validacao do Vida no Altar concluida com sucesso.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
