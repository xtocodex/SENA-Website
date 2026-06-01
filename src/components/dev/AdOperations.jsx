import { useState, useEffect } from 'react';
import { LayoutGrid, List, Clock, XCircle, RadioTower, UserCircle, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import { Flex, Grid, Box } from "@/components/ui/layout";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { PLACEMENT_LABELS, TYPE_LABELS, PROJECT_LABELS, today } from '@/lib/adConstants';

// ─── MOCK — set false when done reviewing ────────────────────
const USE_MOCK = false;

const MOCK_OPS = [
  // ── RUNNING (today 2026-05-18 is between opStart and opEnd) ──
  {
    id: 'op-1', format: 'image', brandId: 'brand-1', brandName: 'Nike',
    fileName: 'nike_air_banner.jpg',
    url: 'https://picsum.photos/seed/nike1/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/nike1/400/400',
    adPlacements: ['in-map', 'ui-board'], adType: 'product-based', project: 'sena',
    adStartDate: '2026-05-01', adEndDate: '2026-05-31',
    opStartDate: '2026-05-01', opEndDate: '2026-05-31',
    runnedBy: 'Alex Admin', runnedAt: '2026-04-28',
  },
  {
    id: 'op-2', format: 'image', brandId: 'brand-2', brandName: 'Adidas',
    fileName: 'adidas_ultraboost.png',
    url: 'https://picsum.photos/seed/adidas2/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/adidas2/400/400',
    adPlacements: ['interactive'], adType: 'product-based', project: 'sena',
    adStartDate: '2026-05-10', adEndDate: '2026-05-25',
    opStartDate: '2026-05-10', opEndDate: '2026-05-25',
    runnedBy: 'Sarah Dev', runnedAt: '2026-05-09',
  },
  // ── UPCOMING (opStart > today) ──
  {
    id: 'op-3', format: 'image', brandId: 'brand-3', brandName: 'Puma',
    fileName: 'puma_q3_campaign.png',
    url: 'https://picsum.photos/seed/puma6/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/puma6/400/400',
    adPlacements: ['ui-board', 'interactive'], adType: 'software-based', project: 'option3',
    adStartDate: '2026-06-15', adEndDate: '2026-07-15',
    opStartDate: '2026-06-15', opEndDate: '2026-07-15',
    runnedBy: 'Alex Admin', runnedAt: '2026-05-15',
  },
  {
    id: 'op-4', format: 'image', brandId: 'brand-1', brandName: 'Nike',
    fileName: 'nike_back_to_school.jpg',
    url: 'https://picsum.photos/seed/nike7/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/nike7/400/400',
    adPlacements: ['in-map', 'ui-board', 'interactive'], adType: 'product-based', project: 'sena',
    adStartDate: '2026-07-01', adEndDate: '2026-08-31',
    opStartDate: '2026-07-01', opEndDate: '2026-08-31',
    runnedBy: 'Sarah Dev', runnedAt: '2026-05-17',
  },
  // ── EXPIRED (opEnd < today) ──
  {
    id: 'op-5', format: 'image', brandId: 'brand-2', brandName: 'Adidas',
    fileName: 'adidas_spring_sale.jpg',
    url: 'https://picsum.photos/seed/adidas8/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/adidas8/400/400',
    adPlacements: ['ui-board'], adType: 'product-based', project: 'sena',
    adStartDate: '2026-03-01', adEndDate: '2026-03-31',
    opStartDate: '2026-03-01', opEndDate: '2026-03-31',
    runnedBy: 'Alex Admin', runnedAt: '2026-02-25',
  },
  {
    id: 'op-6', format: 'image', brandId: 'brand-3', brandName: 'Puma',
    fileName: 'puma_new_year_promo.png',
    url: 'https://picsum.photos/seed/puma9/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/puma9/400/400',
    adPlacements: ['interactive', 'in-map'], adType: 'other', project: 'option2',
    adStartDate: '2026-01-01', adEndDate: '2026-01-31',
    opStartDate: '2026-01-01', opEndDate: '2026-01-31',
    runnedBy: 'Sarah Dev', runnedAt: '2025-12-28',
  },
];

// ─── status helpers (uses operational dates) ──────────────────

function getOpStatus(item) {
  if (item.status === 'suspended') return 'suspended';
  if (!item.opStartDate || !item.opEndDate) return 'upcoming';
  const start = new Date(item.opStartDate + 'T00:00:00');
  const end   = new Date(item.opEndDate   + 'T00:00:00');
  const now   = today();
  if (now > end)    return 'expired';
  if (now >= start) return 'running';
  return 'upcoming';
}

const STATUS_META = {
  running: {
    label:      'Running',
    Icon:       RadioTower,
    badgeClass: 'bg-green-500/10 text-green-500 border border-green-500/20',
    dotClass:   'bg-green-500 animate-pulse',
  },
  upcoming: {
    label:      'Upcoming',
    Icon:       Clock,
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-400/20',
    dotClass:   'bg-blue-400',
  },
  expired: {
    label:      'Expired',
    Icon:       XCircle,
    badgeClass: 'bg-muted text-muted-foreground border border-border',
    dotClass:   'bg-muted-foreground',
  },
  suspended: {
    label:      'Suspended',
    Icon:       Ban,
    badgeClass: 'bg-destructive/10 text-destructive border border-destructive/20',
    dotClass:   'bg-destructive',
  },
};

function StatusBadge({ status }) {
  const { label, Icon, badgeClass, dotClass } = STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium', badgeClass)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClass)} aria-hidden="true" />
      <Icon className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

// ─── skeleton ────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <Grid gap={3} className="w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card animate-pulse">
          <div className="aspect-square bg-muted rounded-t-xl" />
          <div className="p-3 flex flex-col gap-2">
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded w-1/2" />
            <div className="h-2 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </Grid>
  );
}

// ─── ops card ────────────────────────────────────────────────

function OpsCard({ item, onExpand, onSuspend }) {
  const [loaded,  setLoaded]  = useState(false);
  const [hovered, setHovered] = useState(false);
  const status  = getOpStatus(item);
  const isVideo = item.format === 'video';
  const canSuspend = status === 'running';

  return (
    <Flex
      direction="col"
      className="rounded-xl border border-border overflow-hidden bg-card group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onExpand(item)}
    >
      <AspectRatio ratio={1}>
        {!loaded && <div className="absolute inset-0 bg-muted animate-pulse" />}

        {isVideo ? (
          item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt={item.fileName} loading="lazy"
              className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
              onLoad={() => setLoaded(true)} />
          ) : (
            <video src={item.url} muted playsInline preload="metadata"
              className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
              onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
              onSeeked={() => setLoaded(true)} />
          )
        ) : (
          <img src={item.thumbnailUrl || item.url} alt={item.fileName} loading="lazy"
            className={cn('absolute inset-0 w-full h-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
            onLoad={() => setLoaded(true)} />
        )}

        {/* Hover overlay */}
        <Flex align="center" justify="center"
          className={cn('absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-150', hovered ? 'opacity-100' : 'opacity-0')}>
          <span className="text-xs text-foreground font-medium">View</span>
        </Flex>

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={status} />
        </div>
      </AspectRatio>

      <Flex direction="col" className="gap-2 p-3">
        <Flex direction="col" className="gap-0.5">
          <span className="text-xs font-medium text-foreground truncate" title={item.fileName}>
            {item.fileName}
          </span>
          <span className="text-[10px] text-muted-foreground">{item.brandName}</span>
        </Flex>

        {item.adPlacements?.length > 0 && (
          <Flex className="flex-wrap gap-1">
            {item.adPlacements.map(p => (
              <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                {PLACEMENT_LABELS[p] ?? p}
              </Badge>
            ))}
          </Flex>
        )}

        <Flex className="flex-wrap gap-1">
          {item.adType && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
              {TYPE_LABELS[item.adType] ?? item.adType}
            </Badge>
          )}
          {item.project && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 uppercase">
              {PROJECT_LABELS[item.project] ?? item.project}
            </Badge>
          )}
        </Flex>

        {(item.opStartDate || item.opEndDate) && (
          <span className="text-[9px] text-muted-foreground">
            {item.opStartDate} → {item.opEndDate}
          </span>
        )}

        {/* Scheduled by */}
        {item.runnedBy && (
          <Flex align="center" className="gap-1 mt-0.5">
            <UserCircle className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden="true" />
            <span className="text-[9px] text-muted-foreground truncate">
              {item.runnedBy}
            </span>
          </Flex>
        )}

        {status === 'suspended' && item.suspendedBy && (
          <Flex align="center" className="gap-1">
            <Ban className="w-3 h-3 text-destructive shrink-0" aria-hidden="true" />
            <span className="text-[9px] text-destructive truncate">
              Suspended by {item.suspendedBy}
            </span>
          </Flex>
        )}

        {canSuspend && (
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5 mt-0.5 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={(e) => { e.stopPropagation(); onSuspend(item); }}
            aria-label={`Suspend ${item.fileName}`}
          >
            <Ban className="w-3.5 h-3.5" />
            Suspend
          </Button>
        )}
      </Flex>
    </Flex>
  );
}

// ─── ops table row ───────────────────────────────────────────

function OpsTableRow({ item, onSuspend }) {
  const status  = getOpStatus(item);
  const isVideo = item.format === 'video';
  const canSuspend = status === 'running';

  return (
    <TableRow>
      <TableCell className="w-12 p-2">
        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
          {isVideo ? (
            <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
          ) : (
            <img src={item.thumbnailUrl || item.url} alt={item.fileName} className="w-full h-full object-cover" />
          )}
        </div>
      </TableCell>

      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{item.brandName}</TableCell>

      <TableCell className="text-xs font-medium max-w-[140px]">
        <span className="truncate block" title={item.fileName}>{item.fileName}</span>
      </TableCell>

      <TableCell>
        <Flex className="flex-wrap gap-1">
          {item.adPlacements?.map(p => (
            <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 whitespace-nowrap">
              {PLACEMENT_LABELS[p] ?? p}
            </Badge>
          ))}
        </Flex>
      </TableCell>

      <TableCell className="text-xs text-foreground whitespace-nowrap">
        {TYPE_LABELS[item.adType] ?? item.adType ?? '—'}
      </TableCell>

      <TableCell className="text-xs text-foreground whitespace-nowrap">
        {PROJECT_LABELS[item.project] ?? item.project ?? '—'}
      </TableCell>

      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{item.opStartDate ?? '—'}</TableCell>
      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{item.opEndDate ?? '—'}</TableCell>

      <TableCell><StatusBadge status={status} /></TableCell>

      <TableCell>
        <Flex align="center" className="gap-1.5">
          <UserCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
          <Flex direction="col">
            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.runnedBy ?? '—'}</span>
            {status === 'suspended' && item.suspendedBy && (
              <span className="text-[10px] text-destructive whitespace-nowrap">Suspended by {item.suspendedBy}</span>
            )}
          </Flex>
        </Flex>
      </TableCell>

      <TableCell>
        {canSuspend ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-7 px-2 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => onSuspend(item)}
            aria-label={`Suspend ${item.fileName}`}
          >
            <Ban className="w-3 h-3" />
            Suspend
          </Button>
        ) : <span className="text-xs text-muted-foreground">—</span>}
      </TableCell>
    </TableRow>
  );
}

// ─── empty state ─────────────────────────────────────────────

function EmptyState({ tab }) {
  const messages = {
    running:   'No ADs currently running.',
    upcoming:  'No upcoming operations scheduled.',
    expired:   'No expired operations found.',
    suspended: 'No suspended operations.',
  };
  return (
    <Flex direction="col" align="center" justify="center" className="py-24 gap-2">
      <span className="text-sm text-muted-foreground">{messages[tab]}</span>
    </Flex>
  );
}

// ─── main component ───────────────────────────────────────────

export default function AdOperations() {
  const { session } = useAuth();
  const [allOps,   setAllOps]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState('grid');
  const [brandFilter,     setBrandFilter]     = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [typeFilter,      setTypeFilter]      = useState('all');
  const [projectFilter,   setProjectFilter]   = useState('all');
  const [lightboxItem,    setLightboxItem]    = useState(null);
  const [suspendTarget,   setSuspendTarget]   = useState(null);
  const [suspending,      setSuspending]      = useState(false);

  useEffect(() => {
    if (USE_MOCK) {
      setAllOps(MOCK_OPS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'adOperations'), orderBy('runnedAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAllOps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        setAllOps([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    setSuspending(true);
    try {
      await updateDoc(doc(db, 'adOperations', suspendTarget.id), {
        status:        'suspended',
        suspendedBy:   session?.name  || session?.email || 'Unknown',
        suspendedById: session?.id    || null,
        suspendedAt:   serverTimestamp(),
      });
      toast.success(`"${suspendTarget.fileName}" suspended.`);
      setSuspendTarget(null);
    } catch (err) {
      toast.error(`Suspend failed: ${err.message}`);
    } finally {
      setSuspending(false);
    }
  };

  // Derive brand list from loaded ops (no extra fetch needed)
  const brands = Array.from(
    new Map(allOps.map(o => [o.brandId, o.brandName])).entries()
  ).map(([id, brandName]) => ({ id, brandName }));

  // ── filter pipeline ──
  const filtered = allOps.filter(item => {
    if (brandFilter     !== 'all' && item.brandId !== brandFilter) return false;
    if (placementFilter !== 'all' && !item.adPlacements?.includes(placementFilter)) return false;
    if (typeFilter      !== 'all' && item.adType !== typeFilter) return false;
    if (projectFilter   !== 'all' && item.project !== projectFilter) return false;
    return true;
  });

  const byStatus = {
    running:   filtered.filter(i => getOpStatus(i) === 'running'),
    upcoming:  filtered.filter(i => getOpStatus(i) === 'upcoming'),
    expired:   filtered.filter(i => getOpStatus(i) === 'expired'),
    suspended: filtered.filter(i => getOpStatus(i) === 'suspended'),
  };

  // ── content renderers ──
  const renderGrid = (items, tab) => {
    if (loading) return <SkeletonGrid />;
    if (!items.length) return <EmptyState tab={tab} />;
    return (
      <Grid gap={3} className="w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(item => (
          <OpsCard key={item.id} item={item} onExpand={setLightboxItem} onSuspend={setSuspendTarget} />
        ))}
      </Grid>
    );
  };

  const renderTable = (items, tab) => {
    if (loading) return <SkeletonGrid />;
    if (!items.length) return <EmptyState tab={tab} />;
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 p-2" />
              <TableHead>Brand</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled By</TableHead>
              <TableHead className="w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <OpsTableRow key={item.id} item={item} onSuspend={setSuspendTarget} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderContent = (items, tab) =>
    view === 'grid' ? renderGrid(items, tab) : renderTable(items, tab);

  return (
    <Flex direction="col" className="gap-5">

      {/* Header */}
      <Flex align="start" justify="between" className="gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">AD Operations</h2>

        <Flex align="center" className="gap-2 flex-wrap">
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.brandName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={placementFilter} onValueChange={setPlacementFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="All Placements" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Placements</SelectItem>
              {Object.entries(PLACEMENT_LABELS).map(([id, label]) => (
                <SelectItem key={id} value={id}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([id, label]) => (
                <SelectItem key={id} value={id}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {Object.entries(PROJECT_LABELS).map(([id, label]) => (
                <SelectItem key={id} value={id}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <Flex className="rounded-md border border-border overflow-hidden shrink-0">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-none border-r border-border"
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Tabs */}
      <Tabs defaultValue="running">
        <TabsList className="mb-4">
          <TabsTrigger value="running" className="gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            Running
            {!loading && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">
                {byStatus.running.length}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="upcoming" className="gap-2">
            <Clock className="w-3 h-3" aria-hidden="true" />
            Upcoming
            {!loading && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">
                {byStatus.upcoming.length}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="expired" className="gap-2">
            <XCircle className="w-3 h-3" aria-hidden="true" />
            Expired
            {!loading && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">
                {byStatus.expired.length}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger value="suspended" className="gap-2">
            <Ban className="w-3 h-3" aria-hidden="true" />
            Suspended
            {!loading && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">
                {byStatus.suspended.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="running">
          {renderContent(byStatus.running, 'running')}
        </TabsContent>
        <TabsContent value="upcoming">
          {renderContent(byStatus.upcoming, 'upcoming')}
        </TabsContent>
        <TabsContent value="expired">
          {renderContent(byStatus.expired, 'expired')}
        </TabsContent>
        <TabsContent value="suspended">
          {renderContent(byStatus.suspended, 'suspended')}
        </TabsContent>
      </Tabs>

      {/* Lightbox */}
      <Dialog open={!!lightboxItem} onOpenChange={(o) => { if (!o) setLightboxItem(null); }}>
        <DialogContent className="max-w-4xl p-2 bg-card border-border">
          {lightboxItem && (
            <Flex direction="col" className="gap-3">
              <Box className="w-full relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {lightboxItem.format === 'video' ? (
                  <video src={lightboxItem.url} className="w-full max-h-[60vh] object-contain" controls autoPlay />
                ) : (
                  <img src={lightboxItem.url} alt={lightboxItem.fileName} className="w-full max-h-[60vh] object-contain" />
                )}
              </Box>

              <Flex justify="between" align="start" className="px-2 pb-1 gap-4 flex-wrap">
                <Flex direction="col" className="gap-1">
                  <span className="text-sm font-medium text-foreground">{lightboxItem.fileName}</span>
                  <span className="text-xs text-muted-foreground">{lightboxItem.brandName}</span>
                  {lightboxItem.runnedBy && (
                    <Flex align="center" className="gap-1 mt-0.5">
                      <UserCircle className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">{lightboxItem.runnedBy}</span>
                    </Flex>
                  )}
                </Flex>

                <Flex className="flex-wrap gap-1.5 shrink-0">
                  <StatusBadge status={getOpStatus(lightboxItem)} />
                  {lightboxItem.adPlacements?.map(p => (
                    <Badge key={p} variant="secondary" className="text-xs">{PLACEMENT_LABELS[p] ?? p}</Badge>
                  ))}
                  {lightboxItem.adType && (
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[lightboxItem.adType]}</Badge>
                  )}
                  {lightboxItem.project && (
                    <Badge variant="outline" className="text-xs uppercase">{PROJECT_LABELS[lightboxItem.project]}</Badge>
                  )}
                  {(lightboxItem.opStartDate || lightboxItem.opEndDate) && (
                    <span className="text-xs text-muted-foreground self-center">
                      {lightboxItem.opStartDate} → {lightboxItem.opEndDate}
                    </span>
                  )}
                </Flex>
              </Flex>

              {getOpStatus(lightboxItem) === 'suspended' && lightboxItem.suspendedBy && (
                <Flex align="center" className="gap-1.5 px-2 pb-1">
                  <Ban className="w-3.5 h-3.5 text-destructive" aria-hidden="true" />
                  <span className="text-xs text-destructive">
                    Suspended by {lightboxItem.suspendedBy}
                    {lightboxItem.suspendedAt?.toDate ? ` · ${lightboxItem.suspendedAt.toDate().toLocaleString()}` : ''}
                  </span>
                </Flex>
              )}
            </Flex>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!suspendTarget} onOpenChange={(o) => { if (!o) setSuspendTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend this ad?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{suspendTarget?.fileName}</strong> will be removed from the Active list immediately.
              The record is kept for audit but cannot be reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={suspending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleSuspend(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={suspending}
            >
              {suspending ? 'Suspending…' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Flex>
  );
}
