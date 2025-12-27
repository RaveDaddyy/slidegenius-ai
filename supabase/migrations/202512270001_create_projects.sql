create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  input jsonb not null,
  slides jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Projects select own" on public.projects
  for select using (auth.uid() = user_id);

create policy "Projects insert own" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Projects update own" on public.projects
  for update using (auth.uid() = user_id);

create policy "Projects delete own" on public.projects
  for delete using (auth.uid() = user_id);
