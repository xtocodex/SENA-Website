import { useState, useEffect, useMemo } from 'react';
import { Coins, Minus, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flex, Box, Grid } from "@/components/ui/layout";
import { createCouponRequest } from "@/lib/rewards";

export default function RedeemModal({ brand, user, player, open, onClose }) {
  const denominations = useMemo(() => brand?.denominations || [], [brand]);
  const available = brand?.availableCoupons ?? 0;

  const [denomIndex, setDenomIndex] = useState('0');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDenomIndex('0');
      setQuantity(1);
      setSubmitting(false);
    }
  }, [open, brand?.id]);

  const denomination = denominations[Number(denomIndex)] || null;
  const coins = player?.coins ?? 0; // balance from the verified game account (single coins source)
  const coinCost = denomination ? (denomination.coinCost || 0) * quantity : 0;

  const maxByStock = Math.max(1, available);
  const insufficientCoins = coinCost > coins;
  const outOfStock = available <= 0;
  const exceedsStock = quantity > available;
  const canSubmit = denomination && quantity >= 1 && !insufficientCoins && !outOfStock && !exceedsStock && !submitting;

  const clampQty = (n) => Math.min(Math.max(1, n), maxByStock);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createCouponRequest(user, brand, denomination, quantity);
      toast.success(`Redemption request placed for ${brand.name}. Track it under My Requests.`);
      onClose();
    } catch (err) {
      toast.error(`Could not place request: ${err.message}`);
      setSubmitting(false);
    }
  };

  if (!brand) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="" className="w-6 h-6 rounded object-contain bg-muted" />
            ) : null}
            Redeem {brand.name} coupon
          </DialogTitle>
          <DialogDescription>
            {available} of {brand.totalCoupons ?? 0} coupons available
          </DialogDescription>
        </DialogHeader>

        {outOfStock ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This brand is currently out of coupons. Please check back later.</AlertDescription>
          </Alert>
        ) : (
          <Flex direction="col" className="gap-4 pt-1">
            {/* Denomination */}
            <Box className="space-y-2">
              <Label>Coupon amount</Label>
              <Select value={denomIndex} onValueChange={setDenomIndex}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an amount" />
                </SelectTrigger>
                <SelectContent>
                  {denominations.map((d, i) => (
                    <SelectItem key={i} value={String(i)}>
                      ₹{Number(d.value).toLocaleString()} — {Number(d.coinCost).toLocaleString()} coins
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Box>

            {/* Quantity */}
            <Box className="space-y-2">
              <Label>Quantity</Label>
              <Flex align="center" className="gap-2">
                <Button
                  type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0"
                  onClick={() => setQuantity((q) => clampQty(q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Flex align="center" justify="center" className="h-9 flex-1 rounded-md border border-input bg-background text-sm font-medium tabular-nums">
                  {quantity}
                </Flex>
                <Button
                  type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0"
                  onClick={() => setQuantity((q) => clampQty(q + 1))}
                  disabled={quantity >= maxByStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </Flex>
            </Box>

            {/* Cost summary */}
            <Box className="rounded-lg border border-border bg-card p-4">
              <Grid gap={2} className="grid-cols-2">
                <span className="text-xs text-muted-foreground">Coins to deduct</span>
                <Flex align="center" justify="end" className="gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-sm font-semibold text-foreground tabular-nums">{coinCost.toLocaleString()}</span>
                </Flex>
                <span className="text-xs text-muted-foreground">Your balance</span>
                <span className="text-right text-xs text-muted-foreground tabular-nums">{coins.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">Balance after</span>
                <span className="text-right text-xs font-medium text-foreground tabular-nums">
                  {(coins - coinCost).toLocaleString()}
                </span>
              </Grid>
            </Box>

            {insufficientCoins && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>You don't have enough coins for this redemption.</AlertDescription>
              </Alert>
            )}

            <span className="text-[11px] text-muted-foreground">
              On approval, your coupon code will be sent to your registered email within 24–48 hours.
            </span>

            <Flex justify="end" className="gap-2 pt-1">
              <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Place Request
              </Button>
            </Flex>
          </Flex>
        )}
      </DialogContent>
    </Dialog>
  );
}
