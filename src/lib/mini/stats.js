import { Trophy, Gamepad2, Skull, Flame, HeartPulse, Medal, Timer, Percent, Crosshair, HeartHandshake, Zap, Target } from 'lucide-react';

// Curated stat fields for the SENA MINI player dashboard (mirrors the pattern
// of lib/playerStats.js used by MAX). Values live in the game doc's `stats`
// map: { wins, matchesPlayed, totalKills, totalDamage, totalHealed,
// bestPlacement, totalSurvivalSec }. Derived fields compute from that map.
// Order here = display order; fields absent on the doc are skipped.

const num = (v) => Math.round(Number(v) || 0).toLocaleString();
const pct = (v) => `${Math.round(Number(v) || 0)}%`;
const hrs = (sec) => {
  const h = (Number(sec) || 0) / 3600;
  return h >= 10 ? `${Math.round(h)}h` : `${h.toFixed(1)}h`;
};
const placement = (v) => (Number(v) > 0 ? `#${Math.round(Number(v))}` : '—');

// LOCKED SCHEMA (contract v1.0, 2026-07-15 — see SENA_MINI_SCHEMA_CONTRACT.md
// in the workspace root): these keys match the game's `stats` map exactly.
// The game team must not rename/remove them; additions require prior notice.
export const MINI_STAT_FIELDS = [
  { key: 'wins',             label: 'Wins',        icon: Trophy,         format: num },
  { key: 'matchesPlayed',    label: 'Matches',     icon: Gamepad2,       format: num },
  { key: 'totalKills',       label: 'Kills',       icon: Skull,          format: num },
  { key: 'headshots',        label: 'Headshots',   icon: Target,         format: num },
  { key: 'knockdowns',       label: 'Knockdowns',  icon: Zap,            format: num },
  { key: 'revives',          label: 'Revives',     icon: HeartHandshake, format: num },
  { key: 'totalDamage',      label: 'Damage',      icon: Flame,          format: num },
  { key: 'totalHealed',      label: 'Healed',      icon: HeartPulse,     format: num },
  { key: 'bestPlacement',    label: 'Best Place',  icon: Medal,          format: placement },
  { key: 'totalSurvivalSec', label: 'Survival',    icon: Timer,          format: hrs },
];

export const MINI_DERIVED_FIELDS = [
  {
    key: 'winRate',
    label: 'Win %',
    icon: Percent,
    compute: (s) => (s.matchesPlayed > 0 ? (s.wins / s.matchesPlayed) * 100 : null),
    format: pct,
  },
  {
    key: 'avgKills',
    label: 'Kills / Match',
    icon: Crosshair,
    compute: (s) => (s.matchesPlayed > 0 ? s.totalKills / s.matchesPlayed : null),
    format: (v) => (Number(v) || 0).toFixed(1),
  },
];

export const hasMiniStat = (stats, key) => stats != null && stats[key] != null;
