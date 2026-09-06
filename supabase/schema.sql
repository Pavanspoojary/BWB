-- ==============================================================================
-- TOOL//ARENA — live dev-tool deathmatch schema
-- Tables are read-only to anon clients; every mutation flows through the
-- SECURITY DEFINER RPCs below (short transactions, row locks, no N+1).
-- Apply with: supabase db push  (or paste into the SQL editor once)
-- ==============================================================================

-- ---------- tables ----------

create table if not exists public.arena_tools (
  id text primary key,
  name text not null unique,
  category text not null default 'DEVTOOL',
  blurb text not null default '',
  hp integer not null default 70 check (hp >= 0 and hp <= 100),
  status text not null default 'alive' check (status in ('alive', 'dead', 'sealed')),
  eliminated_by text,
  eliminated_day integer,
  epitaph text,
  created_at timestamptz not null default now()
);

create table if not exists public.arena_votes (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null,
  voter_name text not null,
  vote_type text not null check (vote_type in ('save', 'kill')),
  delta integer not null check (delta in (15, -15, 5, -5)),
  created_at timestamptz not null default now()
);

create table if not exists public.arena_state (
  id integer primary key,
  day integer not null default 1,
  exec_today integer not null default 0,
  revealed_today text,
  last_cull_at timestamptz
);

insert into public.arena_state (id, day, exec_today, revealed_today)
values (1, 1, 0, null)
on conflict (id) do nothing;

-- ---------- indexes ----------

create index if not exists idx_arena_tools_status_hp
  on public.arena_tools (status, hp desc);
create index if not exists idx_arena_tools_sealed
  on public.arena_tools (created_at) where status = 'sealed';
create index if not exists idx_arena_votes_tool_time
  on public.arena_votes (tool_name, created_at desc);
create index if not exists idx_arena_votes_time
  on public.arena_votes (created_at desc);

-- ---------- RLS: public read, writes via RPC only ----------

alter table public.arena_tools enable row level security;
alter table public.arena_votes enable row level security;
alter table public.arena_state enable row level security;

drop policy if exists "arena public read tools" on public.arena_tools;
create policy "arena public read tools"
  on public.arena_tools for select using (true);

drop policy if exists "arena public read votes" on public.arena_votes;
create policy "arena public read votes"
  on public.arena_votes for select using (true);

drop policy if exists "arena public read state" on public.arena_state;
create policy "arena public read state"
  on public.arena_state for select using (true);

-- ---------- RPC: cast a vote ----------

create or replace function public.cast_arena_vote(
  p_tool_id text,
  p_vote_type text,
  p_voter_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hp integer;
  v_died boolean := false;
  v_day integer;
  v_delta integer;
  v_blurb text;
begin
  if p_vote_type not in ('save', 'kill') then
    raise exception 'invalid vote type';
  end if;
  if p_voter_name is null or length(trim(p_voter_name)) = 0 then
    raise exception 'voter required';
  end if;
  v_delta := case when p_vote_type = 'save' then 15 else -15 end;

  select day into v_day from public.arena_state where id = 1;

  update public.arena_tools
     set hp = greatest(0, least(100, hp + v_delta))
   where id = p_tool_id and status = 'alive'
  returning hp, blurb into v_hp, v_blurb;

  if not found then
    raise exception 'tool is not alive';
  end if;

  insert into public.arena_votes (tool_name, voter_name, vote_type, delta)
  values ((select name from public.arena_tools where id = p_tool_id), trim(p_voter_name), p_vote_type, v_delta);

  if v_hp = 0 then
    update public.arena_tools
       set status = 'dead',
           eliminated_by = trim(p_voter_name),
           eliminated_day = v_day,
           epitaph = v_blurb
     where id = p_tool_id;
    v_died := true;
  end if;

  return jsonb_build_object('died', v_died, 'hp', v_hp);
end;
$$;

-- ---------- RPC: execute the cull (bottom 3 die, day advances) ----------

create or replace function public.execute_arena_cull(p_cause text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day integer;
  v_culled integer := 0;
  r record;
begin
  -- serialize concurrent culls within a single transaction
  perform pg_advisory_xact_lock(hashtext('arena_cull'));

  select day into v_day from public.arena_state where id = 1;

  for r in
    select id, blurb from public.arena_tools
     where status = 'alive'
     order by hp asc, name asc
     limit 3
  loop
    update public.arena_tools
       set status = 'dead',
           hp = 0,
           eliminated_by = coalesce(nullif(trim(p_cause), ''), 'THE CULL'),
           eliminated_day = v_day,
           epitaph = r.blurb
     where id = r.id;
    v_culled := v_culled + 1;
  end loop;

  update public.arena_state
     set day = v_day + 1,
         exec_today = v_culled,
         revealed_today = null,
         last_cull_at = now()
   where id = 1;

  return jsonb_build_object('success', true, 'culled_count', v_culled, 'day', v_day + 1);
end;
$$;

-- ---------- RPC: reveal the sealed challenger (1/day) ----------

create or replace function public.reveal_arena_challenger()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  perform pg_advisory_xact_lock(hashtext('arena_reveal'));

  if exists (select 1 from public.arena_state where id = 1 and revealed_today is not null) then
    return jsonb_build_object('success', false, 'error', 'CHALLENGER ALREADY REVEALED TODAY');
  end if;

  select * into r from public.arena_tools
   where status = 'sealed'
   order by created_at asc
   limit 1;

  if not found then
    return jsonb_build_object('success', false, 'error', 'CHALLENGER POOL DRY');
  end if;

  update public.arena_tools
     set status = 'alive', hp = 70
   where id = r.id;

  update public.arena_state
     set revealed_today = r.name
   where id = 1;

  return jsonb_build_object('success', true, 'tool', jsonb_build_object(
    'id', r.id, 'name', r.name, 'category', r.category, 'blurb', r.blurb, 'hp', 70
  ));
end;
$$;

-- ---------- RPC: sacrifice a new product ----------

create or replace function public.submit_arena_product(
  p_name text,
  p_category text,
  p_blurb text,
  p_creator text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text;
  v_cat text;
begin
  v_id := upper(trim(coalesce(p_name, '')));
  v_cat := upper(trim(coalesce(p_category, 'DEVTOOL')));
  if length(v_id) < 2 or length(v_id) > 28 then
    return jsonb_build_object('success', false, 'error', 'NAME MUST BE 2-28 CHARACTERS');
  end if;
  if length(trim(coalesce(p_blurb, ''))) < 5 then
    return jsonb_build_object('success', false, 'error', 'PITCH MUST BE AT LEAST 5 CHARACTERS');
  end if;
  if exists (select 1 from public.arena_tools where id = v_id) then
    return jsonb_build_object('success', false, 'error', 'TOOL ALREADY EXISTS IN THE ARENA');
  end if;

  insert into public.arena_tools (id, name, category, blurb, hp, status)
  values (v_id, v_id, substring(v_cat from 1 for 20), substring(trim(p_blurb) from 1 for 100), 70, 'alive');

  return jsonb_build_object('success', true, 'id', v_id);
end;
$$;

-- ---------- seed roster (idempotent) ----------

insert into public.arena_tools (id, name, category, blurb, hp, status) values
  ('SUPABASE','SUPABASE','DATABASE','The Postgres open-source platform',85,'alive'),
  ('GITHUB','GITHUB','FORGE','Where software gets shipped and code lives',84,'alive'),
  ('RAYCAST','RAYCAST','LAUNCHER','Keyboard-first productivity weapon',82,'alive'),
  ('VITE','VITE','BUILDTOOL','Instant HMR blazing frontend dev server',80,'alive'),
  ('VERCEL','VERCEL','INFRA','Frontend cloud deploy in milliseconds',78,'alive'),
  ('LINEAR','LINEAR','TRACKER','High-velocity issue tracking for teams',74,'alive'),
  ('FIGMA','FIGMA','DESIGN','Collaborative UI interface forge',73,'alive'),
  ('BUN','BUN','RUNTIME','Incredible speed all-in-one JS toolkit',71,'alive'),
  ('NEOVIM','NEOVIM','EDITOR','Hyperextensible Vim-based text editor',68,'alive'),
  ('TAILWIND','TAILWIND','CSS','Utility-first rapid styling engine',66,'alive'),
  ('OBSIDIAN','OBSIDIAN','NOTES','Second brain connected markdown knowledge base',65,'alive'),
  ('HOMEBREW','HOMEBREW','PKGMGR','The missing package manager for macOS',62,'alive'),
  ('DOCKER','DOCKER','CONTAINERS','Standard container runtime engine',59,'alive'),
  ('NOTION','NOTION','WORKSPACE','All-in-one workspace and docs system',52,'alive'),
  ('POSTMAN','POSTMAN','API','The legacy API platform under siege',48,'alive')
on conflict (id) do nothing;

insert into public.arena_tools (id, name, category, blurb, hp, status) values
  ('ZED','ZED','EDITOR','Blazing multiplayer code editor',70,'sealed'),
  ('HTMX','HTMX','FRAMEWORK','Hypermedia-driven interactivity',70,'sealed'),
  ('SUPERMAVEN','SUPERMAVEN','AI','Fast ghost-text code intelligence',70,'sealed'),
  ('TURSO','TURSO','DATABASE','Edge SQLite that replicates everywhere',70,'sealed'),
  ('BIOME','BIOME','DEVTOOL','One binary to format and lint web code',70,'sealed'),
  ('SST','SST','INFRA','Full-stack AWS ion engine',70,'sealed'),
  ('EXCALIDRAW','EXCALIDRAW','DESIGN','Hand-drawn whiteboard diagrams',70,'sealed'),
  ('RIPGREP','RIPGREP','CLI','Absurdly fast recursive search',70,'sealed')
on conflict (id) do nothing;
