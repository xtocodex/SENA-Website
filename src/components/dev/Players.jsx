import { useState, useEffect } from 'react';
import { Pencil, Loader2, Coins, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Flex, Grid, Box } from "@/components/ui/layout";
import { subscribeUsers, updateUser } from "@/lib/userAccount";

const STAT_FIELDS = [
  { key: 'matchesPlayed', label: 'Matches Played' },
  { key: 'matchesWon',    label: 'Matches Won' },
  { key: 'adViews',       label: 'Ad Views' },
  { key: 'adWatchTime',   label: 'Ad Watch Time (s)' },
];

function EditDialog({ player, open, onClose }) {
  const [coins, setCoins] = useState('');
  const [stats, setStats] = useState({});
  const [optionalData, setOptionalData] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && player) {
      setCoins(String(player.coins ?? 0));
      setStats(Object.fromEntries(STAT_FIELDS.map((f) => [f.key, String(player.stats?.[f.key] ?? 0)])));
      setOptionalData(player.optionalData || '');
      setSaving(false);
    }
  }, [open, player]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(player.id, {
        coins: Number(coins) || 0,
        stats: Object.fromEntries(STAT_FIELDS.map((f) => [f.key, Number(stats[f.key]) || 0])),
        optionalData: optionalData.trim(),
      });
      toast.success(`${player.name || 'Player'} updated.`);
      onClose();
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
      setSaving(false);
    }
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{player.name || 'Player'}</DialogTitle>
          <DialogDescription>{player.email} — adjust mock coins & stats (v1, until game link).</DialogDescription>
        </DialogHeader>

        <Flex direction="col" className="gap-4 pt-1">
          <Box className="space-y-2">
            <Label htmlFor="pl-coins">Coins</Label>
            <Input id="pl-coins" type="number" min="0" value={coins} onChange={(e) => setCoins(e.target.value)} />
          </Box>

          <Grid gap={3} className="grid-cols-2">
            {STAT_FIELDS.map((f) => (
              <Box key={f.key} className="space-y-2">
                <Label htmlFor={`pl-${f.key}`}>{f.label}</Label>
                <Input
                  id={`pl-${f.key}`} type="number" min="0"
                  value={stats[f.key] ?? ''}
                  onChange={(e) => setStats((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              </Box>
            ))}
          </Grid>

          <Box className="space-y-2">
            <Label htmlFor="pl-optional">Optional data</Label>
            <textarea
              id="pl-optional"
              value={optionalData}
              onChange={(e) => setOptionalData(e.target.value)}
              rows={2}
              placeholder="Any extra info shown on the player's overview…"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </Box>
        </Flex>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Players() {
  const [players, setPlayers] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const unsub = subscribeUsers(setPlayers);
    return () => unsub();
  }, []);

  return (
    <Flex direction="col" className="gap-6">
      <Flex direction="col" className="gap-1">
        <h2 className="text-lg font-semibold text-foreground">Players</h2>
        <span className="text-xs text-muted-foreground">
          Game players who signed in. Coins & stats are mock values you can set manually for now.
        </span>
      </Flex>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Coins</TableHead>
              <TableHead>Matches</TableHead>
              <TableHead className="w-16 text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players === null ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                  <TableCell className="text-foreground">
                    <Flex align="center" className="gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span className="tabular-nums">{(p.coins ?? 0).toLocaleString()}</span>
                    </Flex>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {(p.stats?.matchesWon ?? 0)}/{(p.stats?.matchesPlayed ?? 0)}
                  </TableCell>
                  <TableCell>
                    <Flex justify="end">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setEditing(p)} title="Edit player">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditDialog player={editing} open={!!editing} onClose={() => setEditing(null)} />
    </Flex>
  );
}
