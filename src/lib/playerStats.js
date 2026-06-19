import { Award, Gamepad2, Trophy, Percent, Swords, Target, Crosshair, Skull } from 'lucide-react';

// --- formatters ---
const pct = (v) => `${Math.round(Number(v) || 0)}%`;
const dec2 = (v) => (Number(v) || 0).toFixed(2);

// Curated, editable list of game-stat fields to surface on the player dashboard.
// The player doc's schema is large and inconsistent, so this is the single
// source of truth for WHICH fields show. Order here = display order. Only fields
// actually present on the doc are rendered (see `hasStat`). To change what's
// shown, edit this array — nothing else.
export const PLAYER_STAT_FIELDS = [
  { key: 'level',          label: 'Level',      icon: Award },
  { key: 'matches_played', label: 'Matches',    icon: Gamepad2 },
  { key: 'match_won',      label: 'Wins',       icon: Trophy },
  { key: 'win_ratio',      label: 'Win %',      icon: Percent,   format: pct },
  { key: 'kd',             label: 'K/D',        icon: Swords,    format: dec2 },
  { key: 'accuracy',       label: 'Accuracy',   icon: Target,    format: pct },
  { key: 'headshot_ratio', label: 'Headshot %', icon: Crosshair, format: pct },
  { key: 'total_kill',     label: 'Kills',      icon: Skull },
];

// A field renders only when it exists and is non-null on the player doc.
export const hasStat = (player, key) => player != null && player[key] != null;

// Default formatter (locale number) for fields without an explicit `format`.
export const formatStat = (field, value) =>
  field.format ? field.format(value) : (Number(value) || 0).toLocaleString();
