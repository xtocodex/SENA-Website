import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flex } from "@/components/ui/layout";
import {
  LayoutDashboard, Trophy, Target, Wallet, Package, Store, Bell,
  BarChart3, Gift, Ticket, ShoppingBag, User, Settings,
} from 'lucide-react';
import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalTopBar from "@/components/portal/PortalTopBar";
import MiniOverview from "@/components/user/mini/MiniOverview";
import MiniLeaderboard from "@/components/user/mini/MiniLeaderboard";
import MiniMissions from "@/components/user/mini/MiniMissions";
import MiniStatistics from "@/components/user/mini/MiniStatistics";
import MiniRewards from "@/components/user/mini/MiniRewards";
import MiniWallet from "@/components/user/mini/MiniWallet";
import MiniInventory from "@/components/user/mini/MiniInventory";
import MiniShop from "@/components/user/mini/MiniShop";
import MiniCoupons from "@/components/user/mini/MiniCoupons";
import MiniOrders from "@/components/user/mini/MiniOrders";
import MiniProfile from "@/components/user/mini/MiniProfile";
import MiniSettings from "@/components/user/mini/MiniSettings";
import MiniNotifications from "@/components/user/mini/MiniNotifications";
import { useAuth } from "@/context/AuthContext";
import { subscribeMiniPlayer, subscribeMatchHistory } from "@/lib/mini/players";
import { subscribeGameVersion } from "@/lib/mini/gameVersion";

// LIVE reads real game data from the `SENA Mini/...` namespace; PREVIEW groups
// are 100% mock (lib/mini/mockShowcase.js) and carry the DEMO treatment on their
// pages. The preview grouping mirrors the v2 prototype's player portal
// (v2/Website/js/app.js) so the two can be compared section by section.
const NAV_GROUPS = [
  {
    title: '// Combat Menu',
    items: [
      { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
      { id: 'statistics',  label: 'Statistics',  icon: BarChart3 },
      { id: 'profile',     label: 'Profile',     icon: User },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ],
  },
  {
    title: '// Preview · Play',
    demo: true,
    items: [
      { id: 'missions', label: 'Missions', icon: Target },
    ],
  },
  {
    title: '// Preview · Rewards',
    demo: true,
    items: [
      { id: 'rewards',   label: 'Rewards',   icon: Gift },
      { id: 'wallet',    label: 'Wallet',    icon: Wallet },
      { id: 'shop',      label: 'Shop',      icon: Store },
      { id: 'coupons',   label: 'Coupons',   icon: Ticket },
      { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
      { id: 'inventory', label: 'Inventory', icon: Package },
    ],
  },
  {
    title: '// Preview · Account',
    demo: true,
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings',      label: 'Settings',      icon: Settings },
    ],
  },
];

// SENA MINI player portal — reads exclusively from the game-owned
// `SENA Mini/...` namespace (see lib/mini). Completely separate data path
// from the MAX dashboard; the shared pieces are auth, session and the design
// system.
export default function MiniUserDashboard() {
  const { session } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [player, setPlayer] = useState(undefined); // undefined = loading, null = unlinked, object = linked
  const [gameVersion, setGameVersion] = useState(null);
  const [matches, setMatches] = useState([]);

  // Live game record, joined by the signed-in Google email (no OTP needed —
  // both the game and the website verify the email via Google sign-in).
  useEffect(() => {
    if (!session?.email) return;
    const unsub = subscribeMiniPlayer(session.email, setPlayer);
    return () => unsub();
  }, [session?.email]);

  useEffect(() => {
    const unsub = subscribeGameVersion(setGameVersion);
    return () => unsub();
  }, []);

  // Recent matches from the linked player's matchHistory subcollection.
  useEffect(() => {
    if (!player?.id) {
      setMatches([]);
      return;
    }
    // 50 rather than the default 10: Statistics buckets the last 7 days from
    // this same feed, so it needs more than one screenful of recent matches.
    const unsub = subscribeMatchHistory(player.id, setMatches, { max: 50 });
    return () => unsub();
  }, [player?.id]);

  const CONTENT_MAP = {
    // Live — real game data from the SENA Mini namespace.
    'overview':    () => <MiniOverview player={player} gameVersion={gameVersion} matches={matches} onNavigate={setActiveNav} />,
    'statistics':  () => <MiniStatistics player={player} matches={matches} />,
    'profile':     () => <MiniProfile player={player} matches={matches} />,
    'leaderboard': () => <MiniLeaderboard ownEmail={session?.email} />,
    // Preview — 100% mock showcase (lib/mini/mockShowcase.js), DEMO-badged.
    'missions':      () => <MiniMissions />,
    'rewards':       () => <MiniRewards />,
    'wallet':        () => <MiniWallet />,
    'shop':          () => <MiniShop />,
    'coupons':       () => <MiniCoupons />,
    'orders':        () => <MiniOrders />,
    'inventory':     () => <MiniInventory />,
    'settings':      () => <MiniSettings />,
    'notifications': () => <MiniNotifications />,
  };

  const Content = CONTENT_MAP[activeNav] ?? (() => null);

  return (
    <Flex direction="col" className="hud-theme h-screen w-full overflow-hidden bg-background">

      <PortalTopBar
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(v => !v)}
        roleLabel="Player"
        displayName={player?.name}
        avatarUrl={player?.avatarUrl || ''}
        rightSlot={
          player?.isOnline != null ? (
            <Flex align="center" className="gap-1.5 rounded-sm bg-primary/10 border border-primary/25 px-3 py-1">
              <span
                aria-hidden="true"
                className={player.isOnline ? "w-2 h-2 rounded-full bg-primary" : "w-2 h-2 rounded-full bg-muted-foreground/50"}
              />
              <span className="font-display text-xs font-bold text-primary tracking-wide uppercase">
                {player.isInMatch ? 'In Match' : player.isOnline ? 'Online' : 'Offline'}
              </span>
            </Flex>
          ) : null
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
