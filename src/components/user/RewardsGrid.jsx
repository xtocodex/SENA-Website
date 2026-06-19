import { useState, useEffect } from 'react';
import { Gift, Ticket, Coins } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Flex, Grid } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import { subscribeActiveRewardBrands } from "@/lib/rewards";
import RedeemModal from "@/components/user/RedeemModal";

function SkeletonGrid() {
  return (
    <Grid gap={4} className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-40" />
      ))}
    </Grid>
  );
}

function fromPrice(denominations) {
  if (!denominations?.length) return null;
  return Math.min(...denominations.map((d) => Number(d.coinCost) || 0));
}

function BrandCard({ brand, onRedeem }) {
  const available = brand.availableCoupons ?? 0;
  const total = brand.totalCoupons ?? 0;
  const outOfStock = available <= 0;
  const minCoins = fromPrice(brand.denominations);

  return (
    <Flex
      direction="col"
      className="hud-corners group relative overflow-hidden rounded-md border border-border bg-card p-5 gap-4 transition-colors duration-200 hover:border-primary/40"
    >
      <div aria-hidden="true" className="hud-stripes absolute inset-x-0 top-0 h-[3px] opacity-40 group-hover:opacity-90 transition-opacity" />
      <Flex align="start" justify="between" className="gap-3">
        <Flex align="center" className="gap-3 min-w-0">
          <Flex align="center" justify="center" className="w-11 h-11 rounded-md bg-muted border border-border overflow-hidden shrink-0">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
            ) : (
              <Gift className="w-5 h-5 text-muted-foreground" />
            )}
          </Flex>
          <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground truncate" title={brand.name}>
            {brand.name}
          </span>
        </Flex>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-display font-semibold tracking-wide shrink-0",
            outOfStock
              ? "bg-muted text-muted-foreground border border-border"
              : "bg-green-500/10 text-green-500 border border-green-500/20"
          )}
          title="Available / Total coupons"
        >
          <Ticket className="w-2.5 h-2.5" />
          {available}/{total}
        </span>
      </Flex>

      {minCoins != null && (
        <Flex align="center" className="gap-1.5 text-xs text-muted-foreground">
          <Coins className="w-3.5 h-3.5 text-primary" />
          From <span className="font-display font-semibold text-foreground tabular-nums">{minCoins.toLocaleString()}</span> coins
        </Flex>
      )}

      <Button
        className="w-full font-display font-semibold uppercase tracking-wider"
        variant={outOfStock ? "outline" : "default"}
        disabled={outOfStock}
        onClick={() => onRedeem(brand)}
      >
        {outOfStock ? 'Out of Stock' : 'Redeem'}
      </Button>
    </Flex>
  );
}

export default function RewardsGrid({ user, player }) {
  const [brands, setBrands] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const unsub = subscribeActiveRewardBrands(setBrands);
    return () => unsub();
  }, []);

  return (
    <Flex direction="col" className="gap-5">
      <Flex direction="col" className="gap-1">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">Supply Drops</h2>
        <span className="text-xs text-muted-foreground">
          Redeem your coins for coupons from our brand partners.
        </span>
      </Flex>

      {brands === null ? (
        <SkeletonGrid />
      ) : brands.length === 0 ? (
        <Flex direction="col" align="center" justify="center" className="py-24 gap-2">
          <Gift className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">No reward partners available yet.</span>
        </Flex>
      ) : (
        <Grid gap={4} className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <BrandCard key={b.id} brand={b} onRedeem={setActive} />
          ))}
        </Grid>
      )}

      <RedeemModal
        brand={active}
        user={user}
        player={player}
        open={!!active}
        onClose={() => setActive(null)}
      />
    </Flex>
  );
}
