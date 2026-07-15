import { Loader2, Link2, Swords, ShieldCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flex, Grid, Box } from '@/components/ui/layout';
import { MINI_STAT_FIELDS, MINI_DERIVED_FIELDS, hasMiniStat } from '@/lib/mini/stats';
import { toDate } from '@/lib/mini/players';
import MiniRecentMatches from './MiniRecentMatches';

function StatTile({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <Flex align="center" className="gap-3">
          <Flex align="center" justify="center" className="w-9 h-9 rounded-md bg-primary/10 border border-primary/25 shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </Flex>
          <Flex direction="col" className="gap-0.5 min-w-0">
            <span className="font-display text-lg font-bold text-foreground leading-none tabular-nums truncate">
              {value}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground leading-none">
              {label}
            </span>
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}

// MINI overview: identity + presence + season rank + badges + combat stats,
// all live from the game-owned `SENA Mini/players/data` record joined by the
// signed-in Google email. `player`: undefined = loading, null = unlinked.
export default function MiniOverview({ player, gameVersion, matches }) {
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
                Sign in to <span className="text-foreground font-medium">SENA MINI</span> on your
                device with this same Google account. Your stats, rank and badges will appear here
                automatically — no extra steps.
              </p>
            </Flex>
          </Flex>
        </CardContent>
      </Card>
    );
  }

  const stats = player.stats || {};
  const lastLogin = toDate(player.lastLogin);
  const seasonRank = player.currentSeasonRank && player.currentSeasonRank !== 'None'
    ? player.currentSeasonRank
    : null;

  return (
    <Flex direction="col" className="gap-6">

      {/* Identity header */}
      <Card>
        <CardContent className="p-6">
          <Flex align="center" className="gap-5 flex-wrap">
            <Avatar className="w-16 h-16 border border-primary/30">
              {player.avatarUrl ? <AvatarImage src={player.avatarUrl} alt={player.name} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {(player.name || '??').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Flex direction="col" className="gap-1.5 min-w-0 flex-1">
              <Flex align="center" className="gap-2.5 flex-wrap">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-foreground truncate">
                  {player.name || 'Player'}
                </h2>
                <Badge
                  variant={player.isOnline ? 'default' : 'secondary'}
                  className="font-display text-[10px] uppercase tracking-widest"
                >
                  {player.isInMatch ? 'In Match' : player.isOnline ? 'Online' : 'Offline'}
                </Badge>
              </Flex>

              <Flex align="center" className="gap-4 flex-wrap">
                <Flex align="center" className="gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Season rank: <span className="text-foreground font-medium">{seasonRank || 'Unranked'}</span>
                  </span>
                </Flex>
                {lastLogin && (
                  <Flex align="center" className="gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Last seen {lastLogin.toLocaleDateString()} {lastLogin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Flex>
                )}
              </Flex>

              {Array.isArray(player.badges) && player.badges.length > 0 && (
                <Flex className="gap-1.5 flex-wrap mt-1">
                  {player.badges.filter((b) => b && b !== 'None').map((b) => (
                    <Badge key={b} variant="outline" className="text-[10px] uppercase tracking-wide border-primary/30 text-primary">
                      {b}
                    </Badge>
                  ))}
                </Flex>
              )}
            </Flex>
          </Flex>
        </CardContent>
      </Card>

      {/* Combat stats */}
      <Flex direction="col" className="gap-3">
        <Flex align="center" className="gap-2">
          <Swords className="w-4 h-4 text-primary" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
            // Combat Record
          </span>
        </Flex>
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
        {Object.keys(stats).length === 0 && (
          <p className="text-xs text-muted-foreground">
            No matches recorded yet — stats appear after your first game.
          </p>
        )}
      </Flex>

      {/* Recent matches (live matchHistory — hidden until matches exist) */}
      <MiniRecentMatches matches={matches} />

      {/* Patch notes */}
      {gameVersion && (
        <Card>
          <CardHeader className="pb-2">
            <Flex align="center" justify="between">
              <CardTitle className="text-sm font-display uppercase tracking-wide">
                Latest update
              </CardTitle>
              <Badge variant="secondary" className="font-display text-[10px] tabular-nums">
                v{gameVersion.latestVersion_Publishing ?? gameVersion.latestVersion_Testing ?? '—'}
              </Badge>
            </Flex>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{gameVersion.patchNotes}</p>
          </CardContent>
        </Card>
      )}

      <Box className="text-[11px] text-muted-foreground">
        Stats sync live from SENA MINI. Wallet & missions arrive in a future update.
      </Box>
    </Flex>
  );
}
