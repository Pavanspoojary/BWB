// Shared DOM primitives: element lookup, icons, toasts, ticker.

export const el = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

export function must<T extends HTMLElement>(id: string): T {
  const n = el<T>(id);
  if (!n) throw new Error(`missing #${id}`);
  return n;
}

export const wait = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const SVGS: Record<string, string> = {
  hourglass:
    '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>',
  eye: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:
    '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',
  volume2:
    '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
  volumeX:
    '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>',
  skull:
    '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>',
  heartPulse:
    '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>',
  rip: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V10a6 6 0 0 1 12 0v12"/><path d="M4 22h16"/><path d="M12 7v6"/><path d="M9.5 10h5"/></svg>',
  plus: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
};

export function renderIcons(root: ParentNode = document): void {
  root.querySelectorAll('[data-ico]').forEach((node) => {
    const k = (node as HTMLElement).dataset.ico;
    if (k && SVGS[k]) node.innerHTML = SVGS[k];
  });
}

export function toast(msg: string, kind: 'hot' | 'bone' = 'hot'): void {
  const box = el('toasts');
  if (!box) return;
  const d = document.createElement('div');
  d.className = `toast${kind === 'bone' ? ' bone' : ''}`;
  d.textContent = msg;
  box.appendChild(d);
  setTimeout(() => {
    d.classList.add('out');
    setTimeout(() => d.remove(), 350);
  }, 3800);
}

// ---- ticker ----

const tickQueue: string[] = [];

export function logTick(m: string): void {
  tickQueue.push(m);
  if (tickQueue.length > 30) tickQueue.shift();
}

export function flushTick(items?: string[]): void {
  const t1 = el('t1');
  const t2 = el('t2');
  if (!t1 || !t2) return;
  const src = (items?.length ? items : tickQueue).slice(-16);
  const txt = `${src.join('  ///  ')}  ///  `;
  t1.textContent = txt;
  t2.textContent = txt;
  tickQueue.length = 0;
}

export function initTicker(): void {
  el('tickTrack')?.addEventListener('animationiteration', () => flushTick());
}

export function shakeScreen(): void {
  if (prefersReducedMotion()) return;
  document.body.classList.remove('shaking');
  void document.body.offsetWidth;
  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 420);
}

export function flash(id: 'cullFlash' | 'rankFlash'): void {
  const n = el(id);
  if (!n) return;
  n.classList.remove('on');
  void n.offsetWidth;
  n.classList.add('on');
}

export function armFlashCleanup(): void {
  (['cullFlash', 'rankFlash'] as const).forEach((id) =>
    el(id)?.addEventListener('animationend', () => el(id)?.classList.remove('on')),
  );
}
