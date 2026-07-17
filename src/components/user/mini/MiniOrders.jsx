import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flex, Grid } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader, demoAction } from './Demo';
import { DEMO_ORDERS as O } from '@/lib/mini/mockShowcase';

const VARIANT = { Delivered: 'default', Shipped: 'secondary', Processing: 'outline' };

export default function MiniOrders() {
  const [filter, setFilter] = useState('All');

  const rows = O.rows.filter((r) => {
    if (filter === 'All') return true;
    if (filter === 'Delivered') return r.status === 'Delivered';
    return r.status !== 'Delivered'; // Active
  });

  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="Order history" />

      <Flex align="center" justify="between" className="gap-3 flex-wrap">
        <DemoSectionHeader icon={ShoppingBag} title="Order History" />
        <Button size="sm" onClick={() => demoAction('Redeeming more rewards')}>Redeem more</Button>
      </Flex>

      <p className="text-xs text-muted-foreground -mt-1">
        Everything you&apos;ve redeemed from the marketplace with your coins.
      </p>

      <Grid className="grid-cols-2 lg:grid-cols-4 gap-3">
        {O.stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <Flex direction="col" className="gap-1">
                <span className="font-display text-lg font-bold text-foreground tabular-nums leading-none">
                  {s.value}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</span>
              </Flex>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <Card>
        <CardContent className="p-0">
          <Flex align="center" justify="between" className="gap-3 flex-wrap p-4 border-b border-border">
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
              All orders
            </span>
            <Flex className="gap-1.5">
              {O.filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 font-display text-[10px] uppercase tracking-widest transition-colors cursor-pointer',
                    f === filter
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {f}
                </button>
              ))}
            </Flex>
          </Flex>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Cost</TableHead>
                <TableHead className="text-right hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{r.id}</TableCell>
                  <TableCell className="text-sm text-foreground">{r.item}</TableCell>
                  <TableCell className="text-right tabular-nums hidden sm:table-cell text-primary">
                    {r.cost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground hidden md:table-cell">{r.date}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={VARIANT[r.status] ?? 'outline'}
                      className="font-display text-[10px] uppercase tracking-wide"
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rows.length === 0 && (
            <p className="p-6 text-center text-xs text-muted-foreground">No orders match this filter.</p>
          )}
        </CardContent>
      </Card>
    </Flex>
  );
}
