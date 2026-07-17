import { Gift, Sparkles, Users, Check, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Flex, Grid } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader, demoAction } from './Demo';
import { DEMO_REWARDS as R } from '@/lib/mini/mockShowcase';

export default function MiniRewards() {
  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="Rewards" />

      <Flex align="center" justify="between" className="gap-3 flex-wrap">
        <DemoSectionHeader icon={Gift} title="Rewards" />
        <Badge variant="outline" className="border-primary/40 text-primary font-display text-[10px] uppercase tracking-widest">
          {R.pointsAvailable} points available
        </Badge>
      </Flex>

      <Grid className="grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Daily reward */}
        <Card className="border-primary/30">
          <CardContent className="p-5">
            <Flex align="center" justify="between" className="mb-3">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Daily reward
              </span>
              {R.daily.ready && (
                <Badge className="font-display text-[10px] uppercase tracking-widest">Ready</Badge>
              )}
            </Flex>
            <p className="text-xs text-muted-foreground mb-4">
              Day {R.daily.day} of your streak — the biggest drop of the week is waiting.
            </p>
            <span className="font-display text-2xl font-bold text-primary tabular-nums block mb-4">
              +{R.daily.amount} coins
            </span>
            <Button className="w-full" onClick={() => demoAction('Claiming the daily reward')}>
              Claim daily reward
            </Button>
          </CardContent>
        </Card>

        {/* Reward wheel */}
        <Card>
          <CardContent className="p-5">
            <Flex align="center" justify="between" className="mb-3">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Reward wheel
              </span>
              <Badge variant="secondary" className="font-display text-[10px] uppercase tracking-widest">
                {R.wheel.spinsLeft} spin left
              </Badge>
            </Flex>
            <p className="text-xs text-muted-foreground mb-4">
              Spin to win coins, coupons or an XP booster.
            </p>
            <Flex align="center" justify="center" className="py-4 mb-4">
              <Flex align="center" justify="center" className="w-16 h-16 rounded-full border-2 border-dashed border-primary/40">
                <Sparkles className="w-6 h-6 text-primary" />
              </Flex>
            </Flex>
            <Button variant="outline" className="w-full" onClick={() => demoAction('Spinning the wheel')}>
              Spin the wheel
            </Button>
          </CardContent>
        </Card>

        {/* Referral */}
        <Card>
          <CardContent className="p-5">
            <Flex align="center" justify="between" className="mb-3">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Refer a friend
              </span>
              <Badge variant="secondary" className="font-display text-[10px] uppercase tracking-widest">
                +{R.referral.bonus}
              </Badge>
            </Flex>
            <p className="text-xs text-muted-foreground mb-4">
              Invite a friend and you both earn {R.referral.bonus} coins when they play.
            </p>
            <Flex align="center" className="gap-2 mb-4">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input readOnly value={R.referral.code} className="font-mono text-xs" />
            </Flex>
            <Button variant="outline" className="w-full" onClick={() => demoAction('Copying your invite code')}>
              Copy invite code
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Streak calendar */}
      <Card>
        <CardContent className="p-5">
          <Flex align="center" justify="between" className="mb-4">
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
              Streak calendar
            </span>
            <span className="text-[11px] text-muted-foreground">7-day login streak</span>
          </Flex>
          <Grid className="grid-cols-4 sm:grid-cols-7 gap-2.5">
            {R.streak.map((s) => (
              <Flex
                key={s.day}
                direction="col"
                align="center"
                className={cn(
                  'gap-1 rounded-md border p-3 text-center',
                  s.claimed ? 'border-primary/30 bg-primary/5' : 'border-dashed border-primary/50 bg-primary/10',
                )}
              >
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Day {s.day}</span>
                {s.claimed
                  ? <Check className="w-4 h-4 text-primary" />
                  : <Sparkles className="w-4 h-4 text-primary" />}
                <span className="text-xs font-medium text-foreground tabular-nums">+{s.reward}</span>
              </Flex>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Unlock with points */}
      <Card>
        <CardContent className="p-5">
          <Flex align="center" justify="between" className="mb-4 gap-2">
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
              Unlock with points
            </span>
            <button
              onClick={() => demoAction('The full marketplace')}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Full marketplace →
            </button>
          </Flex>
          <Grid className="grid-cols-1 sm:grid-cols-3 gap-2.5">
            {R.unlocks.map((u) => {
              const affordable = u.cost <= R.pointsAvailable;
              return (
                <Flex key={u.id} direction="col" className="gap-2 rounded-md border border-border p-3">
                  <span className="text-sm font-medium text-foreground leading-tight">{u.name}</span>
                  <Flex align="center" className="gap-1.5">
                    <span className="font-display text-base font-bold text-primary tabular-nums">{u.cost}</span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{u.unit}</span>
                  </Flex>
                  <Button
                    size="sm"
                    variant={affordable ? 'default' : 'outline'}
                    disabled={!affordable}
                    onClick={() => demoAction(`Unlocking ${u.name}`)}
                    className="w-full mt-1"
                  >
                    {affordable ? 'Unlock' : <><Lock className="w-3 h-3" /> Not enough</>}
                  </Button>
                </Flex>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Flex>
  );
}
