const menuButton = document.querySelector(".menu-toggle");
const menu = document.querySelector("#site-menu");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const sectionToNav = {
  inicio: "#inicio",
  comece: "#inicio",
  projetos: "#projetos",
  sobre: "#sobre",
  conteudos: "#projetos",
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
