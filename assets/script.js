const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const sectionToNav = {
  inicio: "#inicio",
  comece: "#inicio",
  projetos: "#projetos",
  sobre: "#sobre",
  links: "#links",
  contato: "#contato",
};

function setMenu(open) {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
}

if ("IntersectionObserver" in window && sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const currentHref = sectionToNav[visible.target.id] || "#" + visible.target.id;

      navLinks.forEach((link) => {
        if (link.getAttribute("href") === currentHref) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-30% 0px -55% 0px",
      threshold: [0.15, 0.35, 0.6],
    },
  );

  sections.forEach((section) => observer.observe(section));
}

const iconPaths = {
  devotional: '<path d="M7 5h10v14H7z"/><path d="M9.5 7.8h5M9.5 11h5M9.5 14.2h3.5"/>',
  gospels: '<path d="M4 7.5c2.4-1.4 5.1-1.4 8 0 2.9-1.4 5.6-1.4 8 0v10.2c-2.4-1.2-5.1-1.2-8 .2-2.9-1.4-5.6-1.4-8-.2z"/><path d="M12 7.5v10.4"/>',
  library: '<path d="M6 4h9.5A2.5 2.5 0 0 1 18 6.5V20H8.5A2.5 2.5 0 0 1 6 17.5z"/><path d="M9 8h5M9 11h6M9 14h4"/>',
  links: '<path d="M9.5 14.5l5-5"/><path d="M10.5 7.5 12 6a4 4 0 0 1 5.7 5.7l-1.2 1.2"/><path d="M13.5 16.5 12 18a4 4 0 0 1-5.7-5.7l1.2-1.2"/>',
  default: '<path d="M12 5v14M5 12h14"/>',
};

function asText(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && typeof value === "object" && typeof value.line === "string") return value.line;
  return "";
}

function setTextByKey(key, value) {
  if (typeof value !== "string") return;
  document.querySelectorAll(`[data-content="${key}"]`).forEach((node) => {
    node.textContent = value;
  });
}

function setMeta(selector, value) {
  if (typeof value !== "string") return;
  const node = document.querySelector(selector);
  if (node) node.setAttribute("content", value);
}

function updateDocumentMeta(meta = {}) {
  if (typeof meta.title === "string") document.title = meta.title;
  setMeta('meta[name="description"]', meta.description);
  setMeta('meta[name="keywords"]', meta.keywords);
  setMeta('meta[property="og:title"]', meta.title);
  setMeta('meta[property="og:description"]', meta.description);
  setMeta('meta[property="og:image"]', meta.image);
  setMeta('meta[property="og:url"]', meta.url);
  setMeta('meta[name="twitter:title"]', meta.title);
  setMeta('meta[name="twitter:description"]', meta.description);
  setMeta('meta[name="twitter:image"]', meta.image);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && typeof meta.url === "string") canonical.setAttribute("href", meta.url);
}

let activeHeroImage = "";

function normalizeHeroImagePath(image) {
  const value = asText(image).trim();
  if (!value) return "";

  const safeValue = value.replace(/["\\\n\r]/g, "");
  const withoutOrigin = safeValue.replace(/^https?:\/\/[^/]+\//i, "");
  const normalized = withoutOrigin.replace(/^\/+/, "");

  if (
    normalized === "hero-devocional.webp" ||
    normalized === "images/hero-devocional.webp" ||
    normalized === "public/hero-devocional.webp" ||
    normalized.endsWith("/hero-devocional.webp")
  ) {
    return "public/images/hero-devocional.webp";
  }

  return safeValue;
}

function setHeroImage(image) {
  const value = asText(image);
  if (!value) return;

  const safeValue = normalizeHeroImagePath(value);
  if (!safeValue || safeValue === activeHeroImage) return;

  activeHeroImage = safeValue;
  document.documentElement.style.setProperty("--hero-image", `url("${safeValue}")`);
}

function normalizeEmail(value) {
  const raw = asText(value).trim();
  if (!raw) return { label: "", href: "" };

  const label = raw.replace(/^mailto:/i, "");
  return {
    label,
    href: raw.toLowerCase().startsWith("mailto:") ? raw : `mailto:${raw}`,
  };
}

function isExternalHref(href) {
  return /^https?:\/\//i.test(href);
}

function configureLink(anchor, href) {
  const value = asText(href) || "#";
  anchor.setAttribute("href", value);

  if (isExternalHref(value)) {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  } else {
    anchor.removeAttribute("target");
    anchor.removeAttribute("rel");
  }
}

function updateLinks(links = {}, contact = {}) {
  const email = normalizeEmail(links.email || contact.emailLabel);
  const linkMap = {
    youtube: links.youtube,
    instagram: links.instagram,
    tiktok: links.tiktok,
    email: email.href,
  };

  Object.entries(linkMap).forEach(([key, href]) => {
    if (!href) return;
    document.querySelectorAll(`[data-link="${key}"]`).forEach((anchor) => configureLink(anchor, href));
  });

  if (email.label) setTextByKey("contact.email", contact.emailLabel || email.label);
}

function makeElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

function makeIcon(icon) {
  const box = makeElement("div", "icon-box");
  box.setAttribute("aria-hidden", "true");
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.innerHTML = iconPaths[icon] || iconPaths.default;
  box.append(svg);
  return box;
}

function makeAction(href, label, className) {
  const anchor = makeElement("a", className, label || "Acessar");
  configureLink(anchor, href);
  return anchor;
}

function replaceList(selector, items, renderer) {
  const container = document.querySelector(selector);
  if (!container || !Array.isArray(items) || items.length === 0) return;
  container.replaceChildren(...items.map(renderer));
}

function renderStartCards(cards) {
  replaceList('[data-render="startCards"]', cards, (item) => {
    const article = makeElement("article", "path-card");
    article.append(
      makeIcon(item.icon),
      makeElement("h3", "", asText(item.title)),
      makeElement("p", "", asText(item.description)),
      makeAction(item.href, item.cta, "text-link"),
    );
    return article;
  });
}

function renderProjects(projects) {
  replaceList('[data-render="projects"]', projects, (item) => {
    const className = item.featured ? "project-card project-card-featured" : "project-card";
    const article = makeElement("article", className);
    article.append(
      makeElement("p", "project-type", asText(item.type)),
      makeElement("h3", "", asText(item.title)),
      makeElement("p", "", asText(item.description)),
    );
    return article;
  });
}

function renderFeaturedContent(items) {
  replaceList('[data-render="featuredContent"]', items, (item) => {
    const article = makeElement("article", "content-card");
    article.append(
      makeElement("p", "content-category", asText(item.category)),
      makeElement("h3", "", asText(item.title)),
      makeElement("p", "", asText(item.description)),
      makeAction(item.href, item.cta, "button button-small"),
    );
    return article;
  });
}

function renderResources(items) {
  replaceList('[data-render="resources"]', items, (item) => {
    const article = makeElement("article", "resource-card");
    const meta = makeElement("div", "resource-meta");
    meta.append(makeElement("p", "resource-type", asText(item.type)));
    if (item.status) meta.append(makeElement("span", "resource-status", asText(item.status)));

    article.append(
      meta,
      makeElement("h3", "", asText(item.title)),
      makeElement("p", "", asText(item.description)),
      makeAction(item.href, item.cta, "button button-small"),
    );
    return article;
  });
}

function renderPresence(lines) {
  const node = document.querySelector('[data-content="about.presenceLines"]');
  if (!node || !Array.isArray(lines) || lines.length === 0) return;
  node.replaceChildren();
  lines.forEach((line, index) => {
    if (index > 0) node.append(document.createElement("br"));
    node.append(document.createTextNode(asText(line)));
  });
}

function renderAboutClosing(closing) {
  const node = document.querySelector(".about-closing");
  const text = asText(closing);
  if (!node || !text) return;
  node.textContent = text;
}

function applyEditableContent(data) {
  if (!data || typeof data !== "object") return;

  updateDocumentMeta(data.meta);
  updateLinks(data.links, data.contact);
  setHeroImage(data.hero?.image);

  setTextByKey("brand.name", data.brand?.name);
  setTextByKey("brand.slogan", data.brand?.slogan);
  setTextByKey("brand.footerPhrase", data.brand?.footerPhrase);

  setTextByKey("hero.eyebrow", data.hero?.eyebrow);
  setTextByKey("hero.title", data.hero?.title);
  setTextByKey("hero.subtitle", data.hero?.subtitle);
  setTextByKey("hero.text", data.hero?.text);

  setTextByKey("startHere.eyebrow", data.startHere?.eyebrow);
  setTextByKey("startHere.title", data.startHere?.title);
  setTextByKey("startHere.description", data.startHere?.description);
  renderStartCards(data.startHere?.cards);

  setTextByKey("projects.eyebrow", data.projects?.eyebrow);
  setTextByKey("projects.title", data.projects?.title);
  setTextByKey("projects.description", data.projects?.description);
  renderProjects(data.projects?.items);

  setTextByKey("about.eyebrow", data.about?.eyebrow);
  setTextByKey("about.title", data.about?.title);
  setTextByKey("about.intro", data.about?.intro);
  setTextByKey("about.text", data.about?.text);
  renderPresence(data.about?.presenceLines);
  renderAboutClosing(data.about?.closing);

  setTextByKey("featuredContent.eyebrow", data.featuredContent?.eyebrow);
  setTextByKey("featuredContent.title", data.featuredContent?.title);
  renderFeaturedContent(data.featuredContent?.items);

  setTextByKey("resourceHub.eyebrow", data.resourceHub?.eyebrow);
  setTextByKey("resourceHub.title", data.resourceHub?.title);
  setTextByKey("resourceHub.description", data.resourceHub?.description);
  renderResources(data.resourceHub?.items);

  setTextByKey("contact.eyebrow", data.contact?.eyebrow);
  setTextByKey("contact.title", data.contact?.title);
  setTextByKey("contact.text", data.contact?.text);
}

async function loadEditableContent() {
  if (window.location.protocol === "file:") return;

  try {
    const response = await fetch("content/site-content.json", {
      cache: "no-cache",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return;
    const data = await response.json();
    applyEditableContent(data);
  } catch {
    // The static HTML remains the source of truth if content loading is unavailable.
  }
}

loadEditableContent();
