import type { ReactNode } from "react";
import { PublicShell } from "@/components/public-shell";

export function EditorialPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <PublicShell><header className="paper-texture border-b border-border py-20 sm:py-28"><div className="site-container"><p className="eyebrow">{eyebrow}</p><h1 className="mt-5 max-w-4xl font-display text-5xl leading-tight sm:text-7xl">{title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{intro}</p></div></header>{children}</PublicShell>;
}