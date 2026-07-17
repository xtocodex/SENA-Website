import { useState } from 'react';
import { Settings, Wallet, ShoppingBag, LifeBuoy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Flex, Grid, Box } from '@/components/ui/layout';
import { cn } from '@/lib/utils';
import { DemoBanner, DemoSectionHeader, demoAction } from './Demo';
import { DEMO_SETTINGS as S } from '@/lib/mini/mockShowcase';

// The app ships no Switch primitive; this is a local toggle for the demo prefs.
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-9 h-5 rounded-full border transition-colors shrink-0 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        checked ? 'bg-primary/25 border-primary/50' : 'bg-muted border-border',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 w-3.5 h-3.5 rounded-full transition-transform',
          checked ? 'translate-x-4 bg-primary' : 'translate-x-0.5 bg-muted-foreground',
        )}
      />
    </button>
  );
}

export default function MiniSettings() {
  const [prefs, setPrefs] = useState(S.prefs);
  const toggle = (id) => setPrefs((p) => p.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));

  return (
    <Flex direction="col" className="gap-4">
      <DemoBanner feature="Settings" />
      <DemoSectionHeader icon={Settings} title="Settings" />

      <p className="text-xs text-muted-foreground -mt-1">
        Manage your profile, preferences and privacy.
      </p>

      <Grid className="grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Identity card + quick links */}
        <Card className="self-start">
          <CardContent className="p-5">
            <Flex direction="col" align="center" className="gap-2 text-center">
              <Avatar className="w-20 h-20 border border-primary/30">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {S.profile.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-display text-sm font-bold text-foreground">{S.profile.displayName}</span>
              <span className="text-[11px] text-muted-foreground">{S.profile.username}</span>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={() => demoAction('The avatar picker')}
              >
                Change avatar
              </Button>
            </Flex>

            <Separator className="my-4" />

            <Flex direction="col" className="gap-1">
              {[
                { icon: Wallet,      label: 'Wallet & billing' },
                { icon: ShoppingBag, label: 'Order history' },
                { icon: LifeBuoy,    label: 'Help & support' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => demoAction(label)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors cursor-pointer text-left"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {label}
                </button>
              ))}
            </Flex>
          </CardContent>
        </Card>

        <Flex direction="col" className="gap-3 lg:col-span-2">
          {/* Profile details */}
          <Card>
            <CardContent className="p-5">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Profile details
              </span>
              <Grid className="grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <Flex direction="col" className="gap-1.5">
                  <Label htmlFor="mini-name" className="text-xs">Display name</Label>
                  <Input id="mini-name" defaultValue={S.profile.displayName} />
                </Flex>
                <Flex direction="col" className="gap-1.5">
                  <Label htmlFor="mini-user" className="text-xs">Username</Label>
                  <Input id="mini-user" defaultValue={S.profile.username} />
                </Flex>
                <Flex direction="col" className="gap-1.5">
                  <Label htmlFor="mini-email" className="text-xs">Email</Label>
                  <Input id="mini-email" type="email" defaultValue={S.profile.email} />
                </Flex>
                <Flex direction="col" className="gap-1.5">
                  <Label className="text-xs">Country</Label>
                  <Select defaultValue={S.profile.country}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {S.countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Flex>
              </Grid>
              <Button className="mt-4" onClick={() => demoAction('Saving profile details')}>
                Save changes
              </Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardContent className="p-5">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Preferences
              </span>
              <Flex direction="col" className="mt-2">
                {prefs.map((p, i) => (
                  <Box key={p.id}>
                    {i > 0 && <Separator />}
                    <Flex align="center" justify="between" className="gap-4 py-3">
                      <Flex direction="col" className="gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-foreground leading-tight">{p.label}</span>
                        <span className="text-[11px] text-muted-foreground leading-tight">{p.detail}</span>
                      </Flex>
                      <Toggle checked={p.on} onChange={() => toggle(p.id)} label={p.label} />
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/30">
            <CardContent className="p-5">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                Danger zone
              </span>
              <p className="text-xs text-muted-foreground mt-1.5 mb-4">
                Account actions are previews — nothing here changes your real account yet.
              </p>
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => demoAction('Deleting your account')}
              >
                Delete account
              </Button>
            </CardContent>
          </Card>
        </Flex>
      </Grid>
    </Flex>
  );
}
