import { Gamepad2, Rocket, Swords, ChevronRight } from 'lucide-react';
import { Flex, Grid, Box } from '@/components/ui/layout';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Workspace gate shown after login: the user picks which SENA experience this
// session drives. MAX = the established ad/rewards platform (existing
// collections). MINI = the battle-royale game ecosystem (game-owned
// `SENA Mini/...` namespace). The choice is remembered per account and can be
// switched anytime from the dashboard top bar.
const TIERS = [
  {
    id: 'max',
    name: 'SENA MAX',
    tagline: 'The full platform experience',
    icon: Rocket,
    points: ['Ad & rewards dashboard', 'Coupon redemption', 'Verified game link (OTP)'],
  },
  {
    id: 'mini',
    name: 'SENA MINI',
    tagline: 'Your battle royale companion',
    icon: Swords,
    points: ['Live match stats & badges', 'Season rank & leaderboard', 'Instant Google account link'],
  },
];

export default function TierSelect({ onSelect }) {
  const { session, setTier } = useAuth();

  const choose = (id) => {
    setTier(id);
    onSelect?.(id);
  };

  return (
    <Flex direction="col" align="center" justify="center" className="min-h-screen bg-background p-6 gap-10">
      <Flex direction="col" align="center" className="gap-3 text-center">
        <Flex align="center" justify="center" className="w-12 h-12 rounded-md bg-primary/10 border border-primary/30">
          <Gamepad2 className="w-6 h-6 text-primary" />
        </Flex>
        <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground">
          Choose your <span className="text-primary">workspace</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          {session?.name ? `Welcome, ${session.name}. ` : ''}Pick the SENA experience for this
          session — you can switch anytime from the top bar.
        </p>
      </Flex>

      <Grid className="grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
        {TIERS.map(({ id, name, tagline, icon: Icon, points }) => (
          <button
            key={id}
            onClick={() => choose(id)}
            className={cn(
              'group text-left rounded-lg border border-border bg-card p-6 cursor-pointer',
              'transition-all duration-200 hover:border-primary/50 hover:bg-primary/5',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            )}
          >
            <Flex align="center" justify="between" className="mb-4">
              <Flex align="center" justify="center" className="w-10 h-10 rounded-md bg-primary/10 border border-primary/25">
                <Icon className="w-5 h-5 text-primary" />
              </Flex>
              <Badge variant="secondary" className="font-display text-[10px] uppercase tracking-widest">
                {id === 'mini' ? 'New' : 'Live'}
              </Badge>
            </Flex>

            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground mb-1">
              {name}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">{tagline}</p>

            <Flex direction="col" className="gap-1.5 mb-5">
              {points.map((p) => (
                <Flex key={p} align="center" className="gap-2">
                  <span aria-hidden="true" className="w-1 h-1 rounded-full bg-primary shrink-0" />
                  <span className="text-xs text-muted-foreground">{p}</span>
                </Flex>
              ))}
            </Flex>

            <Flex
              align="center"
              className="gap-1 text-xs font-display uppercase tracking-wide text-primary opacity-70 group-hover:opacity-100 transition-opacity"
            >
              Enter {name}
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Flex>
          </button>
        ))}
      </Grid>

      <Box className="text-[11px] text-muted-foreground">
        Your choice is remembered for this account.
      </Box>
    </Flex>
  );
}
