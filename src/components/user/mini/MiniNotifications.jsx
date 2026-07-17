import { Bell, Gift, Trophy, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Flex } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader } from './Demo';
import { DEMO_NOTIFICATIONS } from '@/lib/mini/mockShowcase';

const ICONS = { gift: Gift, trophy: Trophy, bell: Bell, cart: ShoppingCart, star: Star };

export default function MiniNotifications() {
  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="Notifications" />
      <DemoSectionHeader icon={Bell} title="Notifications" />

      <Card>
        <CardContent className="p-0">
          <Flex direction="col">
            {DEMO_NOTIFICATIONS.map((n, i) => {
              const Icon = ICONS[n.icon] || Bell;
              return (
                <Flex
                  key={n.id}
                  align="start"
                  className={cn(
                    'gap-3 px-4 py-3.5',
                    i < DEMO_NOTIFICATIONS.length - 1 && 'border-b border-border',
                    n.unread && 'bg-primary/[0.03]',
                  )}
                >
                  <Flex
                    align="center"
                    justify="center"
                    className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 shrink-0 mt-0.5"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                  </Flex>
                  <Flex direction="col" className="gap-0.5 min-w-0 flex-1">
                    <Flex align="center" className="gap-2">
                      <span className="text-sm font-medium text-foreground">{n.title}</span>
                      {n.unread && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                    </Flex>
                    <span className="text-xs text-muted-foreground">{n.body}</span>
                  </Flex>
                  <span className="text-[11px] text-muted-foreground shrink-0">{n.time}</span>
                </Flex>
              );
            })}
          </Flex>
        </CardContent>
      </Card>
    </Flex>
  );
}
