import { unlockAudio } from '../audio/sfx.ts';
import type { ArenaRuntime } from '../state/store.ts';
import { el, renderIcons, toast } from './dom.ts';

export interface ChromeCtx {
  rt: ArenaRuntime;
  forceCull: (cause: string) => Promise<void>;
  reveal: () => Promise<void>;
  submit: (name: string, cat: string, blurb: string) => Promise<void>;
  restock: () => void;
  rerollUser: () => void;
  toggleMute: () => void;
  isCulling: () => boolean;
}

// ---- header controls ----

export function setupHeader(ctx: ChromeCtx): void {
  el('userChip')?.addEventListener('click', () => ctx.rerollUser());
  el('userChip')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      ctx.rerollUser();
    }
  });
  el('sndBtn')?.addEventListener('click', () => ctx.toggleMute());
  el('shareBtn')?.addEventListener('click', async () => {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: 'TOOL//ARENA — the bottom 3 die at midnight',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast('ARENA LINK COPIED — SPREAD THE CULL', 'bone');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast('ARENA LINK COPIED', 'bone');
      } catch {
        /* clipboard hostile */
      }
    }
  });
}

// ---- easter egg ----

export function setupEasterEgg(ctx: ChromeCtx): void {
  el('secretWord')?.addEventListener('click', () => ctx.restock());
  el('secretWord')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      ctx.restock();
    }
  });
  let buf = '';
  document.addEventListener('keydown', (e) => {
    if (e.key && e.key.length === 1) {
      buf = (buf + e.key.toLowerCase()).slice(-9);
      if (buf === 'bloodbath') {
        buf = '';
        ctx.restock();
      }
    }
  });
}

// ---- countdown clock ----

const TAU_ARC = 2 * Math.PI * 66;
let prevSecs = Infinity;

export function setupClock(ctx: ChromeCtx): void {
  const tick = (): void => {
    const now = new Date();
    const mid = new Date(now);
    mid.setHours(24, 0, 0, 0);
    const ms = mid.getTime() - now.getTime();
    const s = Math.floor(ms / 1000);
    const cd = el('cd');
    if (cd) {
      cd.textContent = `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(
        Math.floor((s % 3600) / 60),
      ).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    }
    const arc = el('ringArc') as unknown as SVGCircleElement | null;
    arc?.style.setProperty('stroke-dashoffset', ((TAU_ARC * ms) / 86_400_000).toFixed(1));
    if (ms < 3_600_000) {
      el('cd')?.classList.add('final');
      const lbl = el('cdLbl');
      if (lbl) lbl.textContent = 'FINAL HOUR';
    } else {
      el('cd')?.classList.remove('final');
      const lbl = el('cdLbl');
      if (lbl) lbl.textContent = 'UNTIL THE CULL';
    }
    if (prevSecs !== Infinity && s > prevSecs) {
      void ctx.forceCull('MIDNIGHT CULL');
    }
    prevSecs = s;
  };
  tick();
  setInterval(tick, 1000);
}

// ---- hold-to-cull ----

export function setupHoldCull(ctx: ChromeCtx): void {
  const btn = el<HTMLButtonElement>('forceCull');
  if (!btn) return;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let active = false;
  let done = false;

  btn.addEventListener('pointerdown', () => {
    if (ctx.isCulling()) return;
    active = true;
    done = false;
    btn.classList.add('holding');
    timer = setTimeout(() => {
      done = true;
      btn.classList.remove('holding');
      void ctx.forceCull(`THE CULL (forced by ${ctx.rt.player.user})`);
    }, 2000);
  });
  const end = (): void => {
    if (!active) return;
    btn.classList.remove('holding');
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!done) {
      toast('YOU FLINCHED. THE CULL DEMANDS COMMITMENT.', 'bone');
    }
    active = false;
  };
  (['pointerup', 'pointerleave', 'pointercancel'] as const).forEach((ev) =>
    btn.addEventListener(ev, end),
  );
}

// ---- mystery challenger ----

export function paintMysterySealed(name: string): void {
  const nm = el('mName');
  const note = el('mNote');
  const btn = el<HTMLButtonElement>('mBtn');
  if (!nm || !note || !btn) return;
  nm.textContent = name;
  nm.classList.add('sealed');
  note.textContent = 'SEALED CHALLENGER — REVEAL SUMMONS IT INTO ARENA AT 70 HP';
  btn.disabled = false;
  btn.innerHTML = '<span class="icon-wrap" data-ico="eye"></span>REVEAL — 1 PER DAY';
  renderIcons(btn);
}

export function paintMysteryRevealed(name: string): void {
  const nm = el('mName');
  const note = el('mNote');
  const btn = el<HTMLButtonElement>('mBtn');
  if (!nm || !note || !btn) return;
  nm.textContent = name;
  nm.classList.remove('sealed');
  note.textContent = "TODAY'S CHALLENGER SUMMONED — FIGHTING IN THE ARENA";
  btn.disabled = true;
  btn.innerHTML = '<span class="icon-wrap" data-ico="eyeOff"></span>SEALED UNTIL TOMORROW';
  renderIcons(btn);
}

export function paintMysteryDry(): void {
  const nm = el('mName');
  const note = el('mNote');
  const btn = el<HTMLButtonElement>('mBtn');
  if (!nm || !note || !btn) return;
  nm.textContent = 'NOTHING LEFT TO SUMMON';
  nm.classList.remove('sealed');
  note.textContent = 'THE CHALLENGER POOL IS DRY';
  btn.disabled = true;
  btn.innerHTML = '<span class="icon-wrap" data-ico="eyeOff"></span>POOL DRY';
  renderIcons(btn);
}

export function setupMystery(ctx: ChromeCtx): void {
  el<HTMLButtonElement>('mBtn')?.addEventListener('click', () => void ctx.reveal());
}

// ---- sacrifice modal ----

function openModal(): void {
  const m = el('submitModal');
  if (!m) return;
  m.style.display = 'flex';
  setTimeout(() => el('pName')?.focus(), 100);
}

function closeModal(): void {
  const m = el('submitModal');
  if (m) m.style.display = 'none';
}

export function setupSubmitModal(ctx: ChromeCtx): void {
  el('openSubmitBtn')?.addEventListener('click', openModal);
  el('bannerSubmitBtn')?.addEventListener('click', openModal);
  el('closeSubmitBtn')?.addEventListener('click', closeModal);
  el('cancelSubmitBtn')?.addEventListener('click', closeModal);
  el('submitModal')?.addEventListener('click', (e) => {
    if (e.target === el('submitModal')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && el('submitModal')?.style.display === 'flex') closeModal();
  });
  el('catChips')
    ?.querySelectorAll('.c-chip')
    .forEach((chip) => {
      (chip as HTMLElement).onclick = () => {
        el('catChips')
          ?.querySelectorAll('.c-chip')
          .forEach((c) => c.classList.remove('on'));
        chip.classList.add('on');
        const input = el<HTMLInputElement>('pCat');
        if (input) input.value = (chip as HTMLElement).dataset.cat ?? 'DEVTOOL';
      };
    });
  el('submitProductBtn')?.addEventListener('click', () => {
    const name = el<HTMLInputElement>('pName')?.value ?? '';
    const cat = el<HTMLInputElement>('pCat')?.value ?? 'DEVTOOL';
    const blurb = el<HTMLInputElement>('pBlurb')?.value ?? '';
    void ctx.submit(name, cat, blurb).then(() => {
      const n = el<HTMLInputElement>('pName');
      const b = el<HTMLInputElement>('pBlurb');
      if (n) n.value = '';
      if (b) b.value = '';
      closeModal();
    });
  });
}

// ---- boot sequence ----

export function setupBoot(isReturning: boolean): void {
  const boot = el('boot');
  const msg = el('bootMsg');
  if (!boot) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lines = [
    'establishing uplink…',
    'syncing graveyard…',
    'counting ammo…',
    'the cull is hungry…',
  ];
  let li = 0;
  const iv = setInterval(() => {
    li += 1;
    if (msg && lines[li]) msg.textContent = lines[li];
    if (li >= lines.length - 1) clearInterval(iv);
  }, 450);
  let gone = false;
  const dismiss = (): void => {
    if (gone) return;
    gone = true;
    clearInterval(iv);
    try {
      unlockAudio();
    } catch {
      /* ignore */
    }
    boot.classList.add('gone');
    setTimeout(() => boot.remove(), reduce ? 50 : 550);
  };
  boot.addEventListener('click', dismiss);
  boot.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dismiss();
    }
  });
  if (isReturning) setTimeout(dismiss, 3500);
}
