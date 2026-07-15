import { useEffect, useState } from 'react';
import { Loader2, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flex } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { subscribeMiniLeaderboard } from '@/lib/mini/players';

const winRate = (s) =>
  s?.matchesPlayed > 0 ? `${Math.round((s.wins / s.matchesPlayed) * 100)}%` : '—';

// Global MINI leaderboard, ranked by wins (game-wide, all linked + unlinked
// players — docs without stats are skipped by the query). The signed-in
// player's row is highlighted by email match.
export default function MiniLeaderboard({ ownEmail }) {
  const [players, setPlayers] = useState(undefined);

  useEffect(() => {
    const unsub = subscribeMiniLeaderboard(setPlayers, { max: 20 });
    return () => unsub();
  }, []);

  if (players === undefined) {
    return (
      <Flex align="center" justify="center" className="py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </Flex>
    );
  }

  const own = (ownEmail || '').toLowerCase();

  return (
    <Flex direction="col" className="gap-4">
      <Flex align="center" className="gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
          // Top Operators
        </span>
      </Flex>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Wins</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Matches</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Kills</TableHead>
                <TableHead className="text-right">Win %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((p, i) => {
                const me = own && (p.email || '').toLowerCase() === own;
                return (
                  <TableRow key={p.id} className={cn(me && 'bg-primary/5')}>
                    <TableCell className="text-center font-display font-bold tabular-nums">
                      <span className={cn(i < 3 ? 'text-primary' : 'text-muted-foreground')}>{i + 1}</span>
                    </TableCell>
                    <TableCell>
                      <Flex align="center" className="gap-2.5 min-w-0">
                        <Avatar className="w-7 h-7 shrink-0">
                          {p.avatarUrl ? <AvatarImage src={p.avatarUrl} alt={p.name} /> : null}
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                            {(p.name || '??').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn('text-sm truncate', me ? 'text-primary font-semibold' : 'text-foreground')}>
                          {p.name || 'Player'}
                          {me && <span className="text-[10px] text-muted-foreground ml-1.5">(you)</span>}
                        </span>
                      </Flex>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{p.stats?.wins ?? 0}</TableCell>
                    <TableCell className="text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                      {p.stats?.matchesPlayed ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                      {p.stats?.totalKills ?? 0}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{winRate(p.stats)}</TableCell>
                  </TableRow>
                );
              })}
              {players.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                    No ranked players yet — finish a match to claim the top spot.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Flex>
  );
}
