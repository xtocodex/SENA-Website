import { useState, useEffect } from 'react';
import { Ticket, Coins, MessageSquare } from 'lucide-react';
import { Flex, Grid, Box } from "@/components/ui/layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { subscribeUserRequests } from "@/lib/rewards";

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

function SkeletonGrid() {
  return (
    <Grid gap={3} className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-36" />
      ))}
    </Grid>
  );
}

function RequestCard({ req }) {
  return (
    <Flex direction="col" className="rounded-xl border border-border bg-card p-4 gap-3">
      <Flex align="start" justify="between" className="gap-2">
        <Flex direction="col" className="gap-0.5 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{req.brandName}</span>
          <span className="text-xs text-muted-foreground">
            ₹{Number(req.denomination).toLocaleString()} × {req.quantity}
          </span>
        </Flex>
        <StatusBadge status={req.status} />
      </Flex>

      <Flex align="center" className="gap-1.5 text-xs text-muted-foreground">
        <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="tabular-nums">{Number(req.coinCost).toLocaleString()} coins</span>
        <span className="ml-auto">{formatDate(req.createdAt)}</span>
      </Flex>

      {req.message && (
        <Box className="rounded-lg border border-border bg-background p-3">
          <Flex align="start" className="gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-xs text-foreground whitespace-pre-wrap">{req.message}</span>
          </Flex>
        </Box>
      )}
    </Flex>
  );
}

export default function MyRequests({ user }) {
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeUserRequests(user.id, setRequests);
    return () => unsub();
  }, [user?.id]);

  return (
    <Flex direction="col" className="gap-5">
      <Flex direction="col" className="gap-1">
        <h2 className="text-lg font-semibold text-foreground">My Requests</h2>
        <span className="text-xs text-muted-foreground">
          Track the status of your coupon redemptions.
        </span>
      </Flex>

      {requests === null ? (
        <SkeletonGrid />
      ) : requests.length === 0 ? (
        <Flex direction="col" align="center" justify="center" className="py-24 gap-2">
          <Ticket className="w-6 h-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">You haven't redeemed any coupons yet.</span>
        </Flex>
      ) : (
        <Grid gap={3} className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => <RequestCard key={r.id} req={r} />)}
        </Grid>
      )}
    </Flex>
  );
}
