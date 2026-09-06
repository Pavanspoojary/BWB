import { DAILY_AMMO, MAX_HP, RANKS } from '../config.ts';
import { SEED_DEAD, SEED_TOOLS, randomUser } from '../data/seed.ts';
import type { DeadEntry, FlowMap, LocalPlayer, Tool } from '../types.ts';

export const LS_KEY = 'arena_local_v2';

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function yesterdayKey(d = new Date()): string {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

/** Pure: rank title for an XP total. Exported for tests. */
export function rankForXp(xp: number): string {
  let t: string = RANKS[0].t;
  for (const l of RANKS) if (xp >= l.x) t = l.t;
  return t;
}

/** Pure: clamp HP into [0, MAX_HP]. Exported for tests. */
export function clampHp(hp: number): number {
  return Math.max(0, Math.min(MAX_HP, Math.round(hp)));
}

/**
 * Pure: compute the next streak given lastVoteDay and today.
 * Returns { streak, lastVoteDay } — no side effects, exported for tests.
 */
export function nextStreak(
  lastVoteDay: string | null,
  streak: number,
  today: string,
  yesterday: string,
): { streak: number; lastVoteDay: string } {
  if (lastVoteDay === today) return { streak, lastVoteDay: today };
  if (lastVoteDay === yesterday) return { streak: streak + 1, lastVoteDay: today };
  return { streak: 1, lastVoteDay: today };
}

/** Pure: pick the bottom N alive tools by HP. Exported for tests. */
export function pickCullVictims(tools: Tool[], n = 3): Tool[] {
  return tools
    .filter((t) => !t.dead)
    .slice()
    .sort((a, b) => a.hp - b.hp || a.name.localeCompare(b.name))
    .slice(0, n);
}

/** Pure: sort alive tools best-first. Exported for tests. */
export function sortAlive(tools: Tool[]): Tool[] {
  return tools
    .filter((t) => !t.dead)
    .slice()
    .sort((a, b) => b.hp - a.hp || a.name.localeCompare(b.name));
}

function freshPlayer(): LocalPlayer {
  return {
    date: todayKey(),
    ammo: DAILY_AMMO,
    xp: 0,
    user: randomUser(),
    streak: 1,
    muted: false,
    lastVoteDay: null,
    lastSeen: null,
    deadCache: [],
  };
}

export interface ArenaRuntime {
  player: LocalPlayer;
  /** Away-days gap detected on this boot (for the while-you-slept moment). */
  awayDays: number;
  day: number;
  execToday: number;
  dead: DeadEntry[];
  tools: Map<string, Tool>;
  flow: FlowMap;
}

function loadPlayer(): { player: LocalPlayer; awayDays: number } {
  let player: LocalPlayer;
  try {
    const raw = localStorage.getItem(LS_KEY);
    player = { ...freshPlayer(), ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    player = freshPlayer();
  }
  // New calendar day: restock ammo, roll streaks by vote continuity.
  if (player.date !== todayKey()) {
    if (player.lastVoteDay === yesterdayKey()) player.streak += 1;
    else if (player.lastVoteDay && player.lastVoteDay !== todayKey()) player.streak = 1;
    player.date = todayKey();
    player.ammo = DAILY_AMMO;
  }
  let awayDays = 0;
  try {
    if (player.lastSeen) awayDays = Math.floor((Date.now() - player.lastSeen) / 86_400_000);
    player.lastSeen = Date.now();
  } catch {
    /* storage hostile — play on */
  }
  return { player, awayDays };
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
export function savePlayerSoon(rt: ArenaRuntime): void {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      rt.player.lastSeen = Date.now();
      const payload: LocalPlayer = {
        ...rt.player,
        deadCache: rt.dead.slice(0, 12).map((d) => d.n),
      };
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, 250);
}

export function createRuntime(): ArenaRuntime {
  const { player, awayDays } = loadPlayer();
  const tools = new Map<string, Tool>();
  for (const t of SEED_TOOLS) tools.set(t.id, { ...t });
  return {
    player,
    awayDays,
    day: 1,
    execToday: 0,
    dead: SEED_DEAD.map((d) => ({ ...d })),
    tools,
    flow: {},
  };
}

export function aliveTools(rt: ArenaRuntime): Tool[] {
  return [...rt.tools.values()].filter((t) => !t.dead);
}
