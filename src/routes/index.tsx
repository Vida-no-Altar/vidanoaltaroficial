import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Flame, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/public-shell";
import { createHead, projects, siteMeta } from "@/lib/vna-content";
import heroImage from "@/assets/vna-bible-hero.jpg";
import studyImage from "@/assets/vna-study.jpg";
import worshipImage from "@/assets/vna-worship.jpg";

export const Route = createFileRoute("/")({ head: () => createHead(siteMeta.home), component: HomePage });

const startingProjects = [
  { ...projects[0], Icon: Flame },
  { ...projects[1], Icon: BookOpen },
];

function HomePage() {
  return <PublicShell>
    <section className="relative flex min-h-[calc(100svh-5rem)] items-end overflow-hidden bg-foreground text-background">
      <img src={heroImage} alt="Bíblia aberta iluminada pela luz da manhã" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
      <div className="site-container relative z-10 pb-14 pt-24 sm:pb-20 lg:pb-24">
        <div className="max-w-2xl reveal"><p className="eyebrow">Central oficial do Vida no Altar</p><h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-7xl">Presença que transforma gerações.</h1><p className="mt-6 max-w-xl text-base leading-7 text-background/78 sm:text-lg">Conteúdo cristão simples, profundo e real para jovens, adolescentes e toda a igreja.</p><div className="mt-9 flex flex-wrap gap-3"><Button asChild variant="gold" size="editorial"><Link to="/comecar">Comece por aqui <ArrowRight /></Link></Button><Button asChild variant="editorial" size="editorial"><Link to="/projetos">Conheça os projetos</Link></Button></div></div>
      </div>
    </section>
    <section className="py-24 sm:py-32"><div className="site-container"><div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow">Primeiros passos</p><h2 className="mt-4 font-display text-4xl sm:text-5xl">Comece por aqui</h2><p className="mt-5 max-w-sm text-muted-foreground">Escolha um caminho para conhecer melhor o Vida no Altar.</p></div><div className="divide-y divide-border border-y border-border">{startingProjects.map(({Icon,...p}) => <Link to="/projetos" key={p.title} className="group grid gap-4 py-8 sm:grid-cols-[auto_1fr_auto] sm:items-center"><Icon className="size-6 text-primary" /><div><p className="font-display text-2xl">{p.title}</p><p className="mt-2 text-sm text-muted-foreground">{p.description}</p></div><ArrowRight className="transition-transform group-hover:translate-x-1" /></Link>)}</div></div></div></section>
    <section className="bg-foreground py-24 text-background sm:py-32"><div className="site-container"><p className="eyebrow">Projetos do VnA</p><div className="mt-10 grid gap-px bg-background/20 md:grid-cols-3">{projects.map((p,i) => <article key={p.title} className="group bg-foreground p-7"><div className="aspect-[4/3] overflow-hidden"><img src={i===2?worshipImage:studyImage} alt={i===2?"Músico tocando teclado em momento de adoração":"Jovem estudando a Bíblia"} width={1408} height={1104} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></div><p className="mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-primary">{p.eyebrow}</p><h3 className="mt-3 font-display text-3xl">{p.title}</h3><p className="mt-3 text-sm leading-6 text-background/65">{p.description}</p></article>)}</div></div></section>
    <section className="py-24 text-center sm:py-32"><div className="site-container max-w-4xl"><div className="editorial-rule mx-auto"/><blockquote className="mt-8 font-display text-4xl leading-tight sm:text-6xl">“Não é sobre aparência. É sobre presença.”</blockquote><p className="mx-auto mt-7 max-w-xl text-muted-foreground">O objetivo é simples: apontar pessoas para uma vida com Deus no centro.</p><Button asChild variant="editorial" size="editorial" className="mt-9"><Link to="/sobre">Conheça nossa história</Link></Button></div></section>
  </PublicShell>;
}