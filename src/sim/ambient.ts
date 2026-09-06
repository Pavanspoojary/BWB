import { BOT_TICK_MS, ENTROPY_TICK_MS, WATCHER_TICK_MS } from '../config.ts';
import { randomBot } from '../data/seed.ts';
import { aliveTools } from '../state/store.ts';
import type { ArenaRuntime } from '../state/store.ts';
import { floatDmg, paintRow, renderStats, scheduleReorder } from '../ui/board.ts';
import { el, flushTick, logTick, toast } from '../ui/dom.ts';

export function seedTicker(rt: ArenaRuntime): void {
  flushTick([
    `DAY ${String(rt.day).padStart(2, '0')} ARENA LIVE`,
    `${aliveTools(rt).length} TOOLS ALIVE`,
    `${randomBot()} SAVED VITE +15`,
    `${randomBot()} HIT POSTMAN −15`,
    '5 VOTES PER DAY — CHOOSE WEAPONS',
    'MERCY IS NOT A FEATURE HERE',
  ]);
}

/** Gentle watcher-count drift while presence is offline. */
export function startWatchDrift(isPresenceLive: () => boolean): void {
  let base = 66 + Math.floor(Math.random() * 8);
  setInterval(() => {
    if (isPresenceLive() || !el('hWatch')) return;
    base += Math.floor(Math.random() * 7) - 3;
    base = Math.max(52, Math.min(118, base));
    const n = el('hWatch');
    if (n) n.textContent = `${base} WATCHING`;
  }, WATCHER_TICK_MS);
}

let culling = false;
export function setAmbientCulling(v: boolean): void {
  culling = v;
}

function botVote(rt: ArenaRuntime): void {
  if (document.hidden || culling) return;
  const pool = aliveTools(rt);
  if (pool.length < 2) return;
  // Loss aversion you can feel: bias fire at the weakest tools.
  const weak = [...pool].sort((a, b) => a.hp - b.hp).slice(0, Math.min(5, pool.length));
  const target =
    Math.random() < 0.62
      ? weak[Math.floor(Math.random() * weak.length)]
      : pool[Math.floor(Math.random() * pool.length)];
  if (!target || target.dead) return;
  const kind = target.hp <= 20 && Math.random() < 0.7 ? 'kill' : Math.random() < 0.5 ? 'save' : 'kill';
  if (kind === 'save' && target.hp >= 100) return;
  const delta = kind === 'save' ? 5 : -5;
  target.hp = Math.max(1, Math.min(100, target.hp + delta));
  const fl = rt.flow[target.name] ?? [0, 0];
  if (delta > 0) fl[0] += delta;
  else fl[1] -= delta;
  rt.flow[target.name] = fl;
  floatDmg(target.name, delta);
  paintRow(rt, target);
  logTick(`${randomBot()} ${kind === 'save' ? 'SAVED' : 'HIT'} ${target.name} ${delta > 0 ? '+' : ''}${delta}`);
  scheduleReorder(rt, 120);
  renderStats(rt);
}

function entropyTick(rt: ArenaRuntime): void {
  if (document.hidden || culling) return;
  const pool = aliveTools(rt);
  if (!pool.length) return;
  const t = pool[Math.floor(Math.random() * pool.length)];
  if (!t || t.hp <= 1) return;
  t.hp = Math.max(1, t.hp - 1);
  paintRow(rt, t);
  renderStats(rt);
}

export function startAmbient(rt: ArenaRuntime): void {
  setTimeout(() => botVote(rt), 4000);
  setInterval(() => botVote(rt), BOT_TICK_MS);
  setInterval(() => entropyTick(rt), ENTROPY_TICK_MS);
}

/** "Tools died while you slept" — compares fresh dead vs cached names. */
export function announceWhileYouSlept(rt: ArenaRuntime): void {
  try {
    const cached = rt.player.deadCache ?? [];
    const fresh = rt.dead.map((d) => d.n);
    const newDeaths = fresh.filter((n) => !cached.includes(n));
    if (rt.awayDays >= 1 && newDeaths.length) {
      setTimeout(() => {
        toast(`WHILE YOU SLEPT (${rt.awayDays}D): ${newDeaths.slice(0, 3).join(', ')} DIED`, 'bone');
        logTick(`WHILE YOU SLEPT ${newDeaths.length} TOOLS DIED`);
      }, 2500);
    }
  } catch {
    /* ignore */
  }
}
