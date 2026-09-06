import { CRIT_HP } from '../config.ts';
import { aliveTools, sortAlive } from '../state/store.ts';
import type { ArenaRuntime } from '../state/store.ts';
import type { DeadEntry, Tool, VoteKind } from '../types.ts';
import { sfxDeath } from '../audio/sfx.ts';
import {
  el,
  flash,
  logTick,
  prefersReducedMotion,
  renderIcons,
  shakeScreen,
  toast,
  wait,
} from './dom.ts';

interface RowCache {
  root: HTMLDivElement;
  rank: HTMLElement;
  critChip: HTMLElement;
  hpWrap: HTMLElement;
  pips: HTMLElement[];
  hpNum: HTMLElement;
  flowUp: HTMLElement;
  flowDn: HTMLElement;
  lastF: number;
  isCrit: boolean;
  flipAnim: Animation | null;
}

const rows = new Map<string, RowCache>();

export function rowCount(): number {
  return rows.size;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function paintRow(rt: ArenaRuntime, t: Tool): void {
  const r = rows.get(t.name);
  if (!r || !r.root.isConnected) return;
  const isCrit = t.hp <= CRIT_HP && !t.dead;
  if (r.isCrit !== isCrit) {
    r.isCrit = isCrit;
    r.root.classList.toggle('critical', isCrit);
    r.critChip.style.display = isCrit ? 'inline-block' : 'none';
  }
  const f = Math.round(t.hp / 5);
  if (r.lastF !== f) {
    r.lastF = f;
    r.pips.forEach((p, i) => p.classList.toggle('f', i < f));
  }
  r.hpNum.textContent = String(t.hp);
  const fl = rt.flow[t.name] ?? [0, 0];
  r.flowUp.textContent = `+${fl[0]}`;
  r.flowDn.textContent = `−${fl[1]}`;
}

export function floatDmg(toolName: string, delta: number): void {
  const r = rows.get(toolName);
  const w = r?.hpWrap ?? el(`hp-${toolName}`);
  if (!w) return;
  const s = document.createElement('span');
  s.className = `dmg ${delta > 0 ? 'up' : 'dn'}`;
  s.textContent = `${delta > 0 ? '+' : ''}${delta}`;
  w.appendChild(s);
  setTimeout(() => s.remove(), 780);
}

export function buildRow(
  rt: ArenaRuntime,
  t: Tool,
  onVote: (t: Tool, kind: VoteKind) => void,
): HTMLDivElement {
  const d = document.createElement('div');
  d.className = `row${t.fresh ? ' entering' : ''}`;
  d.dataset.name = t.name;
  d.innerHTML = `
    <div class="rank">00</div>
    <div class="id">
      <div class="name-line">
        <span class="name" data-text="${esc(t.name)}">${esc(t.name)}</span>
        <span class="cat">${esc(t.category)}</span>
        <span class="chip crit">ON DEATH ROW</span>
        ${t.fresh ? '<span class="chip new">NEW CHALLENGER</span>' : ''}
      </div>
      <div class="blurb">"${esc(t.blurb)}"</div>
    </div>
    <div class="hp-wrap">
      <div class="hpbar">${'<i></i>'.repeat(20)}</div>
      <div class="hpnum"><b>${t.hp}</b> HP</div>
    </div>
    <div class="flow"><span class="up">+0</span> / <span class="dn">−0</span></div>
    <div class="actions">
      <button class="act save" aria-label="Save ${esc(t.name)} (+15 HP)"><span class="icon-wrap" data-ico="heartPulse"></span>SAVE</button>
      <button class="act kill" aria-label="Kill ${esc(t.name)} (−15 HP)"><span class="icon-wrap" data-ico="skull"></span>KILL</button>
    </div>`;

  const cache: RowCache = {
    root: d,
    rank: d.querySelector('.rank') as HTMLElement,
    critChip: d.querySelector('.chip.crit') as HTMLElement,
    hpWrap: d.querySelector('.hp-wrap') as HTMLElement,
    pips: [...d.querySelectorAll('.hpbar i')] as HTMLElement[],
    hpNum: d.querySelector('.hpnum b') as HTMLElement,
    flowUp: d.querySelector('.flow .up') as HTMLElement,
    flowDn: d.querySelector('.flow .dn') as HTMLElement,
    lastF: -1,
    isCrit: false,
    flipAnim: null,
  };
  (d.querySelector('.save') as HTMLButtonElement).onclick = () =>
    onVote(rt.tools.get(t.name) ?? t, 'save');
  (d.querySelector('.kill') as HTMLButtonElement).onclick = () =>
    onVote(rt.tools.get(t.name) ?? t, 'kill');
  rows.set(t.name, cache);
  paintRow(rt, t);
  renderIcons(d);
  return d;
}

function tombHTML(d: DeadEntry): string {
  return `
    <span class="icon-wrap" data-ico="rip"></span>
    <div>
      <div class="t-line">
        <span class="nm">${esc(d.n)}</span>
        <span class="t-cat">${esc(d.c || 'DEVTOOL')}</span>
      </div>
      <div class="t-meta">ELIMINATED DAY ${String(d.day).padStart(2, '0')} — BY ${esc(d.by)}</div>
      <div class="t-ep">${d.ep ? `"${esc(d.ep)}"` : ''}</div>
    </div>`;
}

export function renderGrave(rt: ArenaRuntime): void {
  const box = el('graves');
  if (!box) return;
  box.innerHTML = '';
  rt.dead.forEach((d) => {
    const g = document.createElement('div');
    g.className = 'tomb';
    g.innerHTML = tombHTML(d);
    box.appendChild(g);
  });
  renderIcons(box);
}

export function addTomb(d: DeadEntry): void {
  const box = el('graves');
  if (!box) return;
  const g = document.createElement('div');
  g.className = 'tomb pop';
  g.innerHTML = tombHTML(d);
  box.prepend(g);
  renderIcons(g);
}

export function renderStats(rt: ArenaRuntime): void {
  const a = aliveTools(rt);
  const set = (id: string, v: string): void => {
    const n = el(id);
    if (n) n.textContent = v;
  };
  set('stPop', String(a.length));
  set('stCrit', String(a.filter((t) => t.hp <= CRIT_HP).length));
  set('stExec', String(rt.execToday));
  set('aliveCnt', `${a.length} ALIVE`);
  set('deadCnt', `${rt.dead.length} DEAD`);
}

/** Death sequence: glitch → ghost flight → shake → tombstone. */
export async function die(rt: ArenaRuntime, t: Tool, by: string): Promise<void> {
  if (t.dead) return;
  t.dead = true;
  rt.dead.unshift({ n: t.name, c: t.category, by, day: rt.day, ep: t.blurb });
  rt.execToday += 1;
  delete rt.flow[t.name];
  renderStats(rt);

  const r = rows.get(t.name);
  if (r) {
    r.flipAnim?.cancel();
    r.flipAnim = null;
    r.root.classList.add('dying');
    sfxDeath();
    await wait(850);

    if (!prefersReducedMotion()) {
      try {
        const rect = r.root.getBoundingClientRect();
        const g = el('graveMarker')?.getBoundingClientRect();
        if (g) {
          const gh = document.createElement('div');
          gh.className = 'ghost';
          gh.textContent = t.name;
          gh.style.left = `${rect.left + 58}px`;
          gh.style.top = `${rect.top}px`;
          document.body.appendChild(gh);
          const tx = g.left + g.width / 2 - (rect.left + 58);
          const ty = g.top - rect.top + 40;
          gh.animate(
            [
              { transform: 'translate(0,0) scale(1)', opacity: 1 },
              { transform: `translate(${tx}px,${ty}px) scale(.35) rotate(9deg)`, opacity: 0.15 },
            ],
            { duration: 750, easing: 'cubic-bezier(.45,-.2,.7,.4)' },
          );
          await wait(720);
          gh.remove();
        }
      } catch {
        /* cosmetic only */
      }
    }

    r.root.style.height = `${r.root.offsetHeight}px`;
    void r.root.offsetWidth;
    r.root.classList.add('collapse');
    setTimeout(() => {
      r.root.remove();
      rows.delete(t.name);
      reorder(rt);
    }, 400);
  }

  shakeScreen();
  addTomb(rt.dead[0]);
  toast(`${t.name} ELIMINATED — BY ${by}`);
  logTick(`${t.name} ELIMINATED BY ${by}`);
}

let reorderTimer: ReturnType<typeof setTimeout> | undefined;
export function scheduleReorder(rt: ArenaRuntime, delay = 60): void {
  clearTimeout(reorderTimer);
  reorderTimer = setTimeout(() => {
    reorderTimer = undefined;
    requestAnimationFrame(() => reorder(rt));
  }, delay);
}

/** FLIP-animated leaderboard reorder with step-up / step-down elevation. */
export function reorder(rt: ArenaRuntime): void {
  const list = el('list');
  if (!list) return;
  const sorted = sortAlive([...rt.tools.values()]);
  const live = sorted
    .map((t) => rows.get(t.name))
    .filter((r): r is RowCache => !!r && r.root.isConnected && !r.root.classList.contains('dying'));

  for (let i = 0; i < sorted.length; i++) {
    const r = rows.get(sorted[i].name);
    if (r) {
      const s = String(i + 1).padStart(2, '0');
      if (r.rank.textContent !== s) r.rank.textContent = s;
    }
  }

  const current = [...list.children].map((c) => (c as HTMLElement).dataset.name ?? null);
  let changed = sorted.length !== current.length;
  if (!changed) {
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].name !== current[i]) {
        changed = true;
        break;
      }
    }
  }
  if (!changed) return;

  const reduce = prefersReducedMotion();
  const oldTops = new Map<string, number>();
  for (const r of live) {
    const name = r.root.dataset.name ?? '';
    if (!reduce) oldTops.set(name, r.root.getBoundingClientRect().top);
    r.flipAnim?.cancel();
    r.flipAnim = null;
  }

  const frag = document.createDocumentFragment();
  for (const t of sorted) {
    const r = rows.get(t.name);
    if (r && r.root.isConnected && !r.root.classList.contains('dying')) frag.appendChild(r.root);
  }
  list.appendChild(frag);
  if (reduce) return;

  const newTops = new Map<string, number>();
  for (const t of sorted) {
    const r = rows.get(t.name);
    if (r?.root.isConnected) newTops.set(t.name, r.root.getBoundingClientRect().top);
  }

  for (const t of sorted) {
    const r = rows.get(t.name);
    if (!r?.root.isConnected || r.root.classList.contains('dying')) continue;
    const o = oldTops.get(t.name);
    const n = newTops.get(t.name);
    if (o === undefined || n === undefined) continue;
    const d = o - n;
    if (d === 0) {
      r.root.classList.remove('step-up', 'step-down');
      continue;
    }
    r.root.classList.toggle('step-up', d > 0);
    r.root.classList.toggle('step-down', d < 0);
    r.flipAnim = r.root.animate(
      [{ transform: `translate3d(0,${d}px,0)` }, { transform: 'translate3d(0,0,0)' }],
      { duration: 460, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    );
    r.flipAnim.onfinish = () => {
      r.flipAnim = null;
      r.root.classList.remove('step-up', 'step-down');
    };
  }
}

export function syncStandings(
  rt: ArenaRuntime,
  onVote: (t: Tool, kind: VoteKind) => void,
): void {
  const list = el('list');
  if (!list) return;
  const sorted = sortAlive([...rt.tools.values()]);

  if (list.children.length === 0) {
    rows.clear();
    const frag = document.createDocumentFragment();
    for (const t of sorted) frag.appendChild(buildRow(rt, t, onVote));
    list.appendChild(frag);
  } else {
    const active = new Set(sorted.map((t) => t.name));
    for (const [name, r] of [...rows]) {
      if (!active.has(name)) {
        if (r.root.isConnected) r.root.remove();
        rows.delete(name);
      }
    }
    for (const t of sorted) {
      const r = rows.get(t.name);
      if (!r || !r.root.isConnected) list.appendChild(buildRow(rt, t, onVote));
      else paintRow(rt, t);
    }
  }

  reorder(rt);
  renderGrave(rt);
  renderStats(rt);
  updateHeaderFrom(rt);
  renderIcons();
}

export function updateHeaderFrom(rt: ArenaRuntime): void {
  const d = `DAY ${String(rt.day).padStart(2, '0')}`;
  const hDay = el('hDay');
  if (hDay) hDay.textContent = d;
  const heroDay = el('heroDay');
  if (heroDay) heroDay.innerHTML = `<b>${d}</b> — THE ARENA IS OPEN`;
  const uName = el('uName');
  if (uName) uName.textContent = rt.player.user;
  updateMeta(rt);
  const dots = el('ammoDots')?.children ?? [];
  for (let i = 0; i < 5; i++) dots[i]?.classList.toggle('on', i < rt.player.ammo);
  const hearts = el('heartDots')?.children ?? [];
  for (let i = 0; i < 5; i++) hearts[i]?.classList.toggle('on', i < rt.player.ammo);
  el('ammoWrap')?.classList.toggle('low', rt.player.ammo <= 1);
}

// Local import dodge: board needs rank title without pulling store twice.
import { rankForXp as xpTitle } from '../state/store.ts';

export function updateMeta(rt: ArenaRuntime): void {
  const m = el('uMeta');
  if (m) m.textContent = `${xpTitle(rt.player.xp)} · STREAK ${rt.player.streak}`;
}

export function rankFlash(title: string): void {
  const t = el('rankTxt');
  if (t) t.textContent = `RANK UP // ${title}`;
  const s = el('rankSub');
  if (s) s.textContent = 'NEW ARENA CLEARANCE GRANTED';
  flash('rankFlash');
}
