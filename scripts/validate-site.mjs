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
  return /<meta\s+name="robots"\s+content="noindex,\s*nofollow"\s*\/>/i.test(text);
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
  'assets/styles.css',
  'assets/about-section.css',
  'assets/vna-intelligence.css',
  'assets/vna-intelligence.js',
  'assets/vna-studio.css',
  'content/site-content.json',
  'content/vna-core.json',
  'content/studio-core.json',
  'content/content-catalog.json',
  'content/product-catalog.json',
  'content/public-assistant.json',
  'content/admin-auditor.json',
  'content/affiliate-disclosure.json',
  'admin/config.yml',
  'docs/vna-studio.md',
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
  check(Array.isArray(core.projects) && core.projects.length >= 6, 'Projetos institucionais insuficientes.');

  check(studio.name === 'VnA Studio', 'studio-core.json precisa nomear o VnA Studio.');
  check(studio.officialRoute === '/studio/', 'A rota oficial do Studio precisa ser /studio/.');
  check(Array.isArray(studio.routes) && studio.routes.length === 10, 'Studio precisa registrar as 10 rotas planejadas.');
  check(studio.routes.some((route) => route.path === '/studio/auditor/'), 'Studio precisa registrar /studio/auditor/.');
  check(studio.futureArchitecture?.hosting?.includes('Cloudflare Pages'), 'Arquitetura futura precisa documentar Cloudflare Pages.');
  check(studio.futureArchitecture?.api?.includes('Cloudflare Workers'), 'Arquitetura futura precisa documentar Workers.');
  check(studio.futureArchitecture?.database?.includes('Cloudflare D1'), 'Arquitetura futura precisa documentar D1.');
  check(studio.futureArchitecture?.storage?.includes('Cloudflare R2'), 'Arquitetura futura precisa documentar R2.');
  check(studio.plannedUsers?.some((user) => user.name === 'Matheus' && user.role === 'Proprietário'), 'Matheus precisa estar planejado como Proprietário.');
  check(studio.plannedUsers?.some((user) => user.name === 'Everaldo'), 'Everaldo precisa estar planejado.');
  check(studio.plannedUsers?.some((user) => user.name === 'Eliana'), 'Eliana precisa estar planejada.');
  check(studio.nonGoals?.includes('senha no JavaScript'), 'Studio precisa registrar que senha no JavaScript está fora do escopo.');

  check(Array.isArray(contentCatalog.items) && contentCatalog.items.length >= 6, 'Catálogo de conteúdos insuficiente.');
  check(Array.isArray(productCatalog.products), 'Catálogo de produtos precisa ter lista products.');
  check(productCatalog.guidedBibleDiagnosis?.questions?.some((item) => item.key === 'churchTranslation'), 'Diagnóstico precisa perguntar tradução usada na igreja.');
  check(publicAssistant.name === 'Assistente VnA', 'Assistente Público incorreto.');
  check(publicAssistant.modes?.length === 4, 'Assistente Público precisa ter quatro modos.');
  check(auditor.name === 'Auditor Admin VnA', 'Auditor precisa manter compatibilidade com o nome legado.');
  check(auditor.fallback?.includes('studio/'), 'Auditor precisa orientar a estrutura studio/.');
  check(affiliate.text?.includes('Alguns links podem ser de afiliado'), 'Aviso de afiliado ausente.');
}

async function validateHtml() {
  const entries = await Promise.all(htmlFiles.map(async (path) => [path, await readText(path)]));
  const files = Object.fromEntries(entries);

  check(files['index.html'].includes('<html lang="pt-BR">'), 'index.html precisa declarar pt-BR.');
  check(files['index.html'].includes('data-vna-intelligence="public"'), 'Site público precisa preservar o Assistente Público.');
  check(files['index.html'].includes('public/images/matheus-sobre-vna.png'), 'Site público precisa preservar a imagem do Sobre.');

  check(files['admin/index.html'].includes('O Admin agora é VnA Studio'), '/admin/ precisa avisar migração.');
  check(files['admin/index.html'].includes('../studio/'), '/admin/ precisa apontar para /studio/.');
  check(files['admin/auditor.html'].includes('../studio/auditor/'), '/admin/auditor.html precisa apontar para /studio/auditor/.');
  check(files['admin/assistente.html'].includes('Assistente Admin legado'), '/admin/assistente.html precisa ser legado.');
  check(files['admin/legacy.html'].includes('Editor técnico legado'), '/admin/legacy.html precisa preservar editor legado.');
  check(files['admin/legacy.html'].includes('decap-cms'), '/admin/legacy.html precisa manter Decap CMS temporariamente.');

  for (const path of htmlFiles.filter((item) => item.startsWith('admin/') || item.startsWith('studio/'))) {
    check(hasNoIndexNoFollow(files[path]), `${path} precisa ser noindex,nofollow.`);
  }

  check(files['studio/index.html'].includes('VnA Studio'), '/studio/ precisa abrir dashboard.');
  check(files['studio/auditor/index.html'].includes('data-vna-intelligence="auditor"'), '/studio/auditor/ precisa carregar o Auditor.');
  check(files['studio/auditor/index.html'].includes('<base href="../../"'), '/studio/auditor/ precisa ter base compatível com GitHub Pages.');

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

  check(robots.includes('Disallow: /admin/'), 'robots.txt precisa bloquear /admin/.');
  check(robots.includes('Disallow: /studio/'), 'robots.txt precisa bloquear /studio/.');
  check(readme.includes('VnA Studio'), 'README precisa documentar VnA Studio.');
  check(readme.includes('/studio/auditor/'), 'README precisa documentar /studio/auditor/.');
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
