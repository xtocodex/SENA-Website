import { useState, useEffect } from 'react';
import {
  Clock, CheckCircle, XCircle, Mail, Phone, MapPin, Package, FileText,
  Building2, Calendar, Loader2, Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { Flex, Grid, Box } from "@/components/ui/layout";
import { db } from '@/lib/firebase';
import {
  collection, onSnapshot, query, orderBy, doc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const STATUS_META = {
  pending:  { label: 'Pending',  Icon: Clock,       badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-400/20',  dotClass: 'bg-blue-400 animate-pulse' },
  approved: { label: 'Approved', Icon: CheckCircle, badgeClass: 'bg-green-500/10 text-green-500 border border-green-500/20', dotClass: 'bg-green-500' },
  rejected: { label: 'Rejected', Icon: XCircle,     badgeClass: 'bg-muted text-muted-foreground border border-border',     dotClass: 'bg-muted-foreground' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const { label, Icon, badgeClass, dotClass } = meta;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium', badgeClass)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClass)} aria-hidden="true" />
      <Icon className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

function SkeletonGrid() {
  return (
    <Grid gap={3} className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card animate-pulse p-4 h-44" />
      ))}
    </Grid>
  );
}

function EmptyState({ tab }) {
  const messages = {
    pending:  'No pending brand requests.',
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

function RequestCard({ request, onView }) {
  const imgCount = request.sampleImages?.length || 0;
  const vidCount = request.sampleVideos?.length || 0;
  return (
    <Flex
      direction="col"
      className="rounded-xl border border-border bg-card p-4 gap-3 cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => onView(request)}
    >
      <Flex align="start" justify="between" className="gap-2">
        <Flex direction="col" className="gap-0.5 min-w-0">
          <span className="text-sm font-medium text-foreground truncate" title={request.companyName}>
            {request.companyName || '—'}
          </span>
          <span className="text-xs text-muted-foreground truncate">{request.email}</span>
        </Flex>
        <StatusBadge status={request.status} />
      </Flex>

      <Flex direction="col" className="gap-1">
        <Flex align="center" className="gap-1.5 text-xs text-muted-foreground">
          <Phone className="w-3 h-3 shrink-0" />
          <span className="truncate">{request.phone || '—'}</span>
        </Flex>
        <Flex align="center" className="gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3 shrink-0" />
          <span className="truncate">Submitted {formatDate(request.createdAt)}</span>
        </Flex>
      </Flex>

      <Flex align="center" justify="between" className="gap-2 pt-1">
        <Flex align="center" className="gap-2">
          <Badge variant="secondary" className="text-[10px]">{imgCount} image{imgCount !== 1 ? 's' : ''}</Badge>
          <Badge variant="secondary" className="text-[10px]">{vidCount} video{vidCount !== 1 ? 's' : ''}</Badge>
        </Flex>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={(e) => { e.stopPropagation(); onView(request); }}>
          View Details →
        </Button>
      </Flex>
    </Flex>
  );
}

function SampleMediaGrid({ urls, kind, onExpand }) {
  if (!urls?.length) {
    return <span className="text-xs text-muted-foreground">None provided.</span>;
  }
  return (
    <Grid gap={2} className="w-full grid-cols-3 sm:grid-cols-4">
      {urls.map((url, i) => (
        <button
          key={url}
          type="button"
          className="rounded-md border border-border overflow-hidden bg-card group"
          onClick={() => onExpand({ url, kind })}
        >
          <AspectRatio ratio={1}>
            {kind === 'video' ? (
              <video src={url} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <img src={url} alt={`Sample ${i + 1}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </AspectRatio>
        </button>
      ))}
    </Grid>
  );
}

function ReviewDialog({ request, onClose, onApprove, onReject, processing }) {
  const [feedback, setFeedback] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'reject'
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    setFeedback('');
    setConfirmAction(null);
  }, [request?.id]);

  if (!request) return null;

  const canReject = feedback.trim().length > 0;

  const handleConfirm = async () => {
    if (confirmAction === 'approve') await onApprove(request, feedback.trim());
    else if (confirmAction === 'reject') await onReject(request, feedback.trim());
    setConfirmAction(null);
  };

  return (
    <>
      <Dialog open={!!request} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              {request.companyName}
            </DialogTitle>
            <DialogDescription>
              Submitted {formatDate(request.createdAt)} · <StatusBadge status={request.status} />
            </DialogDescription>
          </DialogHeader>

          <Flex direction="col" className="gap-4 pt-2">
            {/* Profile */}
            <Box className="rounded-lg border border-border bg-card p-4">
              <Flex direction="col" className="gap-3">
                <Flex direction="col" className="gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Contact</span>
                  <span className="text-sm text-foreground">{request.name}</span>
                </Flex>
                <Flex direction="col" className="gap-1">
                  <Flex align="center" className="gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground">{request.email}</span>
                  </Flex>
                  <Flex align="center" className="gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground">{request.phone}</span>
                  </Flex>
                  <Flex align="start" className="gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground">{request.address}</span>
                  </Flex>
                </Flex>

                <Separator />

                <Flex direction="col" className="gap-2">
                  <Flex align="center" className="gap-2">
                    <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Operating Products</span>
                  </Flex>
                  <span className="text-xs text-foreground whitespace-pre-wrap">{request.operatingProducts || '—'}</span>
                </Flex>

                <Flex direction="col" className="gap-2">
                  <Flex align="center" className="gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Additional Information</span>
                  </Flex>
                  <span className="text-xs text-foreground whitespace-pre-wrap">{request.additionalInfo || '—'}</span>
                </Flex>
              </Flex>
            </Box>

            {/* Sample media */}
            <Box className="rounded-lg border border-border bg-card p-4">
              <Flex direction="col" className="gap-3">
                <Flex direction="col" className="gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sample Images</span>
                  <SampleMediaGrid urls={request.sampleImages} kind="image" onExpand={setLightbox} />
                </Flex>
                <Flex direction="col" className="gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sample Videos</span>
                  <SampleMediaGrid urls={request.sampleVideos} kind="video" onExpand={setLightbox} />
                </Flex>
              </Flex>
            </Box>

            {/* Previous feedback (if resubmitted after rejection) */}
            {request.status === 'rejected' && request.feedback && (
              <Box className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <Flex direction="col" className="gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-destructive">Previous Feedback</span>
                  <span className="text-xs text-foreground whitespace-pre-wrap">{request.feedback}</span>
                </Flex>
              </Box>
            )}

            {/* Decision (only for pending) */}
            {request.status === 'pending' && (
              <Box className="rounded-lg border border-border bg-card p-4">
                <Flex direction="col" className="gap-3">
                  <Flex direction="col" className="gap-1.5">
                    <span className="text-xs font-medium text-foreground">Feedback for the brand</span>
                    <span className="text-[10px] text-muted-foreground">Optional for approval · Required for rejection</span>
                  </Flex>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share any notes the brand should see…"
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
                      Reject
                    </Button>
                    <Button
                      disabled={processing}
                      onClick={() => setConfirmAction('approve')}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            )}

            {request.status !== 'pending' && (
              <Box className="rounded-lg border border-border bg-card p-4">
                <Flex direction="col" className="gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Reviewed</span>
                  <Flex justify="between" className="gap-2 flex-wrap">
                    <span className="text-xs text-foreground">{formatDate(request.reviewedAt)}</span>
                    {request.reviewedBy && <span className="text-xs text-muted-foreground">by {request.reviewedBy}</span>}
                  </Flex>
                  {request.feedback && (
                    <Box className="pt-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Feedback</span>
                      <p className="text-xs text-foreground whitespace-pre-wrap mt-1">{request.feedback}</p>
                    </Box>
                  )}
                </Flex>
              </Box>
            )}
          </Flex>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!lightbox} onOpenChange={(o) => { if (!o) setLightbox(null); }}>
        <DialogContent className="max-w-3xl p-2 bg-card border-border">
          {lightbox && (
            <Box className="w-full relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {lightbox.kind === 'video' ? (
                <video src={lightbox.url} className="w-full max-h-[70vh] object-contain" controls autoPlay />
              ) : (
                <img src={lightbox.url} alt="Sample" className="w-full max-h-[70vh] object-contain" />
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(o) => { if (!o) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'approve' ? 'Approve this brand?' : 'Reject this request?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'approve'
                ? `This will create an approved brand account for ${request.companyName} and notify them immediately.`
                : `${request.companyName} will see your feedback and can resubmit. This action is recorded.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={confirmAction === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {confirmAction === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function BrandRequests() {
  const { session } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'brand_requests'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => {
      setRequests([]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const byStatus = {
    pending:  requests.filter(r => r.status === 'pending'),
    approved: requests.filter(r => r.status === 'approved'),
    rejected: requests.filter(r => r.status === 'rejected'),
  };

  // Keep viewing target in sync with latest snapshot
  const viewingLive = viewing ? requests.find(r => r.id === viewing.id) || null : null;

  const handleApprove = async (request, feedback) => {
    setProcessing(true);
    try {
      const reviewer = {
        reviewedBy:   session?.name  || session?.email || 'Unknown',
        reviewedById: session?.id    || null,
        reviewedAt:   serverTimestamp(),
      };
      await setDoc(doc(db, 'brands', request.uid), {
        uid:               request.uid,
        name:              request.name,
        brandName:         request.companyName,
        companyName:       request.companyName,
        email:             request.email,
        phone:             request.phone,
        address:           request.address,
        operatingProducts: request.operatingProducts,
        additionalInfo:    request.additionalInfo,
        sampleImages:      request.sampleImages || [],
        sampleVideos:      request.sampleVideos || [],
        status:            'approved',
        feedback:          feedback || '',
        role:              'brand',
        createdAt:         serverTimestamp(),
        approvedBy:        reviewer.reviewedBy,
        approvedById:      reviewer.reviewedById,
        requestedAt:       request.createdAt || null,
      });
      await updateDoc(doc(db, 'brand_requests', request.uid), {
        status:   'approved',
        feedback: feedback || '',
        ...reviewer,
      });
      toast.success(`${request.companyName} approved.`);
      setViewing(null);
    } catch (err) {
      toast.error(`Approval failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request, feedback) => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'brand_requests', request.uid), {
        status:       'rejected',
        feedback,
        reviewedBy:   session?.name  || session?.email || 'Unknown',
        reviewedById: session?.id    || null,
        reviewedAt:   serverTimestamp(),
      });
      toast.success(`${request.companyName} rejected.`);
      setViewing(null);
    } catch (err) {
      toast.error(`Rejection failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const renderTab = (items, tab) => {
    if (loading) return <SkeletonGrid />;
    if (!items.length) return <EmptyState tab={tab} />;
    return (
      <Grid gap={3} className="w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => <RequestCard key={r.id} request={r} onView={setViewing} />)}
      </Grid>
    );
  };

  return (
    <Flex direction="col" className="gap-5">
      <Flex align="start" justify="between" className="gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">Brand Requests</h2>
      </Flex>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-3 h-3" aria-hidden="true" />
            Pending
            {!loading && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">
                {byStatus.pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="w-3 h-3" aria-hidden="true" />
            Approved
            {!loading && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">
                {byStatus.approved.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="w-3 h-3" aria-hidden="true" />
            Rejected
            {!loading && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">
                {byStatus.rejected.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">{renderTab(byStatus.pending, 'pending')}</TabsContent>
        <TabsContent value="approved">{renderTab(byStatus.approved, 'approved')}</TabsContent>
        <TabsContent value="rejected">{renderTab(byStatus.rejected, 'rejected')}</TabsContent>
      </Tabs>

      <ReviewDialog
        request={viewingLive}
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
