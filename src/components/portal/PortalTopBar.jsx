import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Gamepad2, Menu, X, ArrowLeftRight } from "lucide-react";
import { Flex } from "@/components/ui/layout";
import { useAuth } from "@/context/AuthContext";

// Shared brand top bar for every portal tier. The GauravGoGames wordmark and
// chrome are identical across SENA MAX and SENA MINI — the tier only appears
// as a chip next to the wordmark. Tier-specific widgets (coins, presence…)
// come in through `rightSlot`; everything else lives here once.
export default function PortalTopBar({
  sidebarOpen,
  onSidebarToggle,
  roleLabel = 'Player',
  rightSlot = null,
  avatarUrl = '',
  displayName,
}) {
  const { session, setTier } = useAuth();

  const tier = session?.tier;
  const name = displayName || session?.name || '';
  const email = session?.email || '';
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <Flex align="center" className="h-16 w-full border-b border-border bg-card shrink-0">
      {/* Wordmark cell (mirrors sidebar width exactly) */}
      <Flex align="center" className="w-60 shrink-0 gap-2.5 px-5 h-full border-r border-border">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden w-8 h-8 shrink-0"
          onClick={onSidebarToggle}
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>

        <Flex align="center" className="gap-2 min-w-0">
          <Flex
            align="center"
            justify="center"
            className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 shrink-0"
          >
            <Gamepad2 className="w-4 h-4 text-primary" />
          </Flex>
          <span className="font-display text-base font-bold uppercase tracking-wide text-foreground hidden sm:block truncate">
            GauravGo<span className="text-primary">Games</span>
          </span>
        </Flex>
      </Flex>

      {/* Main content header */}
      <Flex align="center" justify="between" className="flex-1 px-6 h-full gap-3">
        {/* Tier chip — the only tier marker in the shared chrome */}
        <Flex align="center" className="shrink-0">
          {tier && (
            <Badge
              variant="outline"
              className="font-display text-[10px] uppercase tracking-widest px-2 py-0 h-5 border-primary/40 text-primary"
            >
              SENA {tier}
            </Badge>
          )}
        </Flex>

        <Flex align="center" justify="end" className="gap-3 min-w-0">
          {rightSlot}

          {tier && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs font-display uppercase tracking-wide text-muted-foreground hover:text-foreground"
              onClick={() => setTier(null)}
              title="Switch workspace"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch</span>
            </Button>
          )}

          <Flex align="center" className="gap-3">
            <Flex direction="col" align="end" className="gap-0.5 hidden sm:flex">
              <span className="text-xs font-medium text-foreground leading-none">{name}</span>
              <span className="text-[11px] text-muted-foreground leading-none">{email}</span>
            </Flex>

            <Separator orientation="vertical" className="h-8 hidden sm:block" />

            <Flex align="center" className="gap-2">
              <Avatar className="w-8 h-8">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary" className="font-display text-[10px] uppercase tracking-widest px-1.5 py-0 h-5">
                {roleLabel}
              </Badge>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
