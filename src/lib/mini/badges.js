import { Award, Crown, Handshake, Users, Sparkles, Brain, Crosshair, Star } from 'lucide-react';

// Badge names come from the game as bare strings on the player doc's `badges`
// array (contract v1.0 §1.1) — e.g. ["MVP","Sharpshooter","Strategic"]. The game
// ships NO description or criteria for them.
//
// This map is website-owned and purely cosmetic: name -> icon. It deliberately
// carries no "how you earn it" text, because only the game team knows the real
// criteria and inventing one here would put fiction in a live section. If the
// game team publishes criteria, add them as a `detail` field and render it.
const ICONS = {
  MVP: Crown,
  Sharpshooter: Crosshair,
  Strategic: Brain,
  AllRounder: Sparkles,
  Friendly: Handshake,
  BestPal: Users,
  Cool: Award,
};

export const badgeIcon = (name) => ICONS[name] ?? Star;

// "None" is the game's explicit empty marker (contract §1.1); treat it as absent.
export const realBadges = (badges) =>
  Array.isArray(badges) ? badges.filter((b) => b && b !== 'None') : [];
