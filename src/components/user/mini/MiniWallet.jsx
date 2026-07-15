import { Wallet, Coins, Star, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flex, Grid } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader } from './Demo';
import { DEMO_WALLET } from '@/lib/mini/mockShowcase';

function BalanceCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-5">
        <Flex align="center" className="gap-4">
          <Flex align="center" justify="center" className="w-11 h-11 rounded-md bg-primary/10 border border-primary/25 shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </Flex>
          <Flex direction="col" className="gap-0.5">
            <span className="font-display text-2xl font-bold text-foreground leading-none tabular-nums">
              {value.toLocaleString()}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
          </Flex>
        </Flex>
      </CardContent>
    </Card>
  );
}

export default function MiniWallet() {
  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="Wallet" />
      <DemoSectionHeader icon={Wallet} title="Wallet" />

      <Grid className="grid-cols-1 sm:grid-cols-2 gap-3">
        <BalanceCard icon={Coins} label="Coins" value={DEMO_WALLET.coins} />
        <BalanceCard icon={Star} label="Reward Points" value={DEMO_WALLET.rewardPoints} />
      </Grid>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DEMO_WALLET.transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Flex align="center" className="gap-2.5 min-w-0">
                      <Flex
                        align="center"
                        justify="center"
                        className={cn(
                          'w-6 h-6 rounded-full shrink-0',
                          t.type === 'in' ? 'bg-primary/10' : 'bg-destructive/10',
                        )}
                      >
                        {t.type === 'in'
                          ? <ArrowDownLeft className="w-3.5 h-3.5 text-primary" />
                          : <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />}
                      </Flex>
                      <span className="text-sm text-foreground truncate">{t.label}</span>
                    </Flex>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">{t.date}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right tabular-nums font-medium',
                      t.type === 'in' ? 'text-primary' : 'text-destructive',
                    )}
                  >
                    {t.amount > 0 ? `+${t.amount.toLocaleString()}` : t.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Flex>
  );
}
