import { Package, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flex, Grid } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader, demoAction } from './Demo';
import { DEMO_INVENTORY } from '@/lib/mini/mockShowcase';

const RARITY_STYLES = {
  Legendary: 'border-primary/50 text-primary',
  Epic:      'border-purple-400/40 text-purple-300',
  Rare:      'border-sky-400/40 text-sky-300',
  Sponsored: 'border-primary/30 text-primary/80',
};

export default function MiniInventory() {
  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="Inventory" />
      <DemoSectionHeader icon={Package} title="Inventory" />

      <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DEMO_INVENTORY.map((item) => (
          <Card key={item.id} className={cn(item.equipped && 'border-primary/40')}>
            <CardContent className="p-4">
              <Flex direction="col" className="gap-3">
                <Flex align="center" justify="between">
                  <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wide', RARITY_STYLES[item.rarity])}>
                    {item.rarity}
                  </Badge>
                  {item.equipped && (
                    <Flex align="center" className="gap-1 text-primary">
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-display uppercase tracking-wide">Equipped</span>
                    </Flex>
                  )}
                </Flex>

                <Flex direction="col" className="gap-0.5">
                  <span className="text-sm font-medium text-foreground leading-tight">{item.name}</span>
                  <span className="text-[11px] text-muted-foreground">{item.type}</span>
                </Flex>

                <Button
                  size="sm"
                  variant={item.equipped ? 'ghost' : 'secondary'}
                  className="h-7 text-xs font-display uppercase tracking-wide"
                  onClick={() => demoAction(item.equipped ? 'Unequipping items' : 'Equipping items')}
                >
                  {item.equipped ? 'Unequip' : 'Equip'}
                </Button>
              </Flex>
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}
