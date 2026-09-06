import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config.ts';
import { SEALED_POOL } from '../data/seed.ts';
import { aliveTools, pickCullVictims, sortAlive } from '../state/store.ts';
import type { ArenaRuntime } from '../state/store.ts';
import type { DeadEntry, Tool, VoteKind } from '../types.ts';

let client: SupabaseClient | null = null;

export function getClient(): SupabaseClient | null {
  if (client) return client;
  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
  } catch {
    return null;
  }
}

/** Pure: human-readable vote line for ticker/toasts. Exported for tests. */
export function formatVoteMessage(
  voter: string,
  kind: VoteKind,
  toolName: string,
  delta: number,
): string {
  const verb = kind === 'save' ? 'SAVED' : 'HIT';
  const signed = delta > 0 ? `+${delta}` : `${delta}`;
  return `${voter} ${verb} ${toolName} ${signed}`;
}

export interface DbToolRow {
  id: string;
  name: string;
  category: string;
  blurb: string;
  hp: number;
  status: 'alive' | 'dead' | 'sealed';
  eliminated_by?: string | null;
  eliminated_day?: number | null;
  epitaph?: string | null;
}

/** Load DB truth into the runtime. Returns ticker seed lines. */
export async function loadArena(rt: ArenaRuntime): Promise<string[]> {
  const sb = getClient();
  if (!sb) throw new Error('supabase unavailable');

  const { data: state } = await sb.from('arena_state').select('*').eq('id', 1).single();
  if (state) {
    rt.day = state.day as number;
    rt.execToday = state.exec_today as number;
  }

  const { data: rows, error } = await sb
    .from('arena_tools')
    .select('*')
    .order('hp', { ascending: false });
  if (error) throw error;

  const freshDead: DeadEntry[] = [];
  for (const r of (rows ?? []) as DbToolRow[]) {
    if (r.status === 'alive') {
      rt.tools.set(r.id, {
        id: r.id,
        name: r.name,
        category: r.category,
        blurb: r.blurb,
        hp: r.hp,
        dead: false,
      });
    } else if (r.status === 'dead') {
      freshDead.push({
        n: r.name,
        c: r.category,
        by: r.eliminated_by ?? 'THE MARCH OF TIME',
        day: r.eliminated_day ?? 0,
        ep: r.epitaph ?? r.blurb,
      });
      const existing = rt.tools.get(r.id);
      if (existing) {
        existing.dead = true;
        existing.hp = 0;
      } else {
        rt.tools.set(r.id, {
          id: r.id,
          name: r.name,
          category: r.category,
          blurb: r.blurb,
          hp: 0,
          dead: true,
        });
      }
    }
  }
  if (freshDead.length) rt.dead = freshDead;

  const { data: votes } = await sb
    .from('arena_votes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);
  if (votes?.length) {
    return votes.map((v) =>
      formatVoteMessage(
        v.voter_name as string,
        (v.delta as number) > 0 ? 'save' : 'kill',
        v.tool_name as string,
        v.delta as number,
      ),
    );
  }
  return [
    `DAY ${String(rt.day).padStart(2, '0')} ARENA LIVE`,
    `${aliveTools(rt).length} TOOLS ALIVE`,
    'REALTIME SUPABASE ACTIVE',
    '5 VOTES PER DAY — CHOOSE WEAPONS',
  ];
}

/** Local offline cull used when the DB is unreachable. Returns victims. */
export function localCull(rt: ArenaRuntime, cause: string): Tool[] {
  const victims = pickCullVictims(sortAlive(rt.tools ? [...rt.tools.values()] : []), 3);
  void cause;
  return victims;
}

export async function castVote(
  toolId: string,
  kind: VoteKind,
  voter: string,
): Promise<{ died: boolean }> {
  const sb = getClient();
  if (!sb) return { died: false };
  const { data, error } = await sb.rpc('cast_arena_vote', {
    p_tool_id: toolId,
    p_vote_type: kind,
    p_voter_name: voter,
  });
  if (error) throw error;
  return { died: Boolean((data as { died?: boolean } | null)?.died) };
}

export async function executeCullRpc(cause: string): Promise<{ culled: number; day: number }> {
  const sb = getClient();
  if (!sb) throw new Error('supabase unavailable');
  const { data, error } = await sb.rpc('execute_arena_cull', { p_cause: cause });
  if (error) throw error;
  const d = data as { success?: boolean; culled_count?: number; day?: number; error?: string };
  if (!d?.success) throw new Error(d?.error ?? 'cull failed');
  return { culled: d.culled_count ?? 0, day: d.day ?? 0 };
}

export interface RevealedTool {
  id: string;
  name: string;
  category: string;
  blurb: string;
  hp: number;
}

export async function revealChallenger(): Promise<RevealedTool> {
  const sb = getClient();
  if (!sb) throw new Error('supabase unavailable');
  const { data, error } = await sb.rpc('reveal_arena_challenger');
  if (error) throw error;
  const d = data as { success?: boolean; tool?: RevealedTool; error?: string };
  if (!d?.success || !d.tool) throw new Error(d?.error ?? 'no challenger available');
  return d.tool;
}

/** Next sealed challenger name (DB) or null. */
export async function peekSealed(): Promise<string | null> {
  const sb = getClient();
  if (!sb) return null;
  const { data: state } = await sb.from('arena_state').select('revealed_today').eq('id', 1).single();
  if (state?.revealed_today) return state.revealed_today as string;
  const { data: sealed } = await sb
    .from('arena_tools')
    .select('name')
    .eq('status', 'sealed')
    .order('created_at', { ascending: true })
    .limit(1);
  return sealed?.[0]?.name ?? null;
}

export function nextLocalSealed(rt: ArenaRuntime): (typeof SEALED_POOL)[number] | null {
  return (
    SEALED_POOL.find((s) => !rt.tools.has(s.name) && !rt.dead.some((d) => d.n === s.name)) ?? null
  );
}

export async function submitProduct(
  name: string,
  category: string,
  blurb: string,
  creator: string,
): Promise<void> {
  const sb = getClient();
  if (!sb) return;
  const { data, error } = await sb.rpc('submit_arena_product', {
    p_name: name,
    p_category: category,
    p_blurb: blurb,
    p_creator: creator,
  });
  if (error) throw error;
  const d = data as { success?: boolean; error?: string };
  if (d && d.success === false) throw new Error(d.error ?? 'submission rejected');
}

// ---- realtime ----

export function setupPresence(
  user: string,
  onCount: (n: number) => void,
): RealtimeChannel | null {
  const sb = getClient();
  if (!sb) return null;
  try {
    const ch = sb.channel('arena_presence', { config: { presence: { key: user } } });
    ch.on('presence', { event: 'sync' }, () => {
      const live = Object.keys(ch.presenceState()).length;
      onCount(66 + Math.max(0, live - 1));
    });
    void ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        void ch.track({ user, online_at: new Date().toISOString() });
      }
    });
    return ch;
  } catch {
    return null;
  }
}

export interface RealtimeHandlers {
  onVote: (msg: string, kind: VoteKind, mine: boolean) => void;
  onToolHp: (id: string, hp: number, delta: number) => void;
  onToolDeath: (id: string, by: string) => void;
  onToolSpawn: (row: DbToolRow) => void;
  onDayChange: (day: number, execToday: number) => void;
}

export function subscribeArena(me: string, h: RealtimeHandlers): void {
  const sb = getClient();
  if (!sb) return;
  try {
    sb.channel('realtime_votes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'arena_votes' }, (p) => {
        const v = p.new as { voter_name: string; tool_name: string; delta: number };
        const kind: VoteKind = v.delta > 0 ? 'save' : 'kill';
        h.onVote(formatVoteMessage(v.voter_name, kind, v.tool_name, v.delta), kind, v.voter_name === me);
      })
      .subscribe();

    sb.channel('realtime_tools')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'arena_tools' }, (p) => {
        const row = p.new as DbToolRow;
        if (!row?.id) return;
        if (row.status === 'dead') h.onToolDeath(row.id, row.eliminated_by ?? 'THE CULL');
        else if (row.status === 'alive' && (p.eventType === 'INSERT' || row.hp === 70)) {
          // Spawn heuristic: inserts arrive as alive rows; HP updates flow through hp path.
          if (p.eventType === 'INSERT') h.onToolSpawn(row);
          else h.onToolHp(row.id, row.hp, 0);
        } else {
          h.onToolHp(row.id, row.hp, 0);
        }
      })
      .subscribe();

    sb.channel('realtime_state')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'arena_state' }, (p) => {
        const st = p.new as { day: number; exec_today: number };
        h.onDayChange(st.day, st.exec_today);
      })
      .subscribe();
  } catch {
    /* realtime optional */
  }
}
