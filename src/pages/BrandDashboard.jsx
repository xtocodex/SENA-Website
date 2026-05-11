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

      {/* ── Shared header row (spans full width — fixes border alignment) ── */}
      <BrandTopBar />

      {/* ── Body: sidebar + content side-by-side ── */}
      <Flex className="flex-1 min-h-0">
        <BrandSidebar activeNav={activeNav} onNavChange={setActiveNav} />

        {/* Main content */}
        <ScrollArea className="flex-1">
          <Flex direction="col" className="p-8">
            <Content />
          </Flex>
        </ScrollArea>
      </Flex>

    </Flex>
  );
}
