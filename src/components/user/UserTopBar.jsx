import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Gamepad2, Menu, X, Coins } from "lucide-react";
import { Flex } from "@/components/ui/layout";
import { useAuth } from "@/context/AuthContext";

export default function UserTopBar({ sidebarOpen, onSidebarToggle, coins }) {
  const { session } = useAuth();

  const name = session?.name || '';
  const email = session?.email || '';
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <Flex
      align="center"
      className="h-16 w-full border-b border-border bg-card shrink-0"
    >
      {/* Wordmark cell (mirrors sidebar width exactly) */}
      <Flex
        align="center"
        className="w-60 shrink-0 gap-2.5 px-5 h-full border-r border-border"
      >
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
            className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 shrink-0"
          >
            <Gamepad2 className="w-4 h-4 text-primary" />
          </Flex>
          <span className="text-base font-black tracking-tight text-foreground hidden sm:block truncate">
            GauravGo<span className="text-primary">Games</span>
          </span>
        </Flex>
      </Flex>

      {/* Main content header */}
      <Flex align="center" justify="end" className="flex-1 px-6 h-full gap-3">
        {typeof coins === 'number' && (
          <Flex
            align="center"
            className="gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-amber-500 tabular-nums">
              {coins.toLocaleString()}
            </span>
          </Flex>
        )}

        <Flex align="center" className="gap-3">
          <Flex direction="col" align="end" className="gap-0.5 hidden sm:flex">
            <span className="text-xs font-medium text-foreground leading-none">
              {name}
            </span>
            <span className="text-[11px] text-muted-foreground leading-none">
              {email}
            </span>
          </Flex>

          <Separator orientation="vertical" className="h-8 hidden sm:block" />

          <Flex align="center" className="gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              Player
            </Badge>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
