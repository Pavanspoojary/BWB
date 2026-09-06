// Central tuning + environment. Env vars win; hardcoded fallback keeps
// local dev working with zero setup (anon key is public by design, RLS enforced).

const FALLBACK_SUPABASE_URL = 'https://giyzluujybzqvyxwxfox.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpeXpsdXVqeWJ6cXZ5eHd4Zm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjgzNDUsImV4cCI6MjEwMzYwNDM0NX0.CKNni0CNwvBW5pxqem_g7sIQIFh2O2tDm-t129OJILk';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL?.trim() || FALLBACK_SUPABASE_URL;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || FALLBACK_SUPABASE_ANON_KEY;

export const MAX_HP = 100;
export const SAVE_DELTA = 15;
export const KILL_DELTA = 15;
export const SPAWN_HP = 70;
export const CRIT_HP = 25;
export const DAILY_AMMO = 5;

export const XP_SAVE = 10;
export const XP_KILL = 14;
export const XP_FATAL_BLOW = 30;
export const XP_SACRIFICE = 25;

export const RANKS = [
  { x: 0, t: 'LURKER' },
  { x: 60, t: 'PUNTER' },
  { x: 160, t: 'EXECUTIONER' },
  { x: 380, t: 'WARDEN' },
  { x: 800, t: 'ARCHITECT OF CHAOS' },
  { x: 1500, t: 'VOID LORD' },
] as const;

// Ambient simulation tuning (local-only flavor, never writes to DB).
export const BOT_TICK_MS = 9000;
export const ENTROPY_TICK_MS = 45000;
export const WATCHER_TICK_MS = 3000;
export const VOTE_COOLDOWN_MS = 1200;
