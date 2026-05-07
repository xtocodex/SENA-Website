import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layers } from "lucide-react";
import { Flex } from "@/components/ui/layout";
import { useAuth } from "@/context/AuthContext";

export default function BrandTopBar() {
  const { session } = useAuth();
  
  const brandName = session?.brandName || '';
  const email = session?.email || '';
  const initials = brandName ? brandName.slice(0, 2).toUpperCase() : '';
  return (
    /**
     * This is a SHARED header row that spans sidebar + main area.
     * It is rendered ABOVE the sidebar/content split in BrandDashboard.
     * This ensures the h-16 border-b is pixel-perfect across the full width,
     * eliminating the T-junction misalignment.
     */
    <Flex
      align="center"
      className="h-16 w-full border-b border-border bg-card shrink-0"
    >
      {/* ── Wordmark cell (mirrors sidebar width exactly) ── */}
      <Flex
        align="center"
        className="w-60 shrink-0 gap-2.5 px-5 h-full border-r border-border"
      >
        <Flex
          align="center"
          justify="center"
          className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20"
        >
          <Layers className="w-4 h-4 text-primary" />
        </Flex>
        <span className="text-base font-semibold tracking-tight text-foreground">SENA</span>
      </Flex>

      {/* ── Main content header ── */}
      <Flex align="center" justify="end" className="flex-1 px-6 h-full">

        {/* User pill */}
        <Flex align="center" className="gap-3">
          <Flex direction="col" align="end" className="gap-0.5">
            <span className="text-xs font-medium text-foreground leading-none">
              {brandName}
            </span>
            <span className="text-[11px] text-muted-foreground leading-none">
              {email}
            </span>
          </Flex>

          <Separator orientation="vertical" className="h-8" />

          <Flex align="center" className="gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
              Brand
            </Badge>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}