import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CloudUpload, FileText, Image, Plus, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StudioShell } from "@/components/studio-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { allowedSections, studioMeta, type StudioSection } from "@/lib/studio-data";
import { createHead, projects } from "@/lib/vna-content";
import { defaultHome, emptyContent, getPage, listActivity, listPages, savePage, statusLabels, type ActivityRow, type PageRow } from "@/lib/studio-pages";

export const Route = createFileRoute("/_authenticated/studio/$section")({
  beforeLoad: ({ params }) => { if (!allowedSections.includes(params.section as StudioSection)) throw notFound(); },
  head: ({ params }) => createHead({ title: `${studioMeta(params.section as StudioSection)[0]} — VnA Studio`, description: studioMeta(params.section as StudioSection)[1] }),
  component: SectionPage,
});

function Empty({ icon: Icon = FileText, title, text }: { icon?: typeof FileText; title: string; text: string }) {
  return <div className="border border-dashed border-border bg-background px-6 py-16 text-center"><Icon className="mx-auto size-7 text-muted-foreground" /><h2 className="mt-4 font-display text-2xl">{title}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{text}</p></div>;
}

function SectionPage() {
  const { section } = Route.useParams();
  const s = section as StudioSection;
  const [title, description] = studioMeta(s);
  return <StudioShell title={title} description={description} actions={(s === "conteudos" || s === "projetos" || s === "produtos") ? <Button variant="studio"><Plus />Novo</Button> : undefined}>
    {s === "paginas" && <Pages />}
    {s === "editor" && <Editor />}
    {s === "conteudos" && <Contents />}
    {s === "midia" && <Media />}
    {s === "projetos" && <Projects />}
    {s === "produtos" && <Empty title="Nenhuma recomendação cadastrada" text="Produtos futuros serão avaliados pelo propósito antes de qualquer comissão." />}
    {s === "historico" && <History />}
    {s === "usuarios" && <Users />}
    {s === "auditor" && <Auditor />}
    {s === "configuracoes" && <Settings />}
  </StudioShell>;
}

function Pages() {
  const [rows, setRows] = useState<PageRow[] | null>(null);
  useEffect(() => { listPages().then(setRows); }, []);
  if (!rows) return <p className="text-sm text-muted-foreground">Carregando seções…</p>;
  if (rows.length === 0) return <Empty title="Nenhuma seção salva ainda" text="Abra o Editor, ajuste o Hero da página inicial e salve. A seção aparecerá aqui com seu status real." />;
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rows.map((p, i) => <article className="border border-border bg-background p-5" key={p.id}>
    <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">0{i + 1}</span><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold uppercase">{statusLabels[p.status]}</span></div>
    <h2 className="mt-12 font-display text-2xl">{p.title}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{p.slug}</p>
    <Button asChild variant="ghost" className="mt-5 px-0"><Link to="/studio/$section" params={{ section: "editor" }}>Editar seção <ArrowRight /></Link></Button>
  </article>)}</div>;
}

function Editor() {
  const [page, setPage] = useState<PageRow | null>(null);
  const [form, setForm] = useState({ title: defaultHome.title, description: defaultHome.description, eyebrow: defaultHome.content.eyebrow, imageAlt: defaultHome.content.imageAlt, ctaLabel: defaultHome.content.ctaLabel });
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    getPage(defaultHome.slug).then(row => {
      if (!row) return;
      setPage(row);
      setForm({ title: row.title, description: row.description, eyebrow: row.content.eyebrow, imageAlt: row.content.imageAlt, ctaLabel: row.content.ctaLabel });
    });
  }, []);

  async function run(action: "draft" | "review" | "publish") {
    setBusy(true);
    const { page: saved, error } = await savePage(page, {
      slug: defaultHome.slug,
      title: form.title,
      description: form.description,
      status: page?.status ?? "draft",
      content: { ...emptyContent, ...defaultHome.content, eyebrow: form.eyebrow, imageAlt: form.imageAlt, ctaLabel: form.ctaLabel },
    }, action);
    setBusy(false);
    setConfirming(false);
    if (error) { setNotice("Não foi possível salvar. Seu perfil precisa ter acesso ao Studio."); return; }
    if (saved) setPage(saved);
    setNotice(action === "publish" ? "Publicado. A versão anterior ficou guardada no Histórico." : action === "review" ? "Enviado para revisão." : "Rascunho salvo.");
  }

  const changed = page ? [
    ["Título", page.title, form.title],
    ["Descrição", page.description, form.description],
    ["Chapéu", page.content.eyebrow, form.eyebrow],
    ["Texto alternativo", page.content.imageAlt, form.imageAlt],
    ["Botão", page.content.ctaLabel, form.ctaLabel],
  ].filter(([, before, after]) => before !== after) : [];

  return <div className="grid gap-5 xl:grid-cols-2">
    <section className="border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border p-5">
        <p className="text-xs font-bold uppercase tracking-[.14em]">Editor · Hero</p>
        <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold uppercase">{page ? statusLabels[page.status] : "Novo"}</span>
      </div>
      <div className="space-y-5 p-5">
        <label className="block text-sm font-bold">Chapéu<Input className="mt-2 h-11" value={form.eyebrow} onChange={e => setForm({ ...form, eyebrow: e.target.value })} /></label>
        <label className="block text-sm font-bold">Título<Input className="mt-2 h-11" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
        <label className="block text-sm font-bold">Descrição<Textarea className="mt-2 min-h-28" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        <label className="block text-sm font-bold">Botão principal<Input className="mt-2" value={form.ctaLabel} onChange={e => setForm({ ...form, ctaLabel: e.target.value })} /></label>
        <label className="block text-sm font-bold">Imagem<div className="mt-2 flex h-24 items-center justify-center border border-dashed border-border bg-muted"><Image className="size-5 text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Trocar imagem</span></div></label>
        <label className="block text-sm font-bold">Texto alternativo<Input className="mt-2" value={form.imageAlt} onChange={e => setForm({ ...form, imageAlt: e.target.value })} /></label>
        {notice && <p className="border-l-2 border-primary pl-3 text-sm">{notice}</p>}
        {confirming && <div className="border border-border bg-muted p-4">
          <p className="text-sm font-bold">Confira antes de publicar</p>
          {changed.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Nenhuma alteração em relação à versão salva.</p> : <div className="mt-3 space-y-3">{changed.map(([label, before, after]) => <div key={label} className="text-sm"><p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</p><p className="mt-1 line-through opacity-60">{before || "—"}</p><p className="mt-1 font-bold">{after || "—"}</p></div>)}</div>}
          <div className="mt-4 flex gap-2"><Button variant="studio" disabled={busy} onClick={() => run("publish")}>Confirmar publicação</Button><Button variant="ghost" onClick={() => setConfirming(false)}>Cancelar</Button></div>
        </div>}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={busy} onClick={() => run("draft")}>Salvar rascunho</Button>
          <Button variant="secondary" disabled={busy} onClick={() => run("review")}>Enviar para revisão</Button>
          <Button variant="studio" disabled={busy} onClick={() => setConfirming(true)}>Publicar</Button>
        </div>
      </div>
    </section>
    <section className="border border-studio-muted bg-studio p-5 text-studio-foreground">
      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Preview</p>
      <div className="mt-8 border border-studio-muted p-8">
        <p className="text-[10px] uppercase tracking-[.14em] text-primary">{form.eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl leading-tight">{form.title}</h2>
        <p className="mt-5 text-sm leading-6 text-studio-foreground/65">{form.description}</p>
        <Button variant="studio" className="mt-7">{form.ctaLabel || "Comece por aqui"}</Button>
      </div>
      <div className="mt-5 border border-studio-muted p-5"><div className="flex gap-3"><ShieldCheck className="size-5 text-primary" /><div><p className="font-bold">Auditor VnA</p><p className="mt-1 text-sm leading-6 text-studio-foreground/60">{changed.length > 0 ? `Você alterou ${changed.length} campo(s) do Hero público. Revise título, imagem, texto alternativo e botão antes de publicar.` : "Essa área muda o Hero público. Revise título, imagem, texto alternativo e botão antes de publicar."}</p></div></div></div>
    </section>
  </div>;
}

function Contents() { return <Empty title="Nenhum conteúdo cadastrado" text="Crie o primeiro conteúdo e acompanhe o fluxo de rascunho, revisão, agendamento e publicação." />; }

function Media() {
  const [msg, setMsg] = useState("");
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) setMsg("O arquivo possui mais de 8 MB. Considere otimizar antes de publicar.");
    const path = `uploads/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("vna-media").upload(path, file);
    setMsg(error ? "Não foi possível enviar. Seu perfil precisa ter acesso ao Studio." : "Arquivo enviado com segurança.");
  }
  return <><div className="mb-5 flex gap-2 overflow-auto">{["Todos", "Imagens", "Logos", "Capas", "Fotos", "Banners"].map((x, i) => <Button key={x} variant={i === 0 ? "studio" : "outline"} size="sm">{x}</Button>)}</div>
    <label className="flex cursor-pointer flex-col items-center border border-dashed border-border bg-background px-6 py-16 text-center"><CloudUpload className="size-8 text-primary" /><span className="mt-4 font-display text-2xl">Envie uma mídia</span><span className="mt-2 text-sm text-muted-foreground">PNG, JPG, WebP ou PDF · até 20 MB</span><input type="file" className="sr-only" onChange={upload} /></label>
    {msg && <p className="mt-4 border-l-2 border-primary pl-3 text-sm">{msg}</p>}</>;
}

function Projects() { return <div className="grid gap-3 lg:grid-cols-3">{projects.map((p, i) => <article key={p.title} className="border border-border bg-background p-5"><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold uppercase">Ativo</span><h2 className="mt-10 font-display text-2xl">{p.title}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{p.description}</p><p className="mt-6 text-xs text-muted-foreground">Ordem {i + 1}</p></article>)}</div>; }

function History() {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  useEffect(() => { listActivity().then(setRows); }, []);
  if (!rows) return <p className="text-sm text-muted-foreground">Carregando histórico…</p>;
  if (rows.length === 0) return <Empty icon={RotateCcw} title="Histórico preservado" text="Quando a primeira alteração for publicada, as versões anterior e nova aparecerão aqui para comparação e restauração." />;
  return <div className="border border-border bg-background">{rows.map(r => {
    const before = (r.before_snapshot?.["title"] as string) ?? "—";
    const after = (r.after_snapshot?.["title"] as string) ?? "—";
    return <div key={r.id} className="border-b border-border p-5 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold">{r.action}</p><span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</span></div>
      <p className="mt-2 text-sm text-muted-foreground"><span className="line-through opacity-70">{before}</span> → <span className="font-bold text-foreground">{after}</span></p>
    </div>;
  })}</div>;
}

function Users() { return <div className="border border-border bg-background"><div className="flex items-center gap-4 p-5"><span className="flex size-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">M</span><div className="min-w-0 flex-1"><p className="font-bold">Matheus</p><p className="text-sm text-muted-foreground">Proprietário inicial</p></div><span className="text-xs text-muted-foreground">Acesso total</span></div></div>; }

function Auditor() {
  const checks = ["Mensagem clara e compreensível", "Texto bíblico com contexto e tradução", "Hierarquia entre título, apoio, imagem e CTA", "Logo, cores, tipografia e margens corretas", "Links e destino do CTA revisados", "Projetos futuros não apresentados como ativos"];
  return <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]"><section className="border border-border bg-background p-6"><div className="flex items-center gap-3"><Sparkles className="text-primary" /><h2 className="font-display text-2xl">Checklist de publicação</h2></div><div className="mt-6 space-y-3">{checks.map(x => <label key={x} className="flex items-start gap-3 border-b border-border pb-3 text-sm"><input type="checkbox" className="mt-1 accent-primary" />{x}</label>)}</div></section><section className="bg-studio p-6 text-studio-foreground"><AlertTriangle className="text-primary" /><h2 className="mt-5 font-display text-3xl">Revisar antes de publicar</h2><p className="mt-4 text-sm leading-7 text-studio-foreground/65">O Auditor acompanha a área em uso e aponta riscos de identidade, conteúdo, acessibilidade e operação sem substituir a decisão editorial.</p></section></div>;
}

function Settings() { return <div className="grid gap-5 lg:grid-cols-2"><section className="border border-border bg-background p-6"><p className="eyebrow">Identidade</p><h2 className="mt-3 font-display text-3xl">Logo principal</h2><div className="mt-6 flex aspect-video items-center justify-center bg-muted"><span className="font-display text-2xl">Vida no Altar</span></div><div className="mt-5 flex gap-2"><Button variant="outline">Salvar como rascunho</Button><Button variant="studio">Publicar nova versão</Button></div></section><section className="border border-border bg-background p-6"><p className="eyebrow">Histórico</p>{["Logo V4 — Atual", "Logo V3 — Arquivada", "Logo V2 — Arquivada"].map((x, i) => <div key={x} className="flex items-center justify-between border-b border-border py-4"><span className="text-sm font-bold">{x}</span>{i > 0 && <Button variant="ghost" size="sm"><RotateCcw />Restaurar</Button>}</div>)}</section></div>; }
