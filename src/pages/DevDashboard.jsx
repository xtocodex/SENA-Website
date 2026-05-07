import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flex } from "@/components/ui/layout";
import DevSidebar from "@/components/dev/DevSidebar";
import DevTopBar from "@/components/dev/DevTopBar";
import ManageBrands from "@/components/dev/ManageBrands";
import BrowseBrandMedia from "@/components/dev/BrowseBrandMedia";
import MyCollections from "@/components/dev/MyCollections";

const CONTENT_MAP = {
  'manage-brands':    () => <ManageBrands />,
  'browse-media':     () => <BrowseBrandMedia />,
  'my-collections':   () => <MyCollections />,
};

export default function DevDashboard() {
  const [activeNav, setActiveNav] = useState('manage-brands');

  const Content = CONTENT_MAP[activeNav] ?? (() => null);

  return (
    <Flex direction="col" className="h-screen w-full overflow-hidden bg-background">

      <DevTopBar />

      <Flex className="flex-1 min-h-0">
        <DevSidebar activeNav={activeNav} onNavChange={setActiveNav} />

        <ScrollArea className="flex-1">
          <Flex direction="col" className="p-8">
            <Content />
          </Flex>
        </ScrollArea>
      </Flex>

    </Flex>
  );
}
