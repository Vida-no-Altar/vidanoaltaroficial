import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, Music2, Youtube } from "lucide-react";
import { EditorialPage } from "@/components/editorial-page";
import { createHead, officialEmail, siteMeta, socialLinks } from "@/lib/vna-content";

export const Route = createFileRoute("/canais")({ head: () => createHead(siteMeta.channels), component: ChannelsPage });

function ChannelsPage() {
  const channels = [
    { icon: Youtube, name: "YouTube", handle: "@vidanoaltar.oficial", href: socialLinks.youtube, text: "Séries, estudos e conteúdos em vídeo no canal oficial." },
    { icon: Instagram, name: "Instagram", handle: "@vidanoaltar.oficial", href: socialLinks.instagram, text: "Devocionais, bastidores, avisos e reflexões do projeto." },
    { icon: Music2, name: "TikTok", handle: "@vidanoaltar.oficial", href: socialLinks.tiktok, text: "Vídeos curtos e conteúdos cristãos do dia a dia." },
  ];
  return (
    <EditorialPage eyebrow="Onde acompanhar" title="Canais oficiais" intro="Encontre os principais canais, conteúdos e formas de contato do Vida no Altar em um só lugar.">
      <section className="site-container py-20 sm:py-28">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {channels.map(({ icon: Icon, name, handle, href, text }) => (
            <a key={name} href={href} target="_blank" rel="noreferrer" className="group bg-background p-8 transition-colors hover:bg-card">
              <Icon className="size-7 text-primary" />
              <h2 className="mt-8 font-display text-3xl">{name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{handle}</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{text}</p>
            </a>
          ))}
          <a href={`mailto:${officialEmail}`} className="bg-foreground p-8 text-background">
            <Mail className="size-7 text-primary" />
            <h2 className="mt-8 font-display text-3xl">E-mail</h2>
            <p className="mt-3 break-all text-sm text-background/70">{officialEmail}</p>
            <p className="mt-4 text-sm leading-6 text-background/60">Para convites, sugestões, parcerias ou contato geral.</p>
          </a>
        </div>
      </section>
    </EditorialPage>
  );
}
