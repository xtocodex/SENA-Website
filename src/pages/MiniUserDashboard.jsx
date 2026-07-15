import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flex } from "@/components/ui/layout";
import { LayoutDashboard, Trophy, Target, Wallet, Package, Store, Bell } from 'lucide-react';
import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalTopBar from "@/components/portal/PortalTopBar";
import MiniOverview from "@/components/user/mini/MiniOverview";
import MiniLeaderboard from "@/components/user/mini/MiniLeaderboard";
import MiniMissions from "@/components/user/mini/MiniMissions";
import MiniWallet from "@/components/user/mini/MiniWallet";
import MiniInventory from "@/components/user/mini/MiniInventory";
import MiniShop from "@/components/user/mini/MiniShop";
import MiniNotifications from "@/components/user/mini/MiniNotifications";
import { useAuth } from "@/context/AuthContext";
import { subscribeMiniPlayer, subscribeMatchHistory } from "@/lib/mini/players";
import { subscribeGameVersion } from "@/lib/mini/gameVersion";

// Two nav groups: LIVE reads real game data from the `SENA Mini/...`
// namespace; PREVIEW sections are 100% mock (lib/mini/mockShowcase.js) and
// carry the DEMO treatment on their pages.
const NAV_GROUPS = [
  {
    title: '// Combat Menu',
    items: [
      { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    ],
  },
  {
    title: '// Preview',
    demo: true,
    items: [
      { id: 'missions',      label: 'Missions',      icon: Target },
      { id: 'wallet',        label: 'Wallet',        icon: Wallet },
      { id: 'inventory',     label: 'Inventory',     icon: Package },
      { id: 'shop',          label: 'Shop',          icon: Store },
      { id: 'notifications', label: 'Notifications', icon: Bell },
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
    const unsub = subscribeMatchHistory(player.id, setMatches);
    return () => unsub();
  }, [player?.id]);

  const CONTENT_MAP = {
    // Live — real game data from the SENA Mini namespace.
    'overview':    () => <MiniOverview player={player} gameVersion={gameVersion} matches={matches} />,
    'leaderboard': () => <MiniLeaderboard ownEmail={session?.email} />,
    // Preview — 100% mock showcase (lib/mini/mockShowcase.js), DEMO-badged.
    'missions':      () => <MiniMissions />,
    'wallet':        () => <MiniWallet />,
    'inventory':     () => <MiniInventory />,
    'shop':          () => <MiniShop />,
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
