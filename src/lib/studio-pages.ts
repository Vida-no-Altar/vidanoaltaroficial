import { supabase } from "@/integrations/supabase/client";

export type PageContent = { eyebrow: string; body: string; ctaLabel: string; ctaHref: string; imageAlt: string };
export type PageRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  content: PageContent;
  published_at: string | null;
  updated_at: string;
};

export const emptyContent: PageContent = { eyebrow: "", body: "", ctaLabel: "", ctaHref: "", imageAlt: "" };

export const statusLabels: Record<PageRow["status"], string> = {
  draft: "Rascunho",
  review: "Em revisão",
  scheduled: "Agendado",
  published: "Publicado",
  archived: "Arquivado",
};

export const defaultHome: Omit<PageRow, "id" | "published_at" | "updated_at"> = {
  slug: "home-hero",
  title: "Presença que transforma gerações.",
  description: "Conteúdo cristão simples, profundo e real para jovens, adolescentes e toda a igreja.",
  status: "draft",
  content: {
    eyebrow: "Central oficial do Vida no Altar",
    body: "",
    ctaLabel: "Comece por aqui",
    ctaHref: "/comecar",
    imageAlt: "Bíblia aberta iluminada pela luz da manhã",
  },
};

function normalize(row: Record<string, unknown>): PageRow {
  return { ...(row as PageRow), content: { ...emptyContent, ...((row["content"] as PageContent) ?? {}) } };
}

export async function listPages(): Promise<PageRow[]> {
  const { data } = await supabase.from("site_pages").select("*").order("slug");
  return (data ?? []).map(normalize);
}

export async function getPage(slug: string): Promise<PageRow | null> {
  const { data } = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle();
  return data ? normalize(data) : null;
}

export async function savePage(
  current: PageRow | null,
  next: Omit<PageRow, "id" | "published_at" | "updated_at">,
  action: "draft" | "review" | "publish",
): Promise<{ page: PageRow | null; error: string | null }> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id ?? null;
  const status = action === "publish" ? "published" : action === "review" ? "review" : "draft";
  const payload = {
    slug: next.slug,
    title: next.title,
    description: next.description,
    content: next.content as unknown as never,
    status: status as PageRow["status"],
    published_at: action === "publish" ? new Date().toISOString() : (current?.published_at ?? null),
    updated_by: userId,
    ...(current ? {} : { created_by: userId }),
  };
  const { data, error } = await supabase.from("site_pages").upsert(payload, { onConflict: "slug" }).select("*").maybeSingle();
  if (error || !data) return { page: null, error: error?.message ?? "Não foi possível salvar." };
  const page = normalize(data);

  const { count } = await supabase
    .from("content_versions")
    .select("id", { count: "exact", head: true })
    .eq("entity_type", "site_page")
    .eq("entity_id", page.id);

  await supabase.from("content_versions").insert({
    entity_type: "site_page",
    entity_id: page.id,
    version_number: (count ?? 0) + 1,
    snapshot: page as unknown as never,
    status: page.status,
    created_by: userId,
  });

  await supabase.from("activity_log").insert({
    actor_id: userId,
    action: action === "publish" ? "Publicou a seção" : action === "review" ? "Enviou para revisão" : "Salvou rascunho",
    entity_type: "site_page",
    entity_id: page.id,
    before_snapshot: (current ?? null) as unknown as never,
    after_snapshot: page as unknown as never,
  });

  return { page, error: null };
}

export type ActivityRow = {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  before_snapshot: Record<string, unknown> | null;
  after_snapshot: Record<string, unknown> | null;
};

export async function listActivity(): Promise<ActivityRow[]> {
  const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(30);
  return (data ?? []) as unknown as ActivityRow[];
}
