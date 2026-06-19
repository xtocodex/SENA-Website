import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Flex } from "@/components/ui/layout";
import { subscribeUsers } from "@/lib/userAccount";

function formatJoined(createdAt) {
  const d = createdAt?.toDate ? createdAt.toDate() : null;
  return d ? d.toLocaleDateString() : '—';
}

export default function Players() {
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    const unsub = subscribeUsers(setPlayers);
    return () => unsub();
  }, []);

  return (
    <Flex direction="col" className="gap-6">
      <Flex direction="col" className="gap-1">
        <h2 className="text-lg font-semibold text-foreground">Players</h2>
        <span className="text-xs text-muted-foreground">
          Players who signed in to the website. Coins &amp; stats now come from the linked game account — read-only here.
        </span>
      </Flex>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players === null ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  <Flex direction="col" align="center" className="gap-2">
                    <Users className="w-5 h-5" />
                    No players have signed in yet.
                  </Flex>
                </TableCell>
              </TableRow>
            ) : (
              players.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-foreground">{p.name || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{formatJoined(p.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Flex>
  );
}
