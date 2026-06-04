import { Gamepad2, Trophy, Eye, Clock, Coins, Info, Loader2 } from 'lucide-react';
import { Flex, Grid, Box } from "@/components/ui/layout";

function formatWatchTime(seconds) {
  const s = Number(seconds) || 0;
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM ? `${h}h ${remM}m` : `${h}h`;
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Flex direction="col" className="rounded-xl border border-border bg-card p-4 gap-3">
      <Flex align="center" justify="center" className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20">
        <Icon className="w-4 h-4 text-primary" />
      </Flex>
      <Flex direction="col" className="gap-0.5">
        <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </Flex>
    </Flex>
  );
}

export default function UserOverview({ user }) {
  if (!user) {
    return (
      <Flex align="center" justify="center" className="py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Flex>
    );
  }

  const stats = user.stats || {};

  return (
    <Flex direction="col" className="gap-6">
      <Flex direction="col" className="gap-1">
        <h2 className="text-lg font-semibold text-foreground">
          Welcome back, {user.name || 'Player'}
        </h2>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </Flex>

      {/* Coins balance */}
      <Box className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6">
        <Flex align="center" justify="between" className="gap-4 flex-wrap">
          <Flex direction="col" className="gap-1">
            <span className="text-xs uppercase tracking-widest text-amber-500/80 font-medium">
              Total Coins Available
            </span>
            <Flex align="center" className="gap-2">
              <Coins className="w-7 h-7 text-amber-500" />
              <span className="text-4xl font-black text-foreground tabular-nums">
                {(user.coins || 0).toLocaleString()}
              </span>
            </Flex>
          </Flex>
          <span className="text-xs text-muted-foreground max-w-xs">
            Spend coins in the <span className="text-foreground font-medium">Rewards</span> section to redeem coupons from our brand partners.
          </span>
        </Flex>
      </Box>

      {/* Game stats */}
      <Flex direction="col" className="gap-3">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
          Game Stats
        </span>
        <Grid gap={4} className="w-full grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Gamepad2} label="Total Matches Played" value={(stats.matchesPlayed || 0).toLocaleString()} />
          <StatCard icon={Trophy}   label="Total Matches Won"    value={(stats.matchesWon || 0).toLocaleString()} />
          <StatCard icon={Eye}      label="Total Ad Views"       value={(stats.adViews || 0).toLocaleString()} />
          <StatCard icon={Clock}    label="Total Ad Watch Time"  value={formatWatchTime(stats.adWatchTime)} />
        </Grid>
      </Flex>

      {/* Optional data */}
      {user.optionalData && (
        <Box className="rounded-xl border border-border bg-card p-4">
          <Flex direction="col" className="gap-2">
            <Flex align="center" className="gap-2">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Additional Info</span>
            </Flex>
            <span className="text-sm text-foreground whitespace-pre-wrap">{user.optionalData}</span>
          </Flex>
        </Box>
      )}

      <span className="text-[11px] text-muted-foreground">
        Stats and coins are placeholder values for now — they'll sync live from your game account once linked.
      </span>
    </Flex>
  );
}
