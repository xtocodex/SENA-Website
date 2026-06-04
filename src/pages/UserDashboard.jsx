import { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flex } from "@/components/ui/layout";
import UserSidebar from "@/components/user/UserSidebar";
import UserTopBar from "@/components/user/UserTopBar";
import UserOverview from "@/components/user/UserOverview";
import RewardsGrid from "@/components/user/RewardsGrid";
import MyRequests from "@/components/user/MyRequests";
import { useAuth } from "@/context/AuthContext";
import { subscribeUser } from "@/lib/userAccount";

export default function UserDashboard() {
  const { session } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Live user doc (coins + mock stats), shared by every section.
  useEffect(() => {
    if (!session?.id) return;
    const unsub = subscribeUser(session.id, setUser);
    return () => unsub();
  }, [session?.id]);

  const CONTENT_MAP = {
    'overview':    () => <UserOverview user={user} />,
    'rewards':     () => <RewardsGrid user={user} />,
    'my-requests': () => <MyRequests user={user} />,
  };

  const Content = CONTENT_MAP[activeNav] ?? (() => null);

  return (
    <Flex direction="col" className="h-screen w-full overflow-hidden bg-background">

      <UserTopBar
        coins={user?.coins}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(v => !v)}
      />

      <Flex className="flex-1 min-h-0 relative">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <UserSidebar
          activeNav={activeNav}
          onNavChange={setActiveNav}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <ScrollArea className="flex-1">
          <Flex direction="col" className="p-8">
            <Content />
          </Flex>
        </ScrollArea>
      </Flex>

    </Flex>
  );
}
