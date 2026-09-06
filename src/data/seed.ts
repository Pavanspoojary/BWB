import type { DeadEntry, Tool } from '../types.ts';

function tool(
  name: string,
  category: string,
  blurb: string,
  hp: number,
): Tool {
  return { id: name, name, category, blurb, hp, dead: false };
}

/** The ~15 seeded combatants. Mirrors the single-file fallback roster. */
export const SEED_TOOLS: Tool[] = [
  tool('SUPABASE', 'DATABASE', 'The Postgres open-source platform', 85),
  tool('GITHUB', 'FORGE', 'Where software gets shipped and code lives', 84),
  tool('RAYCAST', 'LAUNCHER', 'Keyboard-first productivity weapon', 82),
  tool('VITE', 'BUILDTOOL', 'Instant HMR blazing frontend dev server', 80),
  tool('VERCEL', 'INFRA', 'Frontend cloud deploy in milliseconds', 78),
  tool('LINEAR', 'TRACKER', 'High-velocity issue tracking for teams', 74),
  tool('FIGMA', 'DESIGN', 'Collaborative UI interface forge', 73),
  tool('BUN', 'RUNTIME', 'Incredible speed all-in-one JS toolkit', 71),
  tool('NEOVIM', 'EDITOR', 'Hyperextensible Vim-based text editor', 68),
  tool('TAILWIND', 'CSS', 'Utility-first rapid styling engine', 66),
  tool('OBSIDIAN', 'NOTES', 'Second brain connected markdown knowledge base', 65),
  tool('HOMEBREW', 'PKGMGR', 'The missing package manager for macOS', 62),
  tool('DOCKER', 'CONTAINERS', 'Standard container runtime engine', 59),
  tool('NOTION', 'WORKSPACE', 'All-in-one workspace and docs system', 52),
  tool('POSTMAN', 'API', 'The legacy API platform under siege', 48),
];

/** The 8 hidden challengers for offline mode / DB seeding. */
export const SEALED_POOL: Array<Pick<Tool, 'name' | 'category' | 'blurb'>> = [
  { name: 'ZED', category: 'EDITOR', blurb: 'Blazing multiplayer code editor' },
  { name: 'HTMX', category: 'FRAMEWORK', blurb: 'Hypermedia-driven interactivity' },
  { name: 'SUPERMAVEN', category: 'AI', blurb: 'Fast ghost-text code intelligence' },
  { name: 'TURSO', category: 'DATABASE', blurb: 'Edge SQLite that replicates everywhere' },
  { name: 'BIOME', category: 'DEVTOOL', blurb: 'One binary to format and lint web code' },
  { name: 'SST', category: 'INFRA', blurb: 'Full-stack AWS ion engine' },
  { name: 'EXCALIDRAW', category: 'DESIGN', blurb: 'Hand-drawn whiteboard diagrams' },
  { name: 'RIPGREP', category: 'CLI', blurb: 'Absurdly fast recursive search' },
];

export const SEED_DEAD: DeadEntry[] = [
  {
    n: 'INTERNET EXPLORER',
    c: 'BROWSER',
    by: 'THE MARCH OF TIME',
    day: 1,
    ep: 'It rendered once. It will never render again.',
  },
  {
    n: 'FLASH',
    c: 'PLUGIN',
    by: 'STEVE JOBS',
    day: 1,
    ep: 'Security nightmare laid to rest.',
  },
];

export const BOTS = [
  'VOIDWALKER',
  'NULLPOINTER',
  'SEGFAULT',
  'GLITCHMAMA',
  'OOM_KILLER',
  'DARKSCRUM',
  'RUBBERDUCK',
  'STACKSMASH',
  'HEISENBUG',
  'LINTERLORD',
  'CRONJOB',
  'KERNEL_PANIC',
] as const;

export function randomBot(): string {
  const b = BOTS[Math.floor(Math.random() * BOTS.length)];
  return `${b}-${100 + Math.floor(Math.random() * 900)}`;
}

export function randomUser(): string {
  return `ANON-${100 + Math.floor(Math.random() * 900)}`;
}
