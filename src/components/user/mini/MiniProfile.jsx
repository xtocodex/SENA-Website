import { Loader2, Link2, User, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flex, Grid } from '@/components/ui/layout';
import { toDate } from '@/lib/mini/players';
import { badgeIcon, realBadges } from '@/lib/mini/badges';

// LIVE section — identity, rank and badges straight from the game-owned player
// doc (contract v1.0 §1.1).
//
// The prototype's Profile page carried a lot the game does not ship. Rather than
// fake it, these are ABSENT: username/handle, level, member-since (no doc has a
// creation date — only `lastLogin`), country, coins/points, equipped loadout and
// the activity timeline. Badges render name + icon only; the game ships no
// criteria text (see lib/mini/badges.js).

export default function MiniProfile({ player, matches }) {
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
                Google account and your profile will appear here.
              </p>
            </Flex>
          </Flex>
        </CardContent>
      </Card>
    );
  }

  const stats = player.stats || {};
  const badges = realBadges(player.badges);
  const lastLogin = toDate(player.lastLogin);
  const rank = player.currentSeasonRank && player.currentSeasonRank !== 'None' ? player.currentSeasonRank : null;
  const prevRank = player.previousSeasonRank && player.previousSeasonRank !== 'None' ? player.previousSeasonRank : null;

  const headline = [
    { label: 'kills',   value: Number(stats.totalKills) || 0 },
    { label: 'wins',    value: Number(stats.wins) || 0 },
    { label: 'matches', value: Number(stats.matchesPlayed) || 0 },
  ];

  return (
    <Flex direction="col" className="gap-4">
      <Flex align="center" className="gap-2">
        <User className="w-4 h-4 text-primary" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
          // Profile
        </span>
      </Flex>

      {/* Identity banner */}
      <Card>
        <CardContent className="p-6">
          <Flex align="center" className="gap-5 flex-wrap">
            <Avatar className="w-24 h-24 border border-primary/30">
              {player.avatarUrl ? <AvatarImage src={player.avatarUrl} alt={player.name} /> : null}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {(player.name || '??').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Flex direction="col" className="gap-2 min-w-0 flex-1">
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
                    Season rank: <span className="text-foreground font-medium">{rank || 'Unranked'}</span>
                    {prevRank && <span className="text-muted-foreground"> · was {prevRank}</span>}
                  </span>
                </Flex>
                {lastLogin && (
                  <Flex align="center" className="gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Last seen {lastLogin.toLocaleDateString()}
                    </span>
                  </Flex>
                )}
              </Flex>

              <Flex className="gap-5 flex-wrap mt-1">
                {headline.map((h) => (
                  <Flex key={h.label} align="baseline" className="gap-1.5">
                    <span className="font-display text-lg font-bold text-primary tabular-nums">
                      {h.value.toLocaleString()}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{h.label}</span>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          </Flex>
        </CardContent>
      </Card>

      <Grid className="grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Badges */}
        <Card>
          <CardContent className="p-5">
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
              Badges
            </span>
            {badges.length > 0 ? (
              <Grid className="grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
                {badges.map((b) => {
                  const Icon = badgeIcon(b);
                  return (
                    <Flex
                      key={b}
                      direction="col"
                      align="center"
                      className="gap-1.5 rounded-md border border-border bg-card p-3 text-center"
                    >
                      <Flex align="center" justify="center" className="w-9 h-9 rounded-md bg-primary/10 border border-primary/25">
                        <Icon className="w-4 h-4 text-primary" />
                      </Flex>
                      <span className="text-xs font-medium text-foreground leading-tight">{b}</span>
                    </Flex>
                  );
                })}
              </Grid>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">
                No badges earned yet — they appear here as you play.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account link */}
        <Card>
          <CardContent className="p-5">
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
              Linked account
            </span>
            <Flex direction="col" className="gap-3 mt-4">
              {[
                { k: 'Email', v: player.email || '—' },
                { k: 'Game ID', v: player.uidStr || String(player.uid ?? '—') },
                { k: 'Matches played', v: (Number(stats.matchesPlayed) || 0).toLocaleString() },
              ].map((r) => (
                <Flex key={r.k} align="center" justify="between" className="gap-4">
                  <span className="text-xs text-muted-foreground">{r.k}</span>
                  <span className="text-xs text-foreground font-medium truncate">{r.v}</span>
                </Flex>
              ))}
            </Flex>
            <p className="text-[11px] text-muted-foreground mt-4">
              Your profile is managed inside SENA MINI — edit it there and it updates here.
            </p>
          </CardContent>
        </Card>
      </Grid>
    </Flex>
  );
}
