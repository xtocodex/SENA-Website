import { Loader2, Link2, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Flex, Grid } from '@/components/ui/layout';
import { BarChart, Donut, LegendItem } from './Charts';
import MiniRecentMatches from './MiniRecentMatches';
import {
  killsPerDay, winLoss, MINI_STAT_FIELDS, MINI_DERIVED_FIELDS, hasMiniStat,
} from '@/lib/mini/stats';

// LIVE section — every figure derives from the locked contract (the player doc's
// `stats` map + the matchHistory subcollection). Nothing here is mocked.
//
// Two things the prototype's Statistics page had are deliberately ABSENT rather
// than faked, because the game does not ship the data:
//   · K/D            — needs `stats.deaths` (open contract request §4)
//   · Coins per match — needs an economy; none exists in the namespace
// The 7D/Season/All-time range chips are also gone: `stats` is lifetime-only,
// so a season window can't be computed. The chart's 7-day window is real
// (bucketed from matchHistory timestamps).

function StatTile({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Flex align="center" className="gap-3">
          <Flex align="center" justify="center" className="w-9 h-9 rounded-md bg-primary/10 border border-primary/25 shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </Flex>
          <Flex direction="col" className="gap-0.5 min-w-0">
            <span className="font-display text-lg font-bold text-foreground leading-none tabular-nums truncate">{value}</span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">{label}</span>
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}

export default function MiniStatistics({ player, matches }) {
  if (player === undefined) {
    return (
      <Flex align="center" justify="center" className="py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Flex>
    );
  }

  if (player === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10">
          <Flex direction="col" align="center" className="gap-4 text-center">
            <Flex align="center" justify="center" className="w-12 h-12 rounded-md bg-primary/10 border border-primary/30">
              <Link2 className="w-6 h-6 text-primary" />
            </Flex>
            <Flex direction="col" className="gap-1.5 max-w-md">
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-foreground">
                Link your game account
              </h3>
              <p className="text-sm text-muted-foreground">
                Sign in to <span className="text-foreground font-medium">SENA MINI</span> with this same
                Google account and your statistics will appear here.
              </p>
            </Flex>
          </Flex>
        </CardContent>
      </Card>
    );
  }

  const stats = player.stats || {};
  const { wins, losses, played } = winLoss(stats);
  const winRate = played > 0 ? (wins / played) * 100 : null;
  const perDay = killsPerDay(matches);
  const hasDayData = perDay.some((d) => d.value > 0);

  return (
    <Flex direction="col" className="gap-4">
      <Flex align="center" className="gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
          // Statistics
        </span>
      </Flex>

      <p className="text-xs text-muted-foreground -mt-1">
        Lifetime combat performance across {played.toLocaleString()} match{played === 1 ? '' : 'es'}.
      </p>

      {/* Statistics owns the full stat set — Overview shows only a headline four. */}
      <Grid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {MINI_STAT_FIELDS.filter((f) => hasMiniStat(stats, f.key)).map((f) => (
          <StatTile key={f.key} icon={f.icon} label={f.label} value={f.format(stats[f.key])} />
        ))}
        {MINI_DERIVED_FIELDS.map((f) => {
          const v = f.compute(stats);
          return v == null ? null : (
            <StatTile key={f.key} icon={f.icon} label={f.label} value={f.format(v)} />
          );
        })}
      </Grid>

      <Grid className="grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-5">
            <Flex align="center" justify="between" className="mb-4 gap-2">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Kills per day
              </span>
              <span className="text-[11px] text-muted-foreground">Last 7 days</span>
            </Flex>
            {hasDayData ? (
              <BarChart data={perDay} valueLabel="kills" />
            ) : (
              <p className="py-10 text-center text-xs text-muted-foreground">
                No matches in the last 7 days.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <Flex align="center" justify="between" className="mb-4 gap-2">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Win / Loss
              </span>
              <span className="text-[11px] text-muted-foreground">Lifetime</span>
            </Flex>
            {played > 0 ? (
              <Flex align="center" className="gap-6 flex-wrap justify-center">
                <Donut
                  segments={[
                    { label: 'Wins',   value: wins,   className: 'stroke-primary' },
                    { label: 'Losses', value: losses, className: 'stroke-muted' },
                  ]}
                  center={`${Math.round(winRate)}%`}
                  sub="Win rate"
                />
                <Flex direction="col" className="gap-2.5 min-w-[140px]">
                  <LegendItem className="bg-primary" label="Wins"   value={wins.toLocaleString()} />
                  <LegendItem className="bg-muted"   label="Losses" value={losses.toLocaleString()} />
                  <LegendItem className="bg-primary/40" label="Matches" value={played.toLocaleString()} />
                </Flex>
              </Flex>
            ) : (
              <p className="py-10 text-center text-xs text-muted-foreground">
                No matches recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </Grid>

      <MiniRecentMatches matches={matches?.slice(0, 10)} />

      <p className="text-[11px] text-muted-foreground">
        K/D appears here once SENA MINI reports a deaths counter.
      </p>
    </Flex>
  );
}
