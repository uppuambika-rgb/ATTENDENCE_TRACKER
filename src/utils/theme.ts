import { AppTheme } from './authDatabase';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  badge: string;
  description: string;
  bgClass: string;
  cardBgClass: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  glowColor: string;
  cuteIcon: string;
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  kawaii_pastel: {
    id: 'kawaii_pastel',
    name: 'Cute & Aesthetic Dream',
    badge: 'Pastel Kawaii ✨',
    description: 'Soft lavender, bubblegum pink, and mint cyan cute aesthetic with playful vibes',
    bgClass: 'bg-[#0f0c1b] text-pink-50',
    cardBgClass: 'bg-[#181329]/90 border-pink-500/25 shadow-xl shadow-purple-950/30',
    accentText: 'text-pink-400',
    accentBg: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md shadow-pink-500/30',
    accentBorder: 'border-pink-500/40',
    glowColor: 'from-pink-500/10 via-purple-500/10 to-transparent',
    cuteIcon: '🌸',
  },
  cyber_obsidian: {
    id: 'cyber_obsidian',
    name: 'Cyber Midnight Neon',
    badge: 'Cyberpunk ⚡',
    description: 'Deep obsidian slate with electric cyan and indigo glowing telemetry',
    bgClass: 'bg-[#080C15] text-slate-100',
    cardBgClass: 'bg-[#0F172A]/90 border-slate-800 shadow-xl shadow-slate-950/40',
    accentText: 'text-cyan-400',
    accentBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30',
    accentBorder: 'border-cyan-500/40',
    glowColor: 'from-cyan-500/10 via-indigo-500/10 to-transparent',
    cuteIcon: '⚡',
  },
  matcha_latte: {
    id: 'matcha_latte',
    name: 'Matcha & Vanilla Tea',
    badge: 'Cozy Matcha 🍵',
    description: 'Calm herbal green, warm honey tea tones and study cafe aesthetics',
    bgClass: 'bg-[#0b1411] text-emerald-50',
    cardBgClass: 'bg-[#12211c]/90 border-emerald-500/25 shadow-xl shadow-emerald-950/30',
    accentText: 'text-emerald-400',
    accentBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30',
    accentBorder: 'border-emerald-500/40',
    glowColor: 'from-emerald-500/10 via-teal-500/10 to-transparent',
    cuteIcon: '🍵',
  },
  neon_sunset: {
    id: 'neon_sunset',
    name: 'Y2K Sunset Arcade',
    badge: 'Sunset Glow 🌅',
    description: 'Warm coral, gold, and violet sunset gradient with energetic campus vibes',
    bgClass: 'bg-[#150a12] text-amber-50',
    cardBgClass: 'bg-[#22101e]/90 border-rose-500/30 shadow-xl shadow-rose-950/30',
    accentText: 'text-amber-400',
    accentBg: 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/30',
    accentBorder: 'border-rose-500/40',
    glowColor: 'from-rose-500/10 via-amber-500/10 to-transparent',
    cuteIcon: '🌅',
  },
};
