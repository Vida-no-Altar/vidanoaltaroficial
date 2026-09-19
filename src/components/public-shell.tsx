import { Link } from "@tanstack/react-router";
import { Mail, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { VnaAssistant } from "@/components/vna-assistant";
import { VnaBrand } from "@/components/vna-brand";
import { officialEmail } from "@/lib/vna-content";

function PublicNav({ mobile = false, close }: { mobile?: boolean; close?: () => void }) {
  const className = mobile ? "block border-b border-border/60 py-3 text-sm" : "nav-link";
  if (mobile) {
    return <>
      <Link to="/" onClick={close} className={className}>Início</Link>
      <Link to="/comecar" onClick={close} className={className}>Começar</Link>
      <Link to="/projetos" onClick={close} className={className}>Projetos</Link>
      <Link to="/sobre" onClick={close} className={className}>Sobre</Link>
      <Link to="/canais" onClick={close} className={className}>Canais</Link>
      <Link to="/contato" onClick={close} className={className}>Contato</Link>
    </>;
  }
  return <>
    <Link to="/" className={className} activeProps={{ className: "nav-link nav-link-active" }}>Início</Link>
    <Link to="/comecar" className={className} activeProps={{ className: "nav-link nav-link-active" }}>Começar</Link>
    <Link to="/projetos" className={className} activeProps={{ className: "nav-link nav-link-active" }}>Projetos</Link>
    <Link to="/sobre" className={className} activeProps={{ className: "nav-link nav-link-active" }}>Sobre</Link>
    <Link to="/canais" className={className} activeProps={{ className: "nav-link nav-link-active" }}>Canais</Link>
    <Link to="/contato" className={className} activeProps={{ className: "nav-link nav-link-active" }}>Contato</Link>
  </>;
}

export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-md">
        <div className="site-container flex h-20 items-center justify-between">
          <Link to="/" aria-label="Vida no Altar — início"><VnaBrand /></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
            <PublicNav />
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Abrir menu">{open ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {open && <nav className="border-t border-border px-5 py-4 lg:hidden"><PublicNav mobile close={() => setOpen(false)} /></nav>}
      </header>
      <main>{children}</main>
      <footer className="border-t border-border bg-foreground text-background">
        <div className="site-container grid gap-10 py-14 md:grid-cols-[1fr_auto] md:items-end">
          <div><VnaBrand inverse /><p className="mt-6 max-w-md text-sm leading-6 opacity-70">Conteúdo cristão simples, profundo e real para uma geração com Deus no centro.</p></div>
          <div className="text-sm md:text-right"><a className="inline-flex items-center gap-2 hover:text-primary" href={`mailto:${officialEmail}`}><Mail className="size-4" />{officialEmail}</a><p className="mt-3 text-xs opacity-50">© 2026 Vida no Altar</p></div>
        </div>
      </footer>
      <VnaAssistant />
    </div>
  );
}