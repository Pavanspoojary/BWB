import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pitch-black': '#050505',
        'panel-black': '#0d0d0d',
        'terminal-border': '#262626',
        'phosphor-green': '#22c55e',
        'warning-amber': '#f59e0b',
        'nuclear-red': '#ef4444',
        'terminal-cyan': '#06b6d4',
        terminal: {
          pitch: '#050505',
          panel: '#0d0d0d',
          border: '#262626',
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#ef4444',
          cyan: '#06b6d4',
        },
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px rgba(34, 197, 94, 0.5)',
        'brutal-green': '4px 4px 0px 0px #22c55e',
        'brutal-amber': '4px 4px 0px 0px #f59e0b',
        'brutal-red': '4px 4px 0px 0px #ef4444',
        'brutal-cyan': '4px 4px 0px 0px #06b6d4',
        'brutal-border': '4px 4px 0px 0px #262626',
        'brutal-dark': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        'brutal-white': '4px 4px 0px 0px #ffffff',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [typography],
};
