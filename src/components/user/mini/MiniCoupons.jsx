import { Ticket, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flex, Grid } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader, demoAction } from './Demo';
import { DEMO_COUPONS } from '@/lib/mini/mockShowcase';

// Status carries an explicit label, never colour alone.
const STATUS = {
  active:   { label: 'Active',    variant: 'default'   },
  expiring: { label: 'Expiring',  variant: 'secondary' },
  used:     { label: 'Used',      variant: 'outline'   },
  expired:  { label: 'Expired',   variant: 'outline'   },
};

export default function MiniCoupons() {
  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="Coupons" />

      <Flex align="center" justify="between" className="gap-3 flex-wrap">
        <DemoSectionHeader icon={Ticket} title="My Coupons" />
        <Button size="sm" onClick={() => demoAction('Browsing more coupons')}>Get more coupons</Button>
      </Flex>

      <p className="text-xs text-muted-foreground -mt-1">
        Redeemed brand coupons. Tap to copy a code and use it at checkout.
      </p>

      <Grid className="grid-cols-1 sm:grid-cols-2 gap-3">
        {DEMO_COUPONS.map((c) => {
          const status = STATUS[c.status] ?? STATUS.active;
          const spent = c.status === 'used' || c.status === 'expired';
          return (
            <Card key={c.id} className={cn(spent && 'opacity-60')}>
              <CardContent className="p-5">
                <Flex align="start" justify="between" className="gap-3 mb-3">
                  <Flex direction="col" className="gap-0.5 min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.brand}</span>
                    <span className="font-display text-sm font-bold text-foreground leading-tight truncate">
                      {c.name}
                    </span>
                  </Flex>
                  <Badge variant={status.variant} className="font-display text-[10px] uppercase tracking-widest shrink-0">
                    {status.label}
                  </Badge>
                </Flex>

                <Flex align="center" className="gap-2">
                  <code className="flex-1 rounded-md border border-dashed border-primary/30 bg-primary/5 px-3 py-2 font-mono text-xs text-foreground tracking-wider truncate">
                    {c.code}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={spent}
                    onClick={() => demoAction('Copying the coupon code')}
                    aria-label={`Copy ${c.brand} coupon code`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </Flex>

                <span className="text-[11px] text-muted-foreground mt-3 block">
                  {spent ? 'Expired' : 'Expires'} {c.expires}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </Grid>
    </Flex>
  );
}
