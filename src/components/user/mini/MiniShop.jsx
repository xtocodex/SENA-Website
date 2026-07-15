import { useState } from 'react';
import { Store, Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flex, Grid } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader, demoAction } from './Demo';
import { DEMO_PRODUCTS, DEMO_PRODUCT_CATEGORIES } from '@/lib/mini/mockShowcase';

export default function MiniShop() {
  const [cat, setCat] = useState('All');
  const products = cat === 'All' ? DEMO_PRODUCTS : DEMO_PRODUCTS.filter((p) => p.cat === cat);

  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="The Shop" />
      <DemoSectionHeader icon={Store} title="Shop" />

      <Flex className="gap-1.5 flex-wrap">
        {DEMO_PRODUCT_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-display uppercase tracking-wide cursor-pointer transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              cat === c
                ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-accent/50',
            )}
          >
            {c}
          </button>
        ))}
      </Flex>

      <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <Flex direction="col" className="gap-3">
                <Flex align="center" justify="between">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    {p.cat}
                  </Badge>
                  {p.tag && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide border-primary/40 text-primary">
                      {p.tag}
                    </Badge>
                  )}
                </Flex>

                <Flex direction="col" className="gap-0.5">
                  <span className="text-sm font-medium text-foreground leading-tight">{p.name}</span>
                  <span className="text-[11px] text-muted-foreground">{p.brand}</span>
                </Flex>

                <Flex align="center" justify="between">
                  <Flex align="center" className="gap-1 text-primary">
                    <Coins className="w-3.5 h-3.5" />
                    <span className="font-display text-sm font-bold tabular-nums">{p.cost.toLocaleString()}</span>
                  </Flex>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 text-xs font-display uppercase tracking-wide"
                    onClick={() => demoAction('Redeeming products')}
                  >
                    Redeem
                  </Button>
                </Flex>
              </Flex>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}
