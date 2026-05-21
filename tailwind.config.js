/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        void: '#07080f',
        surface: { DEFAULT: '#0f1021', 2: '#151628', 3: '#1d1e32', 4: '#25263e' },
        rim: { DEFAULT: '#252540', bright: '#3d3d60', faint: '#17172b' },
        ghost: { DEFAULT: '#e2e0f0', muted: '#8785a8', faint: '#504f6a' },
        accent: {
          DEFAULT: '#8b5cf6',
          light:   '#a78bfa',
          dim:     '#6d28d9',
          muted:   'rgba(139,92,246,0.14)',
          glow:    'rgba(139,92,246,0.35)',
        },
        teal: {
          DEFAULT: '#14b8a6',
          light:   '#5eead4',
          muted:   'rgba(20,184,166,0.14)',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(139,92,246,0.25)',
        'glow':    '0 0 24px rgba(139,92,246,0.35)',
        'glow-teal': '0 0 24px rgba(20,184,166,0.35)',
      },
    },
  },
  plugins: [],
}