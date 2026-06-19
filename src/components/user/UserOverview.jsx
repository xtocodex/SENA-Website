import { Coins, Info, Loader2, Crosshair, ChevronRight, ShieldCheck, Link2 } from 'lucide-react';
import { Flex, Grid, Box } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PLAYER_STAT_FIELDS, hasStat, formatStat } from "@/lib/playerStats";

function initialsOf(name, email) {
  if (name) return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (email || '?').slice(0, 2).toUpperCase();
}

// PUBG-flavored rank tiers, derived from total matches won (placeholder logic).
const RANKS = [
  { name: 'Bronze',    min: 0 },
  { name: 'Silver',    min: 10 },
  { name: 'Gold',      min: 30 },
  { name: 'Platinum',  min: 75 },
  { name: 'Diamond',   min: 150 },
  { name: 'Ace',       min: 300 },
  { name: 'Conqueror', min: 600 },
];
function rankFor(won) {
  let r = RANKS[0];
  for (const tier of RANKS) if (won >= tier.min) r = tier;
  return r;
}

// Win rate: prefer the game's own win_ratio field, else derive from won/played.
function winRateOf(player) {
  if (player?.win_ratio != null) return Math.max(0, Math.min(100, Math.round(Number(player.win_ratio))));
  const played = Number(player?.matches_played) || 0;
  const won = Number(player?.match_won) || 0;
  return played > 0 ? Math.round((won / played) * 100) : 0;
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <Flex
      direction="col"
      className="hud-corners group relative overflow-hidden rounded-md border border-border bg-card p-4 gap-3 transition-colors duration-200 hover:border-primary/40 hover:bg-accent/40"
    >
      <div aria-hidden="true" className="hud-stripes absolute inset-x-0 top-0 h-[3px] opacity-50 group-hover:opacity-100 transition-opacity" />
      <Flex align="center" justify="between" className="gap-2">
        <Flex
          align="center"
          justify="center"
          className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 transition-colors duration-200 group-hover:bg-primary/20"
        >
          <Icon className="w-4 h-4 text-primary" />
        </Flex>
      </Flex>
      <Flex direction="col" className="gap-1">
        <span className="font-display text-3xl font-bold text-foreground tabular-nums leading-none">{value}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-display">{label}</span>
      </Flex>
    </Flex>
  );
}

function WinRateRing({ value }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 80 80" className="w-28 h-28 -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          className="ring-glow transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <Flex direction="col" align="center" justify="center" className="absolute inset-0">
        <span className="font-display text-3xl font-bold text-foreground tabular-nums leading-none text-glow">{pct}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">percent</span>
      </Flex>
    </div>
  );
}

// Shown when the signed-in player has no verified game account linked yet.
function LinkAccountPanel() {
  return (
    <Box className="hud-corners relative overflow-hidden rounded-lg border border-border bg-card">
      <div aria-hidden="true" className="hud-stripes absolute inset-x-0 top-0 h-1 opacity-50" />
      <Flex direction="col" align="center" justify="center" className="gap-3 text-center px-6 py-12">
        <Flex align="center" justify="center" className="w-12 h-12 rounded-md bg-primary/10 border border-primary/25">
          <Link2 className="w-5 h-5 text-primary" />
        </Flex>
        <h3 className="font-display text-base font-bold uppercase tracking-wide text-foreground">
          Link your game account
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Verify your email inside the game to link this account — your live stats and coins will appear here automatically.
        </p>
      </Flex>
    </Box>
  );
}

export default function UserOverview({ user, player, onNavigate }) {
  // Wait for the website profile (name / avatar / email).
  if (!user) {
    return (
      <Flex align="center" justify="center" className="py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Flex>
    );
  }

  const loadingPlayer = player === undefined; // subscription not resolved yet
  const linked = !!player;                    // verified game record found
  const coins = player?.coins ?? 0;
  const won = Number(player?.match_won) || 0;
  const lost = Math.max(0, (Number(player?.matches_played) || 0) - won);
  const winRate = winRateOf(player);
  const rank = linked ? rankFor(won) : null;
  const statFields = linked ? PLAYER_STAT_FIELDS.filter((f) => hasStat(player, f.key)) : [];

  return (
    <Flex direction="col" className="gap-5">
      {/* ===== Operator banner ===== */}
      <Box className="hud-corners relative overflow-hidden rounded-lg border border-border bg-card">
        <div aria-hidden="true" className="hud-stripes absolute inset-x-0 top-0 h-1 opacity-70" />
        <Flex align="center" justify="between" wrap="wrap" className="gap-4 p-5">
          <Flex align="center" className="gap-4 min-w-0">
            <div className="relative shrink-0">
              <Avatar className="w-14 h-14 rounded-md border-2 border-primary/50 hud-glow">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name || 'Player'} />}
                <AvatarFallback className="rounded-md bg-primary/10 text-primary font-display text-lg font-bold">
                  {initialsOf(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card bg-green-500 motion-reduce:animate-none animate-pulse" title="Online" />
            </div>
            <Flex direction="col" className="gap-1 min-w-0">
              <Flex align="center" className="gap-2 flex-wrap">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-foreground truncate">
                  {user.name || 'Player'}
                </h2>
                {rank && (
                  <span className="inline-flex items-center gap-1 rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-widest text-primary">
                    <ShieldCheck className="w-3 h-3" />
                    {rank.name}
                  </span>
                )}
              </Flex>
              <span className="text-xs text-muted-foreground truncate font-mono">{user.email}</span>
            </Flex>
          </Flex>

          <Flex align="center" className="gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-green-500/25 bg-green-500/10 px-2.5 py-1 text-[10px] font-display font-semibold uppercase tracking-widest text-green-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Combat Ready
            </span>
          </Flex>
        </Flex>
      </Box>

      {/* ===== Bento: coins vault + win rate ===== */}
      <Grid className="w-full grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Coins vault */}
        <Box className="hud-corners relative overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 lg:col-span-2 hud-glow">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
          <Flex direction="col" className="relative gap-5 h-full">
            <Flex direction="col" className="gap-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-primary/80 font-display font-semibold">
                // Coin Balance
              </span>
              <Flex align="center" className="gap-3">
                <Flex
                  align="center"
                  justify="center"
                  className="w-12 h-12 rounded-md bg-primary/15 border border-primary/30 shrink-0"
                >
                  <Coins className="w-6 h-6 text-primary" />
                </Flex>
                <span className="font-display text-5xl sm:text-6xl font-bold text-foreground tabular-nums leading-none text-glow">
                  {coins.toLocaleString()}
                </span>
              </Flex>
            </Flex>

            <Flex align="center" justify="between" wrap="wrap" className="gap-3 mt-auto pt-1">
              <span className="text-xs text-muted-foreground max-w-xs">
                Cash in your coins for supply drops &amp; coupons from our brand partners.
              </span>
              <Button
                className="gap-2 shrink-0 font-display font-semibold uppercase tracking-wider"
                onClick={() => onNavigate?.('rewards')}
              >
                Redeem Supplies
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Win rate (linked) or loading / locked */}
        <Flex direction="col" className="hud-corners relative overflow-hidden rounded-lg border border-border bg-card p-6 gap-3">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
            // Win Rate
          </span>
          <Flex align="center" justify="center" className="flex-1 py-1">
            {loadingPlayer ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : linked ? (
              <WinRateRing value={winRate} />
            ) : (
              <Flex direction="col" align="center" className="gap-1 text-center">
                <span className="font-display text-3xl font-bold text-muted-foreground leading-none">—</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">not linked</span>
              </Flex>
            )}
          </Flex>
          {linked && (
            <Flex align="center" justify="center" className="gap-3 text-[11px] font-display uppercase tracking-widest">
              <span className="text-green-500">{won.toLocaleString()} W</span>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">{lost.toLocaleString()} L</span>
            </Flex>
          )}
        </Flex>
      </Grid>

      {/* ===== Combat record ===== */}
      <Flex direction="col" className="gap-3">
        <Flex align="center" className="gap-2">
          <Crosshair className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
            Combat Record
          </span>
          <div className="h-px flex-1 bg-border" />
        </Flex>

        {loadingPlayer ? (
          <Flex align="center" justify="center" className="py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </Flex>
        ) : !linked ? (
          <LinkAccountPanel />
        ) : statFields.length > 0 ? (
          <Grid gap={4} className="w-full grid-cols-2 lg:grid-cols-4">
            {statFields.map((f) => (
              <StatTile key={f.key} icon={f.icon} label={f.label} value={formatStat(f, player[f.key])} />
            ))}
          </Grid>
        ) : (
          <Box className="hud-corners rounded-md border border-border bg-card p-6">
            <span className="text-sm text-muted-foreground">No combat stats reported yet — play a match to see your record here.</span>
          </Box>
        )}
      </Flex>

      {/* ===== Intel / optional data (website profile note) ===== */}
      {user.optionalData && (
        <Box className="hud-corners relative overflow-hidden rounded-md border border-border bg-card p-4">
          <Flex direction="col" className="gap-2">
            <Flex align="center" className="gap-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-display">Intel</span>
            </Flex>
            <span className="text-sm text-foreground whitespace-pre-wrap">{user.optionalData}</span>
          </Flex>
        </Box>
      )}

      <span className={cn("text-[11px] text-muted-foreground font-mono")}>
        // Live uplink — stats &amp; coins stream from your linked game account in real time.
      </span>
    </Flex>
  );
}
