import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flex } from "@/components/ui/layout";
import { LayoutDashboard, Gift, Ticket, Coins } from 'lucide-react';
import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalTopBar from "@/components/portal/PortalTopBar";
import UserOverview from "@/components/user/UserOverview";
import RewardsGrid from "@/components/user/RewardsGrid";
import MyRequests from "@/components/user/MyRequests";
import { useAuth } from "@/context/AuthContext";
import { subscribeUser } from "@/lib/userAccount";
import { subscribeVerifiedPlayer } from "@/lib/playerAccount";

const NAV_GROUPS = [
  {
    title: '// Operator Menu',
    items: [
      { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
      { id: 'rewards',     label: 'Rewards',     icon: Gift },
      { id: 'my-requests', label: 'My Requests', icon: Ticket },
    ],
  },
];

export default function UserDashboard() {
  const { session } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(undefined); // undefined = loading, null = unlinked, object = linked

  // Live website profile doc (name / photo / email), shared by every section.
  useEffect(() => {
    if (!session?.id) return;
    const unsub = subscribeUser(session.id, setUser);
    return () => unsub();
  }, [session?.id]);

  // Live verified game-player record, joined by the signed-in email.
  // Coins and combat stats come from here (the real game data).
  useEffect(() => {
    if (!session?.email) return;
    const unsub = subscribeVerifiedPlayer(session.email, setPlayer);
    return () => unsub();
  }, [session?.email]);

  const coins = player?.coins ?? 0;

  const CONTENT_MAP = {
    'overview':    () => <UserOverview user={user} player={player} onNavigate={setActiveNav} />,
    'rewards':     () => <RewardsGrid user={user} player={player} />,
    'my-requests': () => <MyRequests user={user} />,
  };

  const Content = CONTENT_MAP[activeNav] ?? (() => null);

  return (
    <Flex direction="col" className="hud-theme h-screen w-full overflow-hidden bg-background">

      <PortalTopBar
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(v => !v)}
        roleLabel="Player"
        rightSlot={
          <Flex
            align="center"
            className="gap-1.5 rounded-sm bg-primary/10 border border-primary/25 px-3 py-1"
          >
            <Coins className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-display text-xs font-bold text-primary tabular-nums tracking-wide">
              {coins.toLocaleString()}
            </span>
          </Flex>
        }
      />

      <Flex className="flex-1 min-h-0 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <PortalSidebar
          groups={NAV_GROUPS}
          activeNav={activeNav}
          onNavChange={setActiveNav}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <ScrollArea className="flex-1 hud-grid">
          <Flex direction="col" className="p-5 md:p-8 max-w-6xl w-full mx-auto">
            <Content />
          </Flex>
        </ScrollArea>
      </Flex>

    </Flex>
  );
}
