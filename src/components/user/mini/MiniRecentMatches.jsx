import { Swords, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flex } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { toDate } from '@/lib/mini/players';

const mins = (sec) => `${Math.round((Number(sec) || 0) / 60)}m`;

const when = (ts) => {
  const d = toDate(ts);
  if (!d) return '—';
  const diffH = (Date.now() - d.getTime()) / 36e5;
  if (diffH < 1) return `${Math.max(1, Math.round(diffH * 60))}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  return d.toLocaleDateString();
};

// LIVE section — renders the player's matchHistory subcollection (locked
// contract v1.0). Not shown at all until the player has recorded matches.
export default function MiniRecentMatches({ matches }) {
  if (!matches || matches.length === 0) return null;

  return (
    <Flex direction="col" className="gap-3">
      <Flex align="center" className="gap-2">
        <Swords className="w-4 h-4 text-primary" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
          // Recent Matches
        </span>
      </Flex>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead className="text-right">Place</TableHead>
                <TableHead className="text-right">Kills</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Damage</TableHead>
                <TableHead className="text-right hidden md:table-cell">Healed</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Survived</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((m) => {
                const won = m.placement === 1;
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Flex direction="col" className="gap-0.5">
                        <Flex align="center" className="gap-2">
                          <Badge
                            variant={won ? 'default' : 'secondary'}
                            className="font-display text-[10px] uppercase tracking-wide px-1.5 py-0 h-4"
                          >
                            {m.mode || '—'}
                          </Badge>
                        </Flex>
                        <Flex align="center" className="gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[11px]">{m.mapName || 'Unknown map'}</span>
                        </Flex>
                      </Flex>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className={cn('font-medium', won ? 'text-primary' : 'text-foreground')}>
                        #{m.placement ?? '—'}
                      </span>
                      {m.totalPlayers != null && (
                        <span className="text-muted-foreground text-xs"> / {m.totalPlayers}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{m.kills ?? 0}</TableCell>
                    <TableCell className="text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                      {Math.round(m.damage ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums hidden md:table-cell text-muted-foreground">
                      {Math.round(m.healed ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                      {mins(m.survivalSeconds)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{when(m.timestamp)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Flex>
  );
}
