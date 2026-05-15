import {
  Building2,
  ImagePlus,
  FolderGit2,
  LogOut,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flex, Box } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import { logout } from "@/context/AuthContext";

const NAV_ITEMS = [
  { id: 'manage-brands',    label: 'Manage Brands',      icon: Building2  },
  { id: 'browse-media',     label: 'Browse Brand Media', icon: ImagePlus  },
  { id: 'my-collections',   label: 'My Collections',     icon: FolderGit2 },
];

export default function DevSidebar({ activeNav, onNavChange, sidebarOpen, onClose }) {
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
        <Flex direction="col" className="gap-1 px-3">
          <Box className="px-2 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Admin
            </span>
          </Box>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeNav === id ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start gap-3 font-normal",
                activeNav === id && "text-foreground font-medium"
              )}
              onClick={() => handleNav(id)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Button>
          ))}
        </Flex>
      </ScrollArea>

      <Flex direction="col" className="px-3 pb-4 gap-2 shrink-0">
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 font-normal text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </Button>
      </Flex>
    </Flex>
  );
}
