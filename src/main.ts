import './styles.css';
import {
  DAILY_AMMO,
  KILL_DELTA,
  SAVE_DELTA,
  SPAWN_HP,
  VOTE_COOLDOWN_MS,
  XP_FATAL_BLOW,
  XP_KILL,
  XP_SACRIFICE,
  XP_SAVE,
} from './config.ts';
import { randomUser } from './data/seed.ts';
import {
  castVote,
  executeCullRpc,
  getClient,
  loadArena,
  nextLocalSealed,
  peekSealed,
  revealChallenger,
  setupPresence,
  submitProduct,
  subscribeArena,
} from './api/arena.ts';
import {
  sfx,
  sfxChallenger,
  sfxCull,
  sfxPowerup,
  sfxRankUp,
  setMuted,
  unlockAudio,
} from './audio/sfx.ts';
import {
  announceWhileYouSlept,
  seedTicker,
  setAmbientCulling,
  startAmbient,
  startWatchDrift,
} from './sim/ambient.ts';
import {
  createRuntime,
  nextStreak,
  pickCullVictims,
  rankForXp,
  savePlayerSoon,
  todayKey,
  yesterdayKey,
} from './state/store.ts';
import type { ArenaRuntime } from './state/store.ts';
import type { Tool, VoteKind } from './types.ts';
import {
  buildRow,
  die,
  floatDmg,
  paintRow,
  rankFlash,
  renderStats,
  reorder,
  scheduleReorder,
  syncStandings,
  updateHeaderFrom,
  updateMeta,
} from './ui/board.ts';
import {
  el,
  flash,
  initTicker,
  armFlashCleanup,
  logTick,
  renderIcons,
  toast,
  wait,
} from './ui/dom.ts';
import {
  paintMysteryDry,
  paintMysteryRevealed,
  paintMysterySealed,
  setupBoot,
  setupClock,
  setupEasterEgg,
  setupHeader,
  setupHoldCull,
  setupMystery,
  setupSubmitModal,
} from './ui/chrome.ts';

const rt: ArenaRuntime = createRuntime();
let culling = false;
let curTitle = rankForXp(rt.player.xp);
const cooldown = new Map<string, number>();
let presenceLive = false;

function checkLevel(): void {
  const nt = rankForXp(rt.player.xp);
  if (nt !== curTitle) {
    curTitle = nt;
    rankFlash(nt);
    sfxRankUp();
    toast(`NEW RANK ACHIEVED: ${nt}`, 'bone');
  }
}

async function onVote(t: Tool, kind: VoteKind): Promise<void> {
  if (culling) return;
  const now = Date.now();
  if ((cooldown.get(t.name) ?? 0) + VOTE_COOLDOWN_MS > now) return;
  cooldown.set(t.name, now);

  if (kind === 'save' && t.hp >= 100) {
    toast("FULL HP — DON'T WASTE MEDS", 'bone');
    return;
  }
  if (rt.player.ammo <= 0) {
    toast('OUT OF AMMO — THE VOID MIGHT ACCEPT A WHISPER…');
    sfx('deny');
    return;
  }

  rt.player.ammo -= 1;
  const ns = nextStreak(rt.player.lastVoteDay, rt.player.streak, todayKey(), yesterdayKey());
  if (ns.lastVoteDay !== rt.player.lastVoteDay && ns.streak > rt.player.streak) {
    toast(`STREAK x${ns.streak} — THE VOID REMEMBERS LOYALTY`, 'bone');
  }
  rt.player.streak = ns.streak;
  rt.player.lastVoteDay = ns.lastVoteDay;
  updateHeaderFrom(rt);
  savePlayerSoon(rt);

  sfx(kind);
  rt.player.xp += kind === 'save' ? XP_SAVE : XP_KILL;
  checkLevel();

  const delta = kind === 'save' ? SAVE_DELTA : -KILL_DELTA;
  t.hp = Math.max(0, Math.min(100, t.hp + delta));
  const fl = rt.flow[t.name] ?? [0, 0];
  if (delta > 0) fl[0] += delta;
  else fl[1] -= delta;
  rt.flow[t.name] = fl;
  floatDmg(t.name, delta);
  paintRow(rt, t);
  renderStats(rt);
  if (t.hp <= 0) {
    await die(rt, t, rt.player.user);
  } else {
    scheduleReorder(rt, 80);
  }

  try {
    const res = await castVote(t.id, kind, rt.player.user);
    if (res.died && !t.dead) {
      rt.player.xp += XP_FATAL_BLOW;
      toast('KILL BONUS: +30 XP FOR LANDING FATAL BLOW', 'bone');
      checkLevel();
      updateHeaderFrom(rt);
    }
  } catch (err) {
    toast(`DATABASE ERROR: ${(err as Error).message}`, 'bone');
  }
}

async function forceCull(cause: string): Promise<void> {
  if (culling) return;
  culling = true;
  setAmbientCulling(true);
  flash('cullFlash');
  sfxCull();
  try {
    const res = await executeCullRpc(cause);
    toast(`THE CULL CLAIMED ${res.culled} TOOLS. DAY ${res.day} BEGUN.`, 'bone');
    const seed = await loadArena(rt);
    void seed;
    syncStandings(rt, (t, k) => void onVote(t, k));
    await refreshMystery();
  } catch {
    // Offline fallback: the bottom 3 die locally.
    const victims = pickCullVictims(
      [...rt.tools.values()].filter((t) => !t.dead),
      3,
    );
    for (const v of victims) {
      await die(rt, v, cause);
      await wait(250);
    }
    rt.day += 1;
    rt.execToday = victims.length;
    rt.player.ammo = DAILY_AMMO;
    updateHeaderFrom(rt);
    renderStats(rt);
    savePlayerSoon(rt);
    toast(`THE CULL CLAIMED ${victims.length} TOOLS. DAY ${rt.day} BEGUN.`, 'bone');
  }
  await wait(1200);
  culling = false;
  setAmbientCulling(false);
}

async function refreshMystery(): Promise<void> {
  try {
    const sb = getClient();
    if (!sb) throw new Error('offline');
    const { data: st } = await sb.from('arena_state').select('revealed_today').eq('id', 1).single();
    if (st?.revealed_today) {
      paintMysteryRevealed(st.revealed_today as string);
      return;
    }
    const name = await peekSealed();
    if (name) {
      paintMysterySealed(name);
      return;
    }
    const local = nextLocalSealed(rt);
    if (local) paintMysterySealed(local.name);
    else paintMysteryDry();
  } catch {
    const local = nextLocalSealed(rt);
    if (local) paintMysterySealed(local.name);
    else paintMysteryDry();
  }
}

function spawnTool(id: string, name: string, category: string, blurb: string, hp: number): void {
  rt.tools.set(id, { id, name, category, blurb, hp, dead: false, fresh: true });
  const list = el('list');
  const existing = list?.querySelector(`[data-name="${CSS.escape(name)}"]`);
  if (!existing) {
    const row = buildRow(rt, rt.tools.get(id) as Tool, (t, k) => void onVote(t, k));
    list?.appendChild(row);
  }
  reorder(rt);
  renderStats(rt);
}

async function reveal(): Promise<void> {
  const btn = el<HTMLButtonElement>('mBtn');
  if (btn) btn.disabled = true;
  try {
    const tool = await revealChallenger();
    spawnTool(tool.id, tool.name, tool.category, tool.blurb, tool.hp);
    await refreshMystery();
    sfxChallenger();
    toast(`A NEW CHALLENGER ENTERS: ${tool.name} [70 HP]`, 'bone');
    logTick(`CHALLENGER ${tool.name} ENTERS THE ARENA`);
  } catch {
    // Local fallback: summon from the sealed pool.
    const next = nextLocalSealed(rt);
    if (!next) {
      toast('CHALLENGER UNAVAILABLE', 'bone');
      await refreshMystery();
      return;
    }
    spawnTool(next.name, next.name, next.category, next.blurb, SPAWN_HP);
    await refreshMystery();
    sfxChallenger();
    toast(`A NEW CHALLENGER ENTERS: ${next.name} [70 HP]`, 'bone');
    logTick(`CHALLENGER ${next.name} ENTERS THE ARENA`);
  }
}

async function submit(name: string, cat: string, blurb: string): Promise<void> {
  const rawName = name.trim();
  const rawCat = cat.trim().toUpperCase() || 'DEVTOOL';
  const rawBlurb = blurb.trim();
  if (rawName.length < 2) {
    toast('TOOL NAME MUST BE AT LEAST 2 CHARACTERS', 'bone');
    el('pName')?.focus();
    return;
  }
  if (rawName.length > 28) {
    toast('TOOL NAME CANNOT EXCEED 28 CHARACTERS', 'bone');
    el('pName')?.focus();
    return;
  }
  if (rawBlurb.length < 5) {
    toast('PLEASE ENTER A DESCRIPTIVE PITCH (MIN 5 CHARS)', 'bone');
    el('pBlurb')?.focus();
    return;
  }
  const id = rawName.toUpperCase();
  if (rt.tools.has(id) || rt.dead.some((d) => d.n.toUpperCase() === id)) {
    toast(`TOOL "${id}" ALREADY EXISTS IN THE ARENA`, 'bone');
    return;
  }
  try {
    await submitProduct(rawName, rawCat, rawBlurb, rt.player.user);
  } catch (err) {
    toast(`SUBMISSION REJECTED: ${(err as Error).message}`, 'bone');
    return;
  }
  rt.tools.set(id, { id, name: id, category: rawCat, blurb: rawBlurb, hp: SPAWN_HP, dead: false, fresh: true });
  rt.player.xp += XP_SACRIFICE;
  checkLevel();
  syncStandings(rt, (t, k) => void onVote(t, k));
  sfxChallenger();
  sfxPowerup();
  toast(`CHALLENGER SACRIFICED: ${id} [70 HP] (+25 XP)`, 'bone');
  logTick(`NEW PRODUCT SACRIFICED: ${id} BY ${rt.player.user}`);
}

function restock(): void {
  if (rt.player.ammo < DAILY_AMMO) {
    rt.player.ammo = DAILY_AMMO;
    toast('THE VOID ACCEPTS YOUR OFFERING. +5 AMMO.', 'bone');
    sfxPowerup();
    updateHeaderFrom(rt);
    savePlayerSoon(rt);
  } else {
    toast('THE VOID IS ALREADY FULL. 5/5 AMMO READY.', 'bone');
    sfx('save');
  }
}

let presenceChannel: { track: (o: object) => void } | null = null;

function rerollUser(): void {
  rt.player.user = randomUser();
  updateHeaderFrom(rt);
  savePlayerSoon(rt);
  sfx('save');
  toast(`IDENTITY REFORGED: ${rt.player.user}`, 'bone');
  try {
    presenceChannel?.track({ user: rt.player.user, online_at: new Date().toISOString() });
  } catch {
    /* ignore */
  }
}

function toggleMute(): void {
  rt.player.muted = !rt.player.muted;
  setMuted(rt.player.muted);
  savePlayerSoon(rt);
  const btn = el('sndBtn');
  if (btn) {
    btn.innerHTML = `<span class="icon-wrap" data-ico="${rt.player.muted ? 'volumeX' : 'volume2'}"></span>`;
    renderIcons(btn);
  }
  toast(rt.player.muted ? 'AUDIO MUTED' : 'AUDIO ENGAGED', 'bone');
}

// ---- boot ----

setMuted(rt.player.muted);
if (rt.player.muted) {
  const btn = el('sndBtn');
  if (btn) {
    btn.innerHTML = '<span class="icon-wrap" data-ico="volumeX"></span>';
    renderIcons(btn);
  }
}
renderIcons();
armFlashCleanup();
initTicker();
seedTicker(rt);
syncStandings(rt, (t, k) => void onVote(t, k));
updateMeta(rt);
announceWhileYouSlept(rt);

setupHeader({
  rt,
  forceCull,
  reveal,
  submit,
  restock,
  rerollUser,
  toggleMute,
  isCulling: () => culling,
});
setupEasterEgg({ rt, forceCull, reveal, submit, restock, rerollUser, toggleMute, isCulling: () => culling });
setupClock({ rt, forceCull, reveal, submit, restock, rerollUser, toggleMute, isCulling: () => culling });
setupHoldCull({ rt, forceCull, reveal, submit, restock, rerollUser, toggleMute, isCulling: () => culling });
setupMystery({ rt, forceCull, reveal, submit, restock, rerollUser, toggleMute, isCulling: () => culling });
setupSubmitModal({ rt, forceCull, reveal, submit, restock, rerollUser, toggleMute, isCulling: () => culling });
setupBoot(Boolean(rt.player.lastVoteDay));
startAmbient(rt);
startWatchDrift(() => presenceLive);

document.addEventListener('pointerdown', () => unlockAudio(), { once: true });

void (async () => {
  let ok = false;
  try {
    await loadArena(rt);
    ok = true;
    syncStandings(rt, (t, k) => void onVote(t, k));
    await refreshMystery();
    announceWhileYouSlept(rt);
    savePlayerSoon(rt);
  } catch (err) {
    console.warn('Database load warning:', err);
  }
  if (!ok) {
    try {
      await refreshMystery();
    } catch {
      /* local mystery already attempted */
    }
    savePlayerSoon(rt);
  }
  try {
    const ch = setupPresence(rt.player.user, (n) => {
      presenceLive = true;
      const w = el('hWatch');
      if (w) w.textContent = `${n} WATCHING`;
    });
    if (ch) presenceChannel = ch as unknown as { track: (o: object) => void };
  } catch (err) {
    console.warn('Presence setup warning:', err);
  }
  try {
    subscribeArena(rt.player.user, {      onVote: (msg, kind, mine) => {
        logTick(msg);
        if (!mine) toast(msg, kind === 'save' ? 'bone' : 'hot');
      },
      onToolHp: (id, hp) => {
        const tool = rt.tools.get(id);
        if (!tool || tool.dead) return;
        const delta = hp - tool.hp;
        tool.hp = Math.max(0, Math.min(100, hp));
        if (delta !== 0) floatDmg(tool.name, delta);
        paintRow(rt, tool);
        renderStats(rt);
        scheduleReorder(rt);
      },
      onToolDeath: (id, by) => {
        const tool = rt.tools.get(id);
        if (tool && !tool.dead) void die(rt, tool, by);
      },
      onToolSpawn: (row) => {
        if (rt.tools.has(row.id)) return;
        spawnTool(row.id, row.name, row.category, row.blurb, row.hp);
        sfxChallenger();
        toast(`NEW CHALLENGER IN ARENA: ${row.name}`, 'bone');
        void refreshMystery();
      },
      onDayChange: (day, execToday) => {
        if (day === rt.day) return;
        rt.day = day;
        rt.execToday = execToday;
        rt.player.ammo = DAILY_AMMO;
        updateHeaderFrom(rt);
        renderStats(rt);
        flash('cullFlash');
        sfxCull();
        toast(`DAY ${day}. THE CULL HAS EXECUTED. AMMO RESTOCKED.`, 'bone');
        void loadArena(rt)
          .then(() => {
            syncStandings(rt, (t, k) => void onVote(t, k));
            void refreshMystery();
          })
          .catch((e) => console.warn(e));
      },
    });
  } catch (err) {
    console.warn('Realtime subscription warning:', err);
  }
})();
