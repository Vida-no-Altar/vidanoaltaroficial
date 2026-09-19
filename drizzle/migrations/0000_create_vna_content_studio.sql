CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'editor', 'contributor');
CREATE TYPE public.content_status AS ENUM ('draft', 'review', 'scheduled', 'published', 'archived');
CREATE TYPE public.project_status AS ENUM ('active', 'planned', 'future', 'development', 'archived');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.has_studio_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;
GRANT EXECUTE ON FUNCTION public.has_studio_access(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_first_owner()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  LOCK TABLE public.user_roles IN EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM public.user_roles) THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'owner');
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_first_owner() TO authenticated;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.content_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_pages TO authenticated;
GRANT ALL ON public.site_pages TO service_role;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published pages are public" ON public.site_pages FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Studio members read pages" ON public.site_pages FOR SELECT TO authenticated USING (public.has_studio_access(auth.uid()));
CREATE POLICY "Editors create pages" ON public.site_pages FOR INSERT TO authenticated WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Editors update pages" ON public.site_pages FOR UPDATE TO authenticated USING (public.has_studio_access(auth.uid())) WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Admins delete pages" ON public.site_pages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cover_url text,
  status public.project_status NOT NULL DEFAULT 'planned',
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active projects are public" ON public.projects FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "Studio members read projects" ON public.projects FOR SELECT TO authenticated USING (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members update projects" ON public.projects FOR UPDATE TO authenticated USING (public.has_studio_access(auth.uid())) WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Admins delete projects" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  content_type text NOT NULL DEFAULT 'devotional',
  short_description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  cover_url text,
  platform text,
  external_url text,
  duration_seconds integer,
  verses text[] NOT NULL DEFAULT '{}',
  theme text,
  status public.content_status NOT NULL DEFAULT 'draft',
  publish_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contents TO authenticated;
GRANT ALL ON public.contents TO service_role;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published contents are public" ON public.contents FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Studio members read contents" ON public.contents FOR SELECT TO authenticated USING (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members create contents" ON public.contents FOR INSERT TO authenticated WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members update contents" ON public.contents FOR UPDATE TO authenticated USING (public.has_studio_access(auth.uid())) WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Admins delete contents" ON public.contents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'image',
  category text NOT NULL DEFAULT 'images',
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  alt_text text NOT NULL DEFAULT '',
  usage_notes text NOT NULL DEFAULT '',
  archived boolean NOT NULL DEFAULT false,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio members read media" ON public.media_assets FOR SELECT TO authenticated USING (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members add media" ON public.media_assets FOR INSERT TO authenticated WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members update media" ON public.media_assets FOR UPDATE TO authenticated USING (public.has_studio_access(auth.uid())) WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Admins delete media" ON public.media_assets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  version_number integer NOT NULL,
  snapshot jsonb NOT NULL,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id, version_number)
);
GRANT SELECT, INSERT ON public.content_versions TO authenticated;
GRANT ALL ON public.content_versions TO service_role;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio members read versions" ON public.content_versions FOR SELECT TO authenticated USING (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members create versions" ON public.content_versions FOR INSERT TO authenticated WITH CHECK (public.has_studio_access(auth.uid()));

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio members read activity" ON public.activity_log FOR SELECT TO authenticated USING (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members create activity" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (public.has_studio_access(auth.uid()) AND actor_id = auth.uid());

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  recommendation_reason text NOT NULL DEFAULT '',
  affiliate_url text,
  is_affiliate boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published products are public" ON public.products FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Studio members read products" ON public.products FOR SELECT TO authenticated USING (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members create products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Studio members update products" ON public.products FOR UPDATE TO authenticated USING (public.has_studio_access(auth.uid())) WITH CHECK (public.has_studio_access(auth.uid()));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX contents_status_publish_at_idx ON public.contents(status, publish_at);
CREATE INDEX projects_status_sort_idx ON public.projects(status, sort_order);
CREATE INDEX site_pages_status_slug_idx ON public.site_pages(status, slug);
CREATE INDEX activity_log_created_idx ON public.activity_log(created_at DESC);