import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function fail(message) {
  failures.push(message);
}

function check(condition, message) {
  if (!condition) fail(message);
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

function unique(values) {
  return [...new Set(values)];
}

function localPathFromRef(ref) {
  return ref.split('#')[0].split('?')[0].replace(/^\.\//, '').replace(/^\//, '');
}

function isExternal(ref) {
  return /^(https?:|mailto:|tel:)/i.test(ref);
}

function collectMatches(text, regex, group = 1) {
  return [...text.matchAll(regex)].map((match) => match[group]);
}

function hasNoIndexNoFollow(text) {
  return /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/>/i.test(text);
}

function includesAny(text, terms) {
  return terms.some((term) => text.toLowerCase().includes(term.toLowerCase()));
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
  check(Array.isArray(data.resourceHub?.items) && data.resourceHub.items.length >= 1, 'resourceHub.items precisa ter pelo menos um link.');
  check(data.about?.image === 'public/images/matheus-sobre-vna.webp', 'Seção Sobre precisa apontar para a imagem WebP do Matheus.');
  check(data.about?.imageAlt === 'Matheus, criador do Vida no Altar, segurando uma Bíblia', 'Alt text da imagem Sobre precisa ser preservado.');

  if (data.hero?.image) {
    check(await exists(localPathFromRef(data.hero.image)), `Imagem do hero nao encontrada: ${data.hero.image}`);
  }
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
  check(core.officialAssets?.aboutImagePng === 'public/images/matheus-sobre-vna.png', 'vna-core.json precisa registrar a imagem PNG do Sobre.');

  check(Array.isArray(contentCatalog.items) && contentCatalog.items.length >= 6, 'content-catalog.json precisa ter exemplos iniciais.');
  for (const item of contentCatalog.items || []) {
    check(item.id && item.title && item.project && item.primaryTheme && item.status, `Conteudo incompleto no catalogo: ${item.id || item.title}`);
  }

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
  check(publicAssistant.initialMessage?.includes('Que bom ter você por aqui'), 'Assistente público precisa ter a nova mensagem inicial.');
  check(publicAssistant.fallback?.includes('Não tenho uma resposta segura'), 'Assistente público precisa ter fallback seguro.');
  check(publicAssistant.modes.some((mode) => (mode.intents || []).some((intent) => intent.startBibleFlow)), 'Assistente público precisa iniciar o fluxo de Bíblia.');

  check(adminAuditor.name === 'Auditor Admin VnA', 'admin-auditor.json precisa usar o nome Auditor Admin VnA.');
  check(Array.isArray(adminAuditor.modes) && adminAuditor.modes.length === 5, 'Auditor Admin precisa ter 5 modos.');
  check(adminAuditor.modes.map((mode) => mode.id).join(',') === 'conteudo,tecnico,seo,seguranca,publicacao', 'Modos do auditor precisam ser Conteúdo, Técnico, SEO, Segurança e Publicação.');
  check(Array.isArray(adminAuditor.riskMatrix) && adminAuditor.riskMatrix.length === 4, 'Auditor Admin precisa ter matriz de risco com 4 níveis.');

  check(knowledge.brand?.name === 'Vida no Altar', 'knowledge-base.json precisa continuar compatível.');
  check(publicLegacy.name === 'Assistente VnA', 'agent-public.json legado precisa continuar válido.');
  check(adminLegacy.name === 'Assistente Admin VnA', 'agent-admin.json legado precisa continuar válido.');

  check(intelligenceScript.includes('scoreIntent'), 'vna-intelligence.js precisa calcular pontuação por intenção.');
  check(intelligenceScript.includes('searchContentCatalog'), 'vna-intelligence.js precisa buscar no catálogo de conteúdos.');
  check(intelligenceScript.includes('startBibleFlow'), 'vna-intelligence.js precisa ter fluxo guiado de Bíblia.');
  check(intelligenceScript.includes('localStorage'), 'vna-intelligence.js precisa documentar histórico local do auditor.');
  check(intelligenceCss.includes('.vna-intel-fab'), 'vna-intelligence.css precisa estilizar o widget público.');
  check(intelligenceCss.includes('.vna-intel-admin-page'), 'vna-intelligence.css precisa estilizar o Auditor Admin.');
}

async function validateHtmlAndAssets() {
  const html = await readText('index.html');
  const css = await readText('assets/styles.css');
  const aboutCss = await readText('assets/about-section.css');
  const intelCss = await readText('assets/vna-intelligence.css');
  const admin = await readText('admin/index.html');
  const adminAssistant = await readText('admin/assistente.html');
  const adminAuditor = await readText('admin/auditor.html');
  const robots = await readText('robots.txt');
  const sitemap = await readText('sitemap.xml');
  const readme = await readText('README.md');
  const docs = [
    await readText('docs/agentes-vna.md'),
    await readText('docs/vna-intelligence-core.md'),
    await readText('docs/public-assistant.md'),
    await readText('docs/admin-auditor.md'),
  ].join('\n');

  check(html.includes('<html lang="pt-BR">'), 'index.html precisa declarar lang="pt-BR".');
  check(html.includes('<main id="conteudo">'), 'index.html precisa ter main com id="conteudo".');
  check(html.includes('assets/vna-intelligence.css'), 'index.html precisa carregar vna-intelligence.css.');
  check(html.includes('data-vna-intelligence="public"'), 'index.html precisa carregar o Assistente VnA pelo Intelligence Core.');
  check(html.includes('public/images/matheus-sobre-vna.png'), 'index.html precisa usar a imagem do Matheus no projeto.');
  check(!html.includes('D:\\'), 'index.html nao pode usar caminho local absoluto.');

  check(admin.includes('auditor.html'), 'admin/index.html precisa ter atalho para o Auditor Admin.');
  check(admin.includes('assistente.html'), 'admin/index.html precisa manter atalho para o Assistente Admin legado.');
  check(hasNoIndexNoFollow(admin), 'admin/index.html precisa ser noindex,nofollow.');
  check(adminAssistant.includes('data-vna-agent="admin"'), 'admin/assistente.html precisa manter o Assistente Admin legado.');
  check(hasNoIndexNoFollow(adminAssistant), 'admin/assistente.html precisa ser noindex,nofollow.');
  check(adminAuditor.includes('data-vna-intelligence="auditor"'), 'admin/auditor.html precisa carregar o Auditor Admin.');
  check(hasNoIndexNoFollow(adminAuditor), 'admin/auditor.html precisa ser noindex,nofollow.');
  check(robots.includes('Disallow: /admin/'), 'robots.txt precisa bloquear /admin/.');
  check(sitemap.includes('<urlset'), 'sitemap.xml precisa ter urlset.');
  check(readme.includes('VnA Intelligence Core'), 'README.md precisa documentar o VnA Intelligence Core.');
  check(docs.includes('VnA Intelligence Core'), 'docs/vna-intelligence-core.md precisa documentar o núcleo.');

  const ids = collectMatches(html, /\sid="([^"]+)"/g);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  check(duplicateIds.length === 0, `IDs duplicados no HTML: ${unique(duplicateIds).join(', ')}`);

  const anchors = collectMatches(html, /href="#([^"]+)"/g);
  const missingAnchors = unique(anchors).filter((anchor) => !ids.includes(anchor));
  check(missingAnchors.length === 0, `Ancora sem destino no HTML: ${missingAnchors.join(', ')}`);

  const refs = [
    ...collectMatches(html, /(?:href|src)="(?!https?:|mailto:|#)([^"]+)"/g),
    ...collectMatches(admin, /(?:href|src)="(?!https?:|mailto:|#)([^"]+)"/g).map((ref) => `admin/${ref}`),
    ...collectMatches(adminAssistant, /(?:href|src)="(?!https?:|mailto:|#)([^"]+)"/g).map((ref) => `admin/${ref}`),
    ...collectMatches(adminAuditor, /(?:href|src)="(?!https?:|mailto:|#)([^"]+)"/g).map((ref) => `admin/${ref}`),
    ...collectMatches(css, /url\("?\.\.\/([^"\)]+)"?\)/g),
    ...collectMatches(aboutCss, /url\("?\.\.\/([^"\)]+)"?\)/g),
    ...collectMatches(intelCss, /url\("?\.\.\/([^"\)]+)"?\)/g),
  ];
  const missingRefs = [];

  for (const ref of unique(refs)) {
    const cleanRef = localPathFromRef(ref).replace(/^admin\/\.\.\//, '');
    if (!cleanRef || isExternal(cleanRef)) continue;
    if (!(await exists(cleanRef))) missingRefs.push(ref);
  }

  check(missingRefs.length === 0, `Arquivos referenciados nao encontrados: ${missingRefs.join(', ')}`);

  const publicText = [html, css, aboutCss, intelCss, admin, adminAssistant, adminAuditor, robots, sitemap, readme, docs].join('\n');
  check(!/wa\.me|vidanoaltar\.store@gmail\.com|whatsapp/i.test(publicText), 'Nao deve haver canal provisório ou mensageiro externo proibido no site/repo publico.');
  check(!/D:\\/i.test(publicText), 'Nao deve haver caminho local absoluto em arquivos publicados.');
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
  const server = spawn(process.execPath, ['serve.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: port },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

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
      ['/admin/', 'Painel Vida no Altar'],
      ['/admin/assistente.html', 'Assistente Admin VnA'],
      ['/admin/auditor.html', 'Auditor Admin VnA'],
      ['/assets/vna-intelligence.js', 'startBibleFlow'],
      ['/assets/vna-intelligence.css', '.vna-intel-fab'],
      ['/content/vna-core.json', 'VnA Intelligence Core'],
      ['/content/content-catalog.json', 'Lei da Semeadura'],
      ['/content/product-catalog.json', 'Bíblia para começar'],
      ['/content/public-assistant.json', 'Assistente VnA'],
      ['/content/admin-auditor.json', 'Auditor Admin VnA'],
      ['/content/affiliate-disclosure.json', 'Alguns links podem ser de afiliado'],
      ['/content/site-content.json', 'Presença que transforma gerações'],
      ['/robots.txt', 'Disallow: /admin/'],
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
