-- ERP Cocina Institucional - Supabase base segura
-- Ejecutar en Supabase SQL Editor. No pegar service_role en la PWA.

create extension if not exists pgcrypto;

create table if not exists public.erp_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.erp_workspace_members (
  workspace_id uuid not null references public.erp_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'consulta',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.erp_records (
  workspace_id uuid not null references public.erp_workspaces(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (workspace_id, key)
);

alter table public.erp_workspaces enable row level security;
alter table public.erp_workspace_members enable row level security;
alter table public.erp_records enable row level security;

create or replace function public.erp_is_member(target_workspace uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.erp_workspace_members member
    where member.workspace_id = target_workspace
      and member.user_id = auth.uid()
  );
$$;

create or replace function public.erp_member_role(target_workspace uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select coalesce((
    select member.role
    from public.erp_workspace_members member
    where member.workspace_id = target_workspace
      and member.user_id = auth.uid()
    limit 1
  ), '');
$$;

drop policy if exists "workspace_select_member" on public.erp_workspaces;
create policy "workspace_select_member"
on public.erp_workspaces for select
to authenticated
using (public.erp_is_member(id));

drop policy if exists "workspace_insert_owner" on public.erp_workspaces;
create policy "workspace_insert_owner"
on public.erp_workspaces for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "members_select_same_workspace" on public.erp_workspace_members;
create policy "members_select_same_workspace"
on public.erp_workspace_members for select
to authenticated
using (public.erp_is_member(workspace_id));

drop policy if exists "members_manage_admin" on public.erp_workspace_members;
create policy "members_manage_admin"
on public.erp_workspace_members for all
to authenticated
using (public.erp_member_role(workspace_id) in ('administrador', 'owner'))
with check (public.erp_member_role(workspace_id) in ('administrador', 'owner') or user_id = auth.uid());

drop policy if exists "records_select_member" on public.erp_records;
create policy "records_select_member"
on public.erp_records for select
to authenticated
using (public.erp_is_member(workspace_id));

drop policy if exists "records_write_authorized" on public.erp_records;
create policy "records_write_authorized"
on public.erp_records for insert
to authenticated
with check (
  public.erp_member_role(workspace_id) in ('owner', 'administrador', 'supervisor', 'produccion', 'talento')
);

drop policy if exists "records_update_authorized" on public.erp_records;
create policy "records_update_authorized"
on public.erp_records for update
to authenticated
using (
  public.erp_member_role(workspace_id) in ('owner', 'administrador', 'supervisor', 'produccion', 'talento')
)
with check (
  public.erp_member_role(workspace_id) in ('owner', 'administrador', 'supervisor', 'produccion', 'talento')
);

-- Despues de crear el primer usuario por Auth, crea la empresa:
-- insert into public.erp_workspaces (name, owner_id) values ('Mi empresa', 'UUID_DEL_USUARIO') returning id;
-- insert into public.erp_workspace_members (workspace_id, user_id, role) values ('UUID_WORKSPACE', 'UUID_DEL_USUARIO', 'owner');
