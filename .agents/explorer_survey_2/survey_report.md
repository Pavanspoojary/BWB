# Technical Architecture Survey Report: builtwhilebroke.tech
**Explorer**: Explorer 2 (Astro 5 & Architecture Explorer)  
**Date**: 2026-09-12  
**Target Platform**: Astro 5 (Static SSG) + Tailwind CSS + Cloudflare Pages (Zero Runtime Cost)  
**Reference Document**: `/Users/pavanspoojary/Developer/builtwhilebroke/ORIGINAL_REQUEST.md`

---

## 1. Executive Summary

`builtwhilebroke.tech` is an irreverent, open-source documentation library cataloging radical architecture hacks that replace costly SaaS subscriptions with abused zero-dollar developer primitives.

To achieve **zero runtime hosting cost** with **sub-10ms global delivery** and **zero cold starts**, the site must be built as a pure static site generation (SSG) deployment on **Cloudflare Pages**.

### Key Architectural Findings & Decisions:
1. **Astro 5 Static Architecture**: Set `output: 'static'` in `astro.config.mjs`. **Do not include `@astrojs/cloudflare` server adapter**. Cloudflare Pages natively serves static files in `dist/` over its global CDN at $0/month with unlimited requests and bandwidth.
2. **Astro 5 Content Layer API**: Implement collection definition in `src/content.config.ts` using the new `glob` loader (`glob({ pattern: '**/*.{md,mdx}', base: './src/content/hacks' })`) and strict Zod schema validation matching all 8 frontmatter fields in R1. In Astro 5 pages, use `import { render } from 'astro:content'; const { Content } = await render(hack);` and `hack.id` for slug routing.
3. **Tailwind CSS Integration**: Use `@astrojs/tailwind@^6.0.2` with `tailwindcss@^3.4.17` and `@tailwindcss/typography@^0.5.16`. This provides rock-solid stability with Astro 5 and MDX prose formatting, avoiding the bleeding-edge module quirks of Tailwind v4 while enabling a custom high-contrast dark-mode-first brutalist terminal theme.
4. **Supabase Integration**: Structure `src/lib/supabase.ts` to initialize `@supabase/supabase-js` with graceful fallback cascade (`import.meta.env.PUBLIC_SUPABASE_URL` -> `import.meta.env.VITE_SUPABASE_URL` -> hardcoded URL `https://giyzluujybzqvyxwxfox.supabase.co`; and `PUBLIC_SUPABASE_ANON_KEY` / `PUBLIC_SUPABASE_PUBLISHABLE_KEY` -> `sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi`). Full TypeScript types generated from the live database schema.
5. **Diagram Rendering Strategy**: Adopt a **dual-track approach**: author crisp UTF-8 ASCII/box-drawing diagrams directly inside Markdown/MDX code blocks (zero JS runtime, 100% brutalist aesthetic, zero layout shift) accompanied by a lightweight dynamic client-side Mermaid initializer that enhances any `.mermaid` blocks into SVGs styled with our dark terminal color palette.

---

## 2. Astro 5 Static Architecture for Cloudflare Pages

### 2.1 The Zero-Runtime-Cost Static Hosting Model
Cloudflare Pages provides two primary deployment models:
1. **Cloudflare Pages Static (Recommended)**: Cloudflare ingests the compiled `dist/` directory and distributes static HTML, CSS, client JS, and images across its global edge network (300+ data centers).
   - **Cost**: $0.00 / month forever (free tier: unlimited requests, unlimited bandwidth, 500 builds/month).
   - **Performance**: 0ms cold start, TTFB < 15ms globally.
   - **Reliability**: No CPU limits (10ms free worker limit does not apply because no Worker executes for page hits).
2. **Cloudflare Pages Functions / SSR (`@astrojs/cloudflare`)**: Requires bundling a Cloudflare Worker that executes on every request.
   - Unnecessary for `builtwhilebroke.tech` because all hack content, calculator base values, and catalog metadata are known at build time.
   - Introduces edge runtime memory constraints, bundling issues with Node libraries, and invocation limits.

### 2.2 Astro 5 Configuration (`astro.config.mjs`)
In Astro 5, `output: 'static'` is the default, but explicitly declaring it communicates architectural intent.

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  site: 'https://builtwhilebroke.tech',
  build: {
    format: 'directory', // Generates /hacks/<slug>/index.html for clean URL routing
  },
  integrations: [
    tailwind({
      applyBaseStyles: false, // We control base styles via src/styles/global.css for brutalist CRT aesthetic
    }),
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
});
```

### 2.3 Cloudflare Pages Deployment Settings
- **Framework preset**: `Astro`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Node version**: `>= 20.0.0` (Environment variable `NODE_VERSION=20` or `.nvmrc`)

---

## 3. Astro 5 Content Collections & Schema Architecture

### 3.1 Content Layer API in Astro 5
Astro 5 introduced the unified **Content Layer API**:
- **Configuration location**: `src/content.config.ts` in project source root (replacing the Astro 4 legacy `src/content/config.ts`).
- **Data Loaders**: Collections utilize explicit loaders (`glob` from `astro/loaders`).
- **Entry Identifier**: Each entry has an `id` property (representing the relative file path without extension, e.g., `telegram-s3-bucket`).
- **Rendering**: Markdown/MDX entries are rendered via `import { render } from 'astro:content'; const { Content, headings } = await render(entry);`.

### 3.2 Frontmatter Schema (`src/content.config.ts`)
The schema enforces all constraints declared in `ORIGINAL_REQUEST.md`:

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const hacks = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hacks' }),
  schema: z.object({
    // R1: title: string
    title: z.string({ required_error: 'Title is required' }).min(3),

    // R1: replaces_saas: string (e.g., "AWS S3 + CloudFront")
    replaces_saas: z.string({ required_error: 'replaces_saas is required' }),

    // R1: estimated_monthly_savings: number (e.g., 45)
    estimated_monthly_savings: z.number({
      required_error: 'estimated_monthly_savings is required',
    }).nonnegative('Savings must be a positive number or 0'),

    // R1: category: enum ["Active Sacrilege", "Clean Loophole", "The Graveyard"]
    category: z.enum(['Active Sacrilege', 'Clean Loophole', 'The Graveyard'], {
      errorMap: () => ({
        message: 'Category must be "Active Sacrilege", "Clean Loophole", or "The Graveyard"',
      }),
    }),

    // R1: risk_level: enum ["Low", "TOS Gray Area", "Nuclear"]
    risk_level: z.enum(['Low', 'TOS Gray Area', 'Nuclear'], {
      errorMap: () => ({
        message: 'Risk level must be "Low", "TOS Gray Area", or "Nuclear"',
      }),
    }),

    // R1: primitives_abused: array of strings
    primitives_abused: z.array(z.string()).min(1, 'At least one primitive abused must be listed'),

    // R1: author_github: string
    author_github: z.string({ required_error: 'author_github is required' }),

    // R1: date_added: ISO date string
    date_added: z.string({ required_error: 'date_added is required' })
      .regex(
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
        'date_added must be an ISO format string (e.g., "2026-09-12" or "2026-09-12T00:00:00Z")'
      ),
  }),
});

export const collections = { hacks };
```

### 3.3 Dynamic Route Architecture (`src/pages/hacks/[slug].astro`)
```astro
---
// src/pages/hacks/[slug].astro
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import SinMeter from '../../components/SinMeter.astro';
import BrutalRealityCheck from '../../components/BrutalRealityCheck.astro';
import MermaidRenderer from '../../components/MermaidRenderer.astro';

export async function getStaticPaths() {
  const hacks = await getCollection('hacks');
  return hacks.map((hack) => {
    // In Astro 5 Content Layer with glob loader, id is the slug (e.g. "telegram-s3-bucket")
    const slug = hack.id.replace(/\.(md|mdx)$/, '');
    return {
      params: { slug },
      props: { hack },
    };
  });
}

const { hack } = Astro.props;
const { Content } = await render(hack);
---

<BaseLayout title={`${hack.data.title} | builtwhilebroke.tech`}>
  <article class="max-w-4xl mx-auto px-4 py-8 font-mono">
    <!-- Header with Sin Meter Badge -->
    <header class="border-2 border-terminal-border bg-terminal-surface p-6 shadow-brutal mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <span class="text-xs uppercase tracking-wider px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300">
          Replaces: <strong class="text-white">{hack.data.replaces_saas}</strong>
        </span>
        <SinMeter level={hack.data.risk_level} />
      </div>

      <h1 class="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
        {hack.data.title}
      </h1>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t border-zinc-800 pt-4 text-zinc-400">
        <div>
          <span class="block text-zinc-500">SAVINGS</span>
          <span class="text-emerald-400 font-bold text-base">${hack.data.estimated_monthly_savings}/mo</span>
        </div>
        <div>
          <span class="block text-zinc-500">CATEGORY</span>
          <span class="text-white font-semibold">{hack.data.category}</span>
        </div>
        <div>
          <span class="block text-zinc-500">AUTHOR</span>
          <a href={`https://github.com/${hack.data.author_github}`} target="_blank" rel="noreferrer" class="text-emerald-400 hover:underline">
            @{hack.data.author_github}
          </a>
        </div>
        <div>
          <span class="block text-zinc-500">ADDED</span>
          <span>{hack.data.date_added.slice(0, 10)}</span>
        </div>
      </div>
    </header>

    <!-- Content Prose Block with Syntax Highlighting -->
    <div class="prose prose-invert max-w-none prose-pre:border-2 prose-pre:border-zinc-800 prose-pre:bg-black prose-pre:shadow-brutal mb-12">
      <Content />
    </div>

    <!-- Client-side Mermaid enhancement if present -->
    <MermaidRenderer />
  </article>
</BaseLayout>
```

---

## 4. Tailwind CSS Configuration & Brutalist Terminal Design System

### 4.1 Tailwind Strategy: v3 with `@astrojs/tailwind` vs v4 with `@tailwindcss/vite`
| Dimension | Tailwind v3 + `@astrojs/tailwind` (Recommended) | Tailwind v4 + `@tailwindcss/vite` |
|---|---|---|
| **Astro 5 Stability** | 100% verified with `@astrojs/tailwind@6.0.2` | Bleeding edge; CSS module scoping edge cases |
| **Typography Plugin** | Native `@tailwindcss/typography` works out of the box | Requires new CSS-first `@plugin` syntax |
| **Design Tokens** | Clean declarative `tailwind.config.mjs` | `@theme` CSS variables block in global stylesheet |
| **Build Reliability** | Zero warnings, stable PostCSS pipeline | Potential Vite plugin ordering conflicts with MDX |

**Recommendation**: Use **Tailwind CSS v3 (`tailwindcss@^3.4.17`) with `@astrojs/tailwind@^6.0.2`** and `@tailwindcss/typography@^0.5.16`.

### 4.2 Terminal Brutalist Design Tokens
The design system reflects a hardware terminal / CRT monitor aesthetic:
- **Pitch Black Background**: `#050505` (`bg-terminal-bg`)
- **Card / Surface**: `#0d0e11` (`bg-terminal-surface`)
- **CRT Phosphor Green**: `#00ff66` / `#22c55e` (Primary brand accent, links, high savings)
- **TOS Warning Amber**: `#f59e0b` (TOS Gray Area badges, caution alerts)
- **Nuclear CRT Red**: `#ef4444` (Nuclear risk level, danger callouts)
- **Hard Offsets / Shadows**: `shadow-[4px_4px_0px_0px_#27272a]` (Brutalist box geometry)
- **Angular Sharp Edges**: `rounded-none` or `rounded-sm` across all cards, buttons, badges.

### 4.3 `tailwind.config.mjs`
```javascript
// tailwind.config.mjs
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        terminal: {
          bg: '#050505',
          surface: '#0e1014',
          card: '#14161d',
          border: '#27272a',
          'border-bright': '#3f3f46',
          green: '#22c55e',
          'green-bright': '#00ff66',
          amber: '#f59e0b',
          red: '#ef4444',
          cyan: '#06b6d4',
          muted: '#71717a',
        },
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #27272a',
        'brutal-green': '4px 4px 0px 0px #22c55e',
        'brutal-amber': '4px 4px 0px 0px #f59e0b',
        'brutal-red': '4px 4px 0px 0px #ef4444',
        'brutal-white': '4px 4px 0px 0px #ffffff',
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.zinc.300'),
            '--tw-prose-headings': theme('colors.zinc.50'),
            '--tw-prose-links': theme('colors.emerald.400'),
            '--tw-prose-bold': theme('colors.zinc.100'),
            '--tw-prose-code': theme('colors.emerald.300'),
            '--tw-prose-pre-bg': '#000000',
            '--tw-prose-pre-code': theme('colors.zinc.200'),
            '--tw-prose-quotes': theme('colors.zinc.200'),
            '--tw-prose-quote-borders': theme('colors.emerald.500'),
            '--tw-prose-hr': theme('colors.zinc.800'),
          },
        },
      }),
    },
  },
  plugins: [typography],
};
```

### 4.4 Global Terminal Base Styles (`src/styles/global.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
  }

  body {
    background-color: #050505;
    color: #f4f4f5;
    font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
    overflow-x: hidden;
  }

  /* Scanline CRT overlay effect (subtle) */
  body::before {
    content: " ";
    display: block;
    position: fixed;
    top: 0; left: 0; bottom: 0; right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
    background-size: 100% 4px;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.15;
  }

  /* Custom terminal scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #050505;
  }
  ::-webkit-scrollbar-thumb {
    background: #27272a;
    border: 1px solid #3f3f46;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #22c55e;
  }
}
```

---

## 5. Supabase Integration Architecture

### 5.1 Environment Variable Handling & Fallback Cascade
In Astro/Vite client builds, variables accessible in the browser must be prefixed with `PUBLIC_`.
However, `ORIGINAL_REQUEST.md` provides explicit project credentials:
- **URL**: `https://giyzluujybzqvyxwxfox.supabase.co`
- **Key**: `sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi`

To ensure 100% zero-configuration startup while allowing custom environment overrides:
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const FALLBACK_URL = 'https://giyzluujybzqvyxwxfox.supabase.co';
const FALLBACK_KEY = 'sb_publishable_7h-rq_hVl5FId2zrQfhUmQ_HzUy9Dxi';

export const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL)) ||
  (typeof process !== 'undefined' && process.env && (process.env.PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL)) ||
  FALLBACK_URL;

export const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && (
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )) ||
  (typeof process !== 'undefined' && process.env && (
    process.env.PUBLIC_SUPABASE_ANON_KEY ||
    process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY
  )) ||
  FALLBACK_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Health check utility to verify database connectivity.
 */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { count, error } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: `Connected to Supabase. Listings count: ${count ?? 0}` };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}
```

### 5.2 TypeScript Schema Generation
The Supabase project was directly inspected using the Supabase MCP tool. The existing database schema includes tables (`listings`, `inventory_slots`, `sponsorships`, `impression_telemetry`).
The generated TypeScript definition file (`src/types/database.types.ts`) exports the complete `Database` type structure, enabling type-safe client operations.

---

## 6. Diagram Rendering Strategy: ASCII vs Mermaid.js

### 6.1 Architectural Trade-Off Analysis
| Feature | UTF-8 ASCII / Box Drawing | Client-Side Mermaid.js |
|---|---|---|
| **Zero Runtime JS** | **Yes (0 KB JS)** | No (~1.5MB ESM bundle) |
| **Aesthetic Match** | **100% Terminal Brutalist** | High (SVG graph) |
| **Rendering Reliability** | 100% Guaranteed (Plain text) | Requires network/CDN |
| **No-JS / Screen Readers** | Fully accessible as text | Inaccessible if JS disabled |
| **Layout Shift** | 0px CLS (pre-allocated) | Possible FOUT during SVG render |
| **Interactivity** | Static text / selectable | Clickable SVG nodes |

### 6.2 Recommended Strategy: Dual-Track Architecture
1. **Primary Seed Diagrams: Formatted ASCII/Box-Drawing Blocks**:
   Each seed hack guide includes an architectural diagram drawn with UTF-8 box characters inside a fenced code block (`language: text` or `language: ascii`):
   ```text
   ┌──────────────┐     HTTP POST /upload      ┌─────────────────────────┐
   │ User Client  │ ─────────────────────────> │   Hono Reverse Proxy    │
   └──────────────┘                            │ (Splits file into 20MB) │
                                               └─────────────────────────┘
                                                           │
                                             sendDocument  ▼ (Telegram Bot API)
                                               ┌─────────────────────────┐
                                               │   Telegram Cloud CDN    │
                                               │ (Channel ID: -10012345) │
                                               └─────────────────────────┘
   ```
   Encapsulated in an `overflow-x-auto` terminal window container.

2. **Secondary Enhancement: Dynamic Mermaid Component (`MermaidRenderer.astro`)**:
   For any diagram written in ````mermaid`, a zero-overhead Astro component detects the diagram and dynamically imports Mermaid from a fast ESM CDN without adding to the initial page bundle:
   ```astro
   ---
   // src/components/MermaidRenderer.astro
   ---
   <script>
     async function initMermaid() {
       const mermaidElements = document.querySelectorAll('.mermaid, pre code.language-mermaid');
       if (mermaidElements.length === 0) return;

       const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');
       mermaid.initialize({
         startOnLoad: false,
         theme: 'dark',
         themeVariables: {
           darkMode: true,
           background: '#09090b',
           primaryColor: '#22c55e',
           lineColor: '#22c55e',
           textColor: '#f4f4f5',
           edgeLabelBackground: '#121215',
         },
       });

       mermaidElements.forEach(async (el, idx) => {
         const code = el.textContent || '';
         const container = document.createElement('div');
         container.className = 'my-6 p-4 bg-black border-2 border-zinc-800 shadow-brutal flex justify-center overflow-x-auto';
         const id = `mermaid-svg-${idx}`;
         try {
           const { svg } = await mermaid.render(id, code);
           container.innerHTML = svg;
           el.closest('pre')?.replaceWith(container) || el.replaceWith(container);
         } catch (e) {
           console.error('Mermaid render failure:', e);
         }
       });
     }

     if (document.readyState === 'loading') {
       document.addEventListener('DOMContentLoaded', initMermaid);
     } else {
       initMermaid();
     }
   </script>
   ```

This delivers the best of both worlds: zero-cost ASCII diagrams work everywhere out of the box, and Mermaid diagrams are progressively enhanced if used.

---

## 7. Complete Dependency Specification (`package.json`)

```json
{
  "name": "builtwhilebroke",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.10",
    "@astrojs/mdx": "^4.3.14",
    "@astrojs/tailwind": "^6.0.2",
    "@supabase/supabase-js": "^2.48.0",
    "astro": "^5.18.2",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.3"
  },
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.16"
  }
}
```

---

## 8. Summary of Architectural Contracts for Implementation Team

1. **Static Target**: `astro.config.mjs` must have `output: 'static'`, format `'directory'`, with zero server adapters.
2. **Schema Contract**: Content collections defined in `src/content.config.ts` using `glob({ pattern: '**/*.{md,mdx}', base: './src/content/hacks' })`. Frontmatter must strictly validate the 8 required fields via Zod.
3. **Template Routing**: `src/pages/hacks/[slug].astro` extracts `slug` via `hack.id.replace(/\.(md|mdx)$/, '')` and renders content with `const { Content } = await render(hack);`.
4. **Design Tokens**: Monospace fonts (`JetBrains Mono`, `Fira Code`), dark-mode first (`#050505`), high-contrast phosphor green (`#22c55e`), warning amber (`#f59e0b`), nuclear red (`#ef4444`), and hard brutalist shadows (`shadow-brutal`).
5. **Supabase Utility**: `src/lib/supabase.ts` exports `createClient<Database>` with resilient fallbacks and connection health check.
6. **Diagrams**: All seed hack articles feature UTF-8 ASCII diagrams in code blocks for zero-JS instant rendering, backed by `MermaidRenderer.astro` for client-side progressive enhancement.
