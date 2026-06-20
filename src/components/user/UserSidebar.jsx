import {
  LayoutDashboard,
  Gift,
  Ticket,
  LogOut,
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flex, Box } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'rewards',     label: 'Rewards',     icon: Gift },
  { id: 'my-requests', label: 'My Requests', icon: Ticket },
];

export default function UserSidebar({ activeNav, onNavChange, sidebarOpen, onClose }) {
  const { logout } = useAuth();
  const handleNav = (id) => {
    onNavChange(id);
    onClose?.();
  };

  return (
    <Flex
      direction="col"
      className={cn(
        "w-60 shrink-0 h-full border-r border-border bg-card z-50",
        "fixed inset-y-0 left-0 transition-transform duration-300 md:relative md:translate-x-0 md:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <ScrollArea className="flex-1 py-4">
        <Flex direction="col" className="gap-1.5 px-3">
          <Box className="px-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
              // Operator Menu
            </span>
          </Box>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={cn(
                  "relative w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-display uppercase tracking-wide cursor-pointer transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {active && (
                  <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </Flex>
      </ScrollArea>

      <Flex direction="col" className="px-3 pb-4 gap-2 shrink-0">
        <Separator />
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-display uppercase tracking-wide text-muted-foreground cursor-pointer transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Extract
        </button>
      </Flex>
    </Flex>
  );
}
