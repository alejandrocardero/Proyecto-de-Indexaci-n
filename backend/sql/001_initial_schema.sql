-- Ejecutar en Supabase SQL Editor. Supabase Auth administra auth.users.
create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','manager','staff','viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id),
  title text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  storage_path text not null,
  review_status text not null default 'pending'
    check (review_status in ('pending','approved','rejected')),
  indexing_status text not null default 'queued'
    check (indexing_status in ('queued','processing','indexed','error')),
  review_comment text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_org_created_idx
  on public.documents(organization_id, created_at desc);
create index if not exists documents_org_review_idx
  on public.documents(organization_id, review_status);
create index if not exists documents_org_index_idx
  on public.documents(organization_id, indexing_status);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_org_created_idx
  on public.audit_logs(organization_id, created_at desc);

alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;

-- Las policies permiten acceso directo seguro desde el cliente si se necesita.
-- La API usa service_role en servidor y aplica autorización explícita por tenant.
drop policy if exists "members read own organizations" on public.organizations;
create policy "members read own organizations" on public.organizations
for select to authenticated using (
  exists (select 1 from public.org_members m
          where m.organization_id = organizations.id
            and m.user_id = auth.uid() and m.is_active)
);
drop policy if exists "members read own membership" on public.org_members;
create policy "members read own membership" on public.org_members
for select to authenticated using (user_id = auth.uid());
drop policy if exists "tenant members read documents" on public.documents;
create policy "tenant members read documents" on public.documents
for select to authenticated using (
  exists (select 1 from public.org_members m
          where m.organization_id = documents.organization_id
            and m.user_id = auth.uid() and m.is_active)
);
drop policy if exists "tenant members read audit" on public.audit_logs;
create policy "tenant members read audit" on public.audit_logs
for select to authenticated using (
  exists (select 1 from public.org_members m
          where m.organization_id = audit_logs.organization_id
            and m.user_id = auth.uid() and m.is_active
            and m.role in ('admin','manager'))
);

-- Crear el bucket 'documents' como privado desde Supabase Storage.
