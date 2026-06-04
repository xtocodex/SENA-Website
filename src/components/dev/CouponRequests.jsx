import { useState, useEffect } from 'react';
import {
  Clock, CheckCircle, XCircle, Coins, Ticket, Mail, Calendar, Loader2, Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Flex, Grid, Box } from "@/components/ui/layout";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from '@/context/AuthContext';
import {
  subscribeAllCouponRequests, approveCouponRequest, rejectCouponRequest,
} from '@/lib/rewards';

const DEFAULT_APPROVE_MESSAGE =
  'Approved — you will receive the coupon at your registered email address within 24–48 hours.';

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

function SkeletonGrid() {
  return (
    <Grid gap={3} className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card animate-pulse p-4 h-40" />
      ))}
    </Grid>
  );
}

function EmptyState({ tab }) {
  const messages = {
    pending:  'No pending redemption requests.',
    approved: 'No approved requests yet.',
    rejected: 'No rejected requests.',
  };
  return (
    <Flex direction="col" align="center" justify="center" className="py-24 gap-2">
      <Inbox className="w-6 h-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{messages[tab]}</span>
    </Flex>
  );
}

function RequestCard({ req, onView }) {
  return (
    <Flex
      direction="col"
      className="rounded-xl border border-border bg-card p-4 gap-3 cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => onView(req)}
    >
      <Flex align="start" justify="between" className="gap-2">
        <Flex direction="col" className="gap-0.5 min-w-0">
          <span className="text-sm font-medium text-foreground truncate">{req.userName || '—'}</span>
          <span className="text-xs text-muted-foreground truncate">{req.userEmail}</span>
        </Flex>
        <StatusBadge status={req.status} />
      </Flex>

      <Flex direction="col" className="gap-1">
        <Flex align="center" className="gap-1.5 text-xs text-muted-foreground">
          <Ticket className="w-3 h-3 shrink-0" />
          <span className="truncate">{req.brandName} · ₹{Number(req.denomination).toLocaleString()} × {req.quantity}</span>
        </Flex>
        <Flex align="center" className="gap-1.5 text-xs text-muted-foreground">
          <Coins className="w-3 h-3 shrink-0 text-amber-500" />
          <span className="tabular-nums">{Number(req.coinCost).toLocaleString()} coins</span>
        </Flex>
        <Flex align="center" className="gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0" />
          <span className="truncate">{formatDate(req.createdAt)}</span>
        </Flex>
      </Flex>

      <Flex justify="end" className="pt-1">
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onView(req); }}>
          Review →
        </Button>
      </Flex>
    </Flex>
  );
}

function ReviewDialog({ req, onClose, onApprove, onReject, processing }) {
  const [message, setMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setMessage(req?.status === 'pending' ? DEFAULT_APPROVE_MESSAGE : '');
    setConfirmAction(null);
  }, [req?.id, req?.status]);

  if (!req) return null;

  const canReject = message.trim().length > 0;

  const handleConfirm = async () => {
    if (confirmAction === 'approve') await onApprove(req, message.trim() || DEFAULT_APPROVE_MESSAGE);
    else if (confirmAction === 'reject') await onReject(req, message.trim());
    setConfirmAction(null);
  };

  return (
    <>
      <Dialog open={!!req} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              {req.brandName} coupon
            </DialogTitle>
            <DialogDescription>
              Requested {formatDate(req.createdAt)} · <StatusBadge status={req.status} />
            </DialogDescription>
          </DialogHeader>

          <Flex direction="col" className="gap-4 pt-2">
            <Box className="rounded-lg border border-border bg-card p-4">
              <Flex direction="col" className="gap-3">
                <Flex direction="col" className="gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Player</span>
                  <span className="text-sm text-foreground">{req.userName}</span>
                  <Flex align="center" className="gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground">{req.userEmail}</span>
                  </Flex>
                </Flex>

                <Separator />

                <Grid gap={2} className="grid-cols-2">
                  <span className="text-xs text-muted-foreground">Coupon amount</span>
                  <span className="text-right text-xs text-foreground">₹{Number(req.denomination).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Quantity</span>
                  <span className="text-right text-xs text-foreground">{req.quantity}</span>
                  <span className="text-xs text-muted-foreground">Coins to deduct</span>
                  <Flex align="center" justify="end" className="gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-foreground tabular-nums">{Number(req.coinCost).toLocaleString()}</span>
                  </Flex>
                </Grid>
              </Flex>
            </Box>

            {req.status === 'pending' ? (
              <Box className="rounded-lg border border-border bg-card p-4">
                <Flex direction="col" className="gap-3">
                  <Flex direction="col" className="gap-1.5">
                    <span className="text-xs font-medium text-foreground">Message to the player</span>
                    <span className="text-[10px] text-muted-foreground">Shown on approval · Required for rejection. Settle coins manually under Players.</span>
                  </Flex>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a message the player will see…"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                  <Flex justify="end" className="gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      disabled={!canReject || processing}
                      onClick={() => setConfirmAction('reject')}
                    >
                      <XCircle className="w-4 h-4" />
                      Deny
                    </Button>
                    <Button disabled={processing} onClick={() => setConfirmAction('approve')}>
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ) : (
              <Box className="rounded-lg border border-border bg-card p-4">
                <Flex direction="col" className="gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Processed</span>
                  <Flex justify="between" className="gap-2 flex-wrap">
                    <span className="text-xs text-foreground">{formatDate(req.processedAt)}</span>
                    {req.processedBy && <span className="text-xs text-muted-foreground">by {req.processedBy}</span>}
                  </Flex>
                  {req.message && (
                    <Box className="pt-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Message</span>
                      <p className="text-xs text-foreground whitespace-pre-wrap mt-1">{req.message}</p>
                    </Box>
                  )}
                </Flex>
              </Box>
            )}
          </Flex>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmAction} onOpenChange={(o) => { if (!o) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'approve' ? 'Approve this redemption?' : 'Deny this redemption?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'approve'
                ? `${req.userName} will see your message. Remember to deduct ${Number(req.coinCost).toLocaleString()} coins under Players.`
                : `${req.userName} will see your message and no coins are affected.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={confirmAction === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {confirmAction === 'approve' ? 'Approve' : 'Deny'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function CouponRequests() {
  const { session } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsub = subscribeAllCouponRequests((rows) => {
      setRequests(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const byStatus = {
    pending:  requests.filter(r => r.status === 'pending'),
    approved: requests.filter(r => r.status === 'approved'),
    rejected: requests.filter(r => r.status === 'rejected'),
  };

  const viewingLive = viewing ? requests.find(r => r.id === viewing.id) || null : null;
  const reviewer = { name: session?.name || session?.email, id: session?.id, email: session?.email };

  const handleApprove = async (req, message) => {
    setProcessing(true);
    try {
      await approveCouponRequest(req, message, reviewer);
      toast.success(`Redemption for ${req.userName} approved.`);
      setViewing(null);
    } catch (err) {
      toast.error(`Approval failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (req, message) => {
    setProcessing(true);
    try {
      await rejectCouponRequest(req, message, reviewer);
      toast.success(`Redemption for ${req.userName} denied.`);
      setViewing(null);
    } catch (err) {
      toast.error(`Denial failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const renderTab = (items, tab) => {
    if (loading) return <SkeletonGrid />;
    if (!items.length) return <EmptyState tab={tab} />;
    return (
      <Grid gap={3} className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => <RequestCard key={r.id} req={r} onView={setViewing} />)}
      </Grid>
    );
  };

  const tabTrigger = (value, Icon, label, count) => (
    <TabsTrigger value={value} className="gap-2">
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
      {!loading && (
        <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">{count}</Badge>
      )}
    </TabsTrigger>
  );

  return (
    <Flex direction="col" className="gap-5">
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          {tabTrigger('pending', Clock, 'Pending', byStatus.pending.length)}
          {tabTrigger('approved', CheckCircle, 'Approved', byStatus.approved.length)}
          {tabTrigger('rejected', XCircle, 'Rejected', byStatus.rejected.length)}
        </TabsList>

        <TabsContent value="pending">{renderTab(byStatus.pending, 'pending')}</TabsContent>
        <TabsContent value="approved">{renderTab(byStatus.approved, 'approved')}</TabsContent>
        <TabsContent value="rejected">{renderTab(byStatus.rejected, 'rejected')}</TabsContent>
      </Tabs>

      <ReviewDialog
        req={viewingLive}
        onClose={() => setViewing(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        processing={processing}
      />

      {processing && (
        <Flex align="center" justify="center" className="fixed inset-0 bg-background/50 z-50 pointer-events-none">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </Flex>
      )}
    </Flex>
  );
}
