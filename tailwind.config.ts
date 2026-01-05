import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        'void-black': '#000000',
        'void-gray': '#0A0A0A',
        'void-border': '#1F1F1F',
        'tech-green': '#00FF41',
        
        // Rarity Tiers
        'rank-dust': '#4A4A4A', // Gris oscuro / Visual approx for opacity representation
        'rank-common': '#FFFFFF', // Blanco Mate
        'rank-uncommon': '#00D1FF', // Cian Neón
        'rank-rare': '#BC13FE', // Violeta Eléctrico
        'rank-legendary': '#FFD700', // Oro Líquido
      },
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;