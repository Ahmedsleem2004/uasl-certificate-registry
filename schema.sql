-- Run in a NEW Supabase project SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.certificates (
 id uuid primary key default gen_random_uuid(),
 organization_name text not null,
 certificate_number text not null unique,
 standard text not null,
 standard_full_name text,
 address text not null,
 scope text not null,
 country text not null,
 original_certificate_date date,
 issue_date date,
 expiry_date date,
 status text not null default 'unverified' check (status in ('unverified','active','suspended','expired','revoked')),
 document_url text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.certificates enable row level security;
alter table public.admin_users enable row level security;
create policy "Public read certificates" on public.certificates for select to anon,authenticated using (true);
create policy "Admins insert" on public.certificates for insert to authenticated with check (exists(select 1 from public.admin_users where user_id=auth.uid()));
create policy "Admins update" on public.certificates for update to authenticated using (exists(select 1 from public.admin_users where user_id=auth.uid())) with check (exists(select 1 from public.admin_users where user_id=auth.uid()));
create policy "Admins delete" on public.certificates for delete to authenticated using (exists(select 1 from public.admin_users where user_id=auth.uid()));
create policy "Read own admin membership" on public.admin_users for select to authenticated using (user_id=auth.uid());
-- After creating an Auth user in Supabase Dashboard, insert their UUID below:
-- insert into public.admin_users(user_id) values ('YOUR_AUTH_USER_UUID');
-- Optional sample record (transcribed from supplied certificate; unverified by issuer):
insert into public.certificates(organization_name,certificate_number,standard,standard_full_name,address,scope,country,original_certificate_date,issue_date,expiry_date,status)
values ('MAS DEVELOPMENT COMPANY','HACCP/D651/1126','HACCP','Hazard Analysis and Critical Control Point','2989, Prince Abdulmajeed Ibn Abdulaziz St., Al Iskan Dist., Al Madinah Al Munawwarah - Kingdom Of Saudi Arabia.','PROVIDING CONSULTANCY FOR PEST CONTROL SERVICES','Saudi Arabia','2026-11-11','2026-11-11','2029-11-10','unverified')
on conflict (certificate_number) do nothing;
