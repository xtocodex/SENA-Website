import { Target, Coins, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flex, Grid } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader, demoAction } from './Demo';
import { DEMO_MISSIONS } from '@/lib/mini/mockShowcase';

const TAG_STYLES = {
  Daily:     'bg-primary/10 text-primary border-primary/25',
  Weekly:    'bg-accent/40 text-foreground border-border',
  Sponsored: 'bg-primary/15 text-primary border-primary/40',
  Event:     'bg-destructive/10 text-destructive border-destructive/30',
};

export default function MiniMissions() {
  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="Missions" />
      <DemoSectionHeader icon={Target} title="Missions" />

      <Grid className="grid-cols-1 md:grid-cols-2 gap-3">
        {DEMO_MISSIONS.map((m) => {
          const done = m.progress >= m.total;
          const pctWidth = Math.min(100, Math.round((m.progress / m.total) * 100));
          return (
            <Card key={m.id}>
              <CardContent className="p-4">
                <Flex direction="col" className="gap-3">
                  <Flex align="center" justify="between" className="gap-2">
                    <Badge variant="outline" className={cn('text-[10px] uppercase tracking-wide', TAG_STYLES[m.tag])}>
                      {m.tag}
                    </Badge>
                    <Flex align="center" className="gap-1 text-primary">
                      {m.unit === 'coins' ? <Coins className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                      <span className="font-display text-xs font-bold tabular-nums">+{m.reward}</span>
                    </Flex>
                  </Flex>

                  <Flex direction="col" className="gap-1">
                    <span className="text-sm font-medium text-foreground">{m.title}</span>
                    {m.brand && (
                      <span className="text-[11px] text-muted-foreground">Sponsored by {m.brand}</span>
                    )}
                  </Flex>

                  <Flex direction="col" className="gap-1.5">
                    <div className="h-1.5 w-full rounded-full bg-accent/60 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', done ? 'bg-primary' : 'bg-primary/60')}
                        style={{ width: `${pctWidth}%` }}
                      />
                    </div>
                    <Flex align="center" justify="between">
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {m.progress} / {m.total}
                      </span>
                      <Button
                        size="sm"
                        variant={done ? 'default' : 'ghost'}
                        disabled={!done}
                        className="h-7 text-xs font-display uppercase tracking-wide"
                        onClick={() => demoAction('Claiming mission rewards')}
                      >
                        {done ? 'Claim' : 'In progress'}
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </CardContent>
            </Card>
          );
        })}
      </Grid>
    </Flex>
  );
}
