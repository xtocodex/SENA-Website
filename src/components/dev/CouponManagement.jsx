import { Ticket, Gift } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Flex } from "@/components/ui/layout";
import CouponRequests from "@/components/dev/CouponRequests";
import RewardBrands from "@/components/dev/RewardBrands";

export default function CouponManagement() {
  return (
    <Flex direction="col" className="gap-5">
      <h2 className="text-lg font-semibold text-foreground">Coupon Management</h2>

      <Tabs defaultValue="requests">
        <TabsList className="mb-4">
          <TabsTrigger value="requests" className="gap-2">
            <Ticket className="w-3 h-3" aria-hidden="true" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="brands" className="gap-2">
            <Gift className="w-3 h-3" aria-hidden="true" />
            Reward Brands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests"><CouponRequests /></TabsContent>
        <TabsContent value="brands"><RewardBrands /></TabsContent>
      </Tabs>
    </Flex>
  );
}
