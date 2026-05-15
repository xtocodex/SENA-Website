import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flex } from "@/components/ui/layout";
import BrandSidebar from "@/components/brand/BrandSidebar";
import BrandTopBar from "@/components/brand/BrandTopBar";
import UploadZone from "@/components/brand/UploadZone";
import MediaGallery from "@/components/brand/MediaGallery";
import { useAuth } from "@/context/AuthContext";

export default function BrandDashboard() {
  const [activeNav, setActiveNav] = useState('upload-images');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session } = useAuth();

  const CONTENT_MAP = {
    'upload-images': () => <UploadZone type="image" />,
    'upload-videos': () => <UploadZone type="video" />,
    'my-images': () => <MediaGallery type="image" brandId={session?.id} />,
    'my-videos': () => <MediaGallery type="video" brandId={session?.id} />,
  };

  const Content = CONTENT_MAP[activeNav] ?? (() => null);

  return (
    <Flex direction="col" className="h-screen w-full overflow-hidden bg-background">

      <BrandTopBar
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(v => !v)}
      />

      <Flex className="flex-1 min-h-0 relative">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <BrandSidebar
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
