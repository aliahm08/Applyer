-- Apply this in Supabase SQL editor.
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  company text not null,
  role text not null,
  source text not null default 'manual',
  location text,
  job_url text,
  external_job_id text,
  description text,
  status text not null default 'queued' check (status in ('queued', 'generating', 'pending', 'submitted', 'skipped')),
  letter text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists applications_user_created_idx on public.applications(user_id, created_at);
create unique index if not exists applications_user_external_job_idx
on public.applications(user_id, external_job_id)
where external_job_id is not null;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null default 'application/pdf',
  size_bytes bigint not null,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists resumes_user_created_idx on public.resumes(user_id, created_at);
create unique index if not exists resumes_one_active_per_user_idx
on public.resumes(user_id)
where is_active;

alter table public.applications enable row level security;
alter table public.resumes enable row level security;

drop policy if exists "users can read own applications" on public.applications;
drop policy if exists "users can insert own applications" on public.applications;
drop policy if exists "users can update own applications" on public.applications;
drop policy if exists "users can read own resumes" on public.resumes;
drop policy if exists "users can insert own resumes" on public.resumes;
drop policy if exists "users can update own resumes" on public.resumes;

create policy "users can read own applications"
on public.applications
for select
using ((auth.uid())::text = user_id);

create policy "users can insert own applications"
on public.applications
for insert
with check ((auth.uid())::text = user_id);

create policy "users can update own applications"
on public.applications
for update
using ((auth.uid())::text = user_id)
with check ((auth.uid())::text = user_id);

create policy "users can read own resumes"
on public.resumes
for select
using ((auth.uid())::text = user_id);

create policy "users can insert own resumes"
on public.resumes
for insert
with check ((auth.uid())::text = user_id);

create policy "users can update own resumes"
on public.resumes
for update
using ((auth.uid())::text = user_id)
with check ((auth.uid())::text = user_id);
