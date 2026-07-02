import { access, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, extname, join, resolve } from 'node:path';
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

async function validateJson() {
  const raw = await readText('content/site-content.json');
  const data = JSON.parse(raw);

  check(data.meta?.title, 'content/site-content.json precisa de meta.title.');
  check(data.meta?.description, 'content/site-content.json precisa de meta.description.');
  check(data.links?.youtube?.startsWith('https://www.youtube.com/'), 'Link do YouTube esta ausente ou invalido.');
  check(data.links?.instagram?.startsWith('https://www.instagram.com/'), 'Link do Instagram esta ausente ou invalido.');
  check(data.links?.tiktok?.startsWith('https://www.tiktok.com/'), 'Link do TikTok esta ausente ou invalido.');
  check(data.links?.email === 'contato@vidanoaltaroficial.com.br', 'E-mail oficial precisa ser contato@vidanoaltaroficial.com.br.');
  check(Array.isArray(data.projects?.items) && data.projects.items.length >= 6, 'Projetos precisam ter pelo menos 6 itens.');
  check(Array.isArray(data.resourceHub?.items) && data.resourceHub.items.length >= 1, 'resourceHub.items precisa ter pelo menos um link.');

  if (data.hero?.image) {
    check(await exists(localPathFromRef(data.hero.image)), `Imagem do hero nao encontrada: ${data.hero.image}`);
  }
}

async function validateHtmlAndAssets() {
  const html = await readText('index.html');
  const css = await readText('assets/styles.css');
  const admin = await readText('admin/index.html');
  const robots = await readText('robots.txt');
  const sitemap = await readText('sitemap.xml');
  const readme = await readText('README.md');

  check(html.includes('<html lang="pt-BR">'), 'index.html precisa declarar lang="pt-BR".');
  check(html.includes('<main id="conteudo">'), 'index.html precisa ter main com id="conteudo".');
  check(admin.includes('meta name="robots" content="noindex, nofollow"'), 'admin/index.html precisa ser noindex,nofollow.');
  check(robots.includes('Disallow: /admin/'), 'robots.txt precisa bloquear /admin/.');
  check(sitemap.includes('<urlset'), 'sitemap.xml precisa ter urlset.');

  const ids = collectMatches(html, /\sid="([^"]+)"/g);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  check(duplicateIds.length === 0, `IDs duplicados no HTML: ${unique(duplicateIds).join(', ')}`);

  const anchors = collectMatches(html, /href="#([^"]+)"/g);
  const missingAnchors = unique(anchors).filter((anchor) => !ids.includes(anchor));
  check(missingAnchors.length === 0, `Ancora sem destino no HTML: ${missingAnchors.join(', ')}`);

  const refs = [
    ...collectMatches(html, /(?:href|src)="(?!https?:|mailto:|#)([^"]+)"/g),
    ...collectMatches(css, /url\("?\.\.\/([^"\)]+)"?\)/g),
  ];
  const missingRefs = [];

  for (const ref of unique(refs)) {
    const cleanRef = localPathFromRef(ref);
    if (!cleanRef || isExternal(cleanRef)) continue;
    if (!(await exists(cleanRef))) missingRefs.push(ref);
  }

  check(missingRefs.length === 0, `Arquivos referenciados nao encontrados: ${missingRefs.join(', ')}`);

  const publicText = [html, css, admin, robots, sitemap, readme].join('\n');
  check(!/wa\.me|vidanoaltar\.store@gmail\.com|whatsapp/i.test(publicText), 'Nao deve haver WhatsApp, wa.me ou e-mail provisório no site/repo publico.');
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
  await validateJson();
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
