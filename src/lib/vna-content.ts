export const projects = [
  {
    title: "Café no Altar",
    eyebrow: "Devocional · Segunda a sexta",
    description: "Reflexões curtas, bíblicas e práticas para começar o dia com Deus no centro.",
    tone: "warm",
  },
  {
    title: "Conhecendo os Evangelhos",
    eyebrow: "Ensino bíblico",
    description: "Contexto, mensagem e profundidade para compreender melhor os Evangelhos.",
    tone: "study",
  },
  {
    title: "Vida no Altar Covers",
    eyebrow: "Louvor e adoração",
    description: "Louvor, teclado e momentos de adoração com simplicidade e presença.",
    tone: "music",
  },
] as const;

export const officialEmail = "contato.vidanoaltaroficial@gmail.com";

export const socialLinks = {
  youtube: "https://www.youtube.com/@vidanoaltar.oficial",
  instagram: "https://www.instagram.com/vidanoaltar.oficial",
  tiktok: "https://www.tiktok.com/@vidanoaltar.oficial",
};

export const siteMeta = {
  home: {
    title: "Vida no Altar — Presença que transforma gerações",
    description: "Conteúdo cristão simples, profundo e real para jovens, adolescentes e toda a igreja.",
  },
  start: {
    title: "Comece por aqui — Vida no Altar",
    description: "Escolha um caminho para conhecer os conteúdos, estudos bíblicos e canais do Vida no Altar.",
  },
  projects: {
    title: "Projetos — Vida no Altar",
    description: "Conheça o Café no Altar, Conhecendo os Evangelhos e Vida no Altar Covers.",
  },
  about: {
    title: "Sobre — Vida no Altar",
    description: "Conheça a missão do Vida no Altar e seu compromisso com uma fé cristã real, bíblica e prática.",
  },
  channels: {
    title: "Canais oficiais — Vida no Altar",
    description: "Encontre os canais e o contato oficial do Vida no Altar.",
  },
  contact: {
    title: "Contato — Vida no Altar",
    description: "Fale com o Vida no Altar sobre convites, sugestões, parcerias e contato geral.",
  },
};

export function createHead(meta: { title: string; description: string }) {
  return {
    meta: [
      { title: meta.title },
      { name: "description", content: meta.description },
      { property: "og:title", content: meta.title },
      { property: "og:description", content: meta.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}