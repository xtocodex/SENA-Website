import { useState, useEffect } from 'react';
import { LayoutGrid, List, Clock, XCircle, Expand, Radio } from 'lucide-react';
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
import { Flex, Grid, Box } from "@/components/ui/layout";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

// ─── MOCK — set false when done reviewing ────────────────────
const USE_MOCK = true;

const MOCK_BRANDS = [
  { id: 'brand-1', brandName: 'Nike' },
  { id: 'brand-2', brandName: 'Adidas' },
  { id: 'brand-3', brandName: 'Puma' },
];

const MOCK_ITEMS = [
  // ── ACTIVE (today is between start and end) ──
  {
    id: 'mock-1', format: 'image', brandId: 'brand-1', brandName: 'Nike',
    fileName: 'nike_air_banner.jpg',
    url: 'https://picsum.photos/seed/nike1/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/nike1/400/400',
    ratio: 1, ratioLabel: '1:1', size: 1200000,
    adStartDate: '2026-05-01', adEndDate: '2026-05-31',
    adPlacements: ['in-map', 'ui-board'], adType: 'product-based', project: 'sena',
  },
  {
    id: 'mock-2', format: 'image', brandId: 'brand-2', brandName: 'Adidas',
    fileName: 'adidas_ultraboost.png',
    url: 'https://picsum.photos/seed/adidas2/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/adidas2/400/400',
    ratio: 1, ratioLabel: '1:1', size: 980000,
    adStartDate: '2026-05-10', adEndDate: '2026-05-25',
    adPlacements: ['interactive'], adType: 'product-based', project: 'sena',
  },
  {
    id: 'mock-3', format: 'image', brandId: 'brand-3', brandName: 'Puma',
    fileName: 'puma_software_ad.jpg',
    url: 'https://picsum.photos/seed/puma3/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/puma3/400/400',
    ratio: 1, ratioLabel: '1:1', size: 1500000,
    adStartDate: '2026-05-05', adEndDate: '2026-05-28',
    adPlacements: ['ui-board'], adType: 'software-based', project: 'option2',
  },
  {
    id: 'mock-4', format: 'image', brandId: 'brand-1', brandName: 'Nike',
    fileName: 'nike_interactive_promo.webp',
    url: 'https://picsum.photos/seed/nike4/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/nike4/400/400',
    ratio: 1, ratioLabel: '1:1', size: 800000,
    adStartDate: '2026-05-12', adEndDate: '2026-05-30',
    adPlacements: ['in-map', 'interactive'], adType: 'product-based', project: 'sena',
  },
  // ── UPCOMING ──
  {
    id: 'mock-5', format: 'image', brandId: 'brand-2', brandName: 'Adidas',
    fileName: 'adidas_summer_launch.jpg',
    url: 'https://picsum.photos/seed/adidas5/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/adidas5/400/400',
    ratio: 1, ratioLabel: '1:1', size: 1100000,
    adStartDate: '2026-06-01', adEndDate: '2026-06-30',
    adPlacements: ['in-map'], adType: 'product-based', project: 'sena',
  },
  {
    id: 'mock-6', format: 'image', brandId: 'brand-3', brandName: 'Puma',
    fileName: 'puma_q3_campaign.png',
    url: 'https://picsum.photos/seed/puma6/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/puma6/400/400',
    ratio: 1, ratioLabel: '1:1', size: 950000,
    adStartDate: '2026-06-15', adEndDate: '2026-07-15',
    adPlacements: ['ui-board', 'interactive'], adType: 'software-based', project: 'option3',
  },
  {
    id: 'mock-7', format: 'image', brandId: 'brand-1', brandName: 'Nike',
    fileName: 'nike_back_to_school.jpg',
    url: 'https://picsum.photos/seed/nike7/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/nike7/400/400',
    ratio: 1, ratioLabel: '1:1', size: 1300000,
    adStartDate: '2026-07-01', adEndDate: '2026-08-31',
    adPlacements: ['in-map', 'ui-board', 'interactive'], adType: 'product-based', project: 'sena',
  },
  // ── EXPIRED ──
  {
    id: 'mock-8', format: 'image', brandId: 'brand-2', brandName: 'Adidas',
    fileName: 'adidas_spring_sale.jpg',
    url: 'https://picsum.photos/seed/adidas8/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/adidas8/400/400',
    ratio: 1, ratioLabel: '1:1', size: 870000,
    adStartDate: '2026-03-01', adEndDate: '2026-03-31',
    adPlacements: ['ui-board'], adType: 'product-based', project: 'sena',
  },
  {
    id: 'mock-9', format: 'image', brandId: 'brand-3', brandName: 'Puma',
    fileName: 'puma_new_year_promo.png',
    url: 'https://picsum.photos/seed/puma9/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/puma9/400/400',
    ratio: 1, ratioLabel: '1:1', size: 1050000,
    adStartDate: '2026-01-01', adEndDate: '2026-01-31',
    adPlacements: ['interactive', 'in-map'], adType: 'other', project: 'option2',
  },
  {
    id: 'mock-10', format: 'image', brandId: 'brand-1', brandName: 'Nike',
    fileName: 'nike_valentines_day.jpg',
    url: 'https://picsum.photos/seed/nike10/600/600',
    thumbnailUrl: 'https://picsum.photos/seed/nike10/400/400',
    ratio: 1, ratioLabel: '1:1', size: 760000,
    adStartDate: '2026-02-10', adEndDate: '2026-02-15',
    adPlacements: ['in-map'], adType: 'product-based', project: 'sena',
  },
];

// ─── constants ───────────────────────────────────────────────

const PLACEMENT_LABELS = {
  'in-map':      'In Map',
  'ui-board':    'UI Board',
  'interactive': 'Interactive',
};

const TYPE_LABELS = {
  'product-based':  'Product',
  'software-based': 'Software',
  'other':          'Other',
};

const PROJECT_LABELS = {
  'sena':    'SENA',
  'option2': 'Option 2',
  'option3': 'Option 3',
};

// ─── status helpers ───────────────────────────────────────────

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

function getStatus(item) {
  if (!item.adStartDate || !item.adEndDate) return 'upcoming';
  const start = new Date(item.adStartDate);
  const end   = new Date(item.adEndDate);
  const now   = today();
  if (now > end)   return 'expired';
  if (now >= start) return 'active';
  return 'upcoming';
}

const STATUS_META = {
  active: {
    label:      'Active',
    Icon:       Radio,
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

// ─── grid card ───────────────────────────────────────────────

function AdCard({ item, onExpand }) {
  const [loaded,  setLoaded]  = useState(false);
  const [hovered, setHovered] = useState(false);
  const status  = getStatus(item);
  const isVideo = item.format === 'video';

  return (
    <Flex
      direction="col"
      className="rounded-xl border border-border overflow-hidden bg-card cursor-pointer group"
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

        {/* Hover expand overlay */}
        <Flex align="center" justify="center"
          className={cn('absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-150', hovered ? 'opacity-100' : 'opacity-0')}>
          <Button variant="secondary" size="icon" className="w-8 h-8"
            onClick={(e) => { e.stopPropagation(); onExpand(item); }}
            aria-label="Expand preview">
            <Expand className="w-3.5 h-3.5" />
          </Button>
        </Flex>

        {/* Status badge — top-left overlay */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={status} />
        </div>
      </AspectRatio>

      <Flex direction="col" className="gap-2 p-3">
        {/* Filename + brand */}
        <Flex direction="col" className="gap-0.5">
          <span className="text-xs font-medium text-foreground truncate" title={item.fileName}>
            {item.fileName}
          </span>
          <span className="text-[10px] text-muted-foreground">{item.brandName}</span>
        </Flex>

        {/* Placements */}
        {item.adPlacements?.length > 0 && (
          <Flex className="flex-wrap gap-1">
            {item.adPlacements.map(p => (
              <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                {PLACEMENT_LABELS[p] ?? p}
              </Badge>
            ))}
          </Flex>
        )}

        {/* Type + Project */}
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

        {/* Date range */}
        {(item.adStartDate || item.adEndDate) && (
          <span className="text-[9px] text-muted-foreground">
            {item.adStartDate} → {item.adEndDate}
          </span>
        )}
      </Flex>
    </Flex>
  );
}

// ─── table row ───────────────────────────────────────────────

function AdTableRow({ item }) {
  const status  = getStatus(item);
  const isVideo = item.format === 'video';

  return (
    <TableRow>
      {/* Thumbnail */}
      <TableCell className="w-12 p-2">
        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0">
          {isVideo ? (
            <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
          ) : (
            <img src={item.thumbnailUrl || item.url} alt={item.fileName} className="w-full h-full object-cover" />
          )}
        </div>
      </TableCell>

      {/* Brand */}
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{item.brandName}</TableCell>

      {/* File */}
      <TableCell className="text-xs font-medium max-w-[140px]">
        <span className="truncate block" title={item.fileName}>{item.fileName}</span>
      </TableCell>

      {/* Placements */}
      <TableCell>
        <Flex className="flex-wrap gap-1">
          {item.adPlacements?.map(p => (
            <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 h-4 whitespace-nowrap">
              {PLACEMENT_LABELS[p] ?? p}
            </Badge>
          ))}
        </Flex>
      </TableCell>

      {/* Type */}
      <TableCell className="text-xs text-foreground whitespace-nowrap">
        {TYPE_LABELS[item.adType] ?? item.adType ?? '—'}
      </TableCell>

      {/* Project */}
      <TableCell className="text-xs text-foreground whitespace-nowrap">
        {PROJECT_LABELS[item.project] ?? item.project ?? '—'}
      </TableCell>

      {/* Dates */}
      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{item.adStartDate ?? '—'}</TableCell>
      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">{item.adEndDate ?? '—'}</TableCell>

      {/* Status */}
      <TableCell><StatusBadge status={status} /></TableCell>
    </TableRow>
  );
}

// ─── empty state ─────────────────────────────────────────────

function EmptyState({ tab }) {
  const messages = {
    active:   'No active ADs right now.',
    upcoming: 'No upcoming ADs scheduled.',
    expired:  'No expired ADs found.',
  };
  return (
    <Flex direction="col" align="center" justify="center" className="py-24 gap-2">
      <span className="text-sm text-muted-foreground">{messages[tab]}</span>
    </Flex>
  );
}

// ─── main component ───────────────────────────────────────────

export default function AdRequests() {
  const [brands,    setBrands]    = useState([]);
  const [allItems,  setAllItems]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [view,      setView]      = useState('grid');   // 'grid' | 'list'
  const [brandFilter,     setBrandFilter]     = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [typeFilter,      setTypeFilter]      = useState('all');
  const [projectFilter,   setProjectFilter]   = useState('all');
  const [lightboxItem,    setLightboxItem]    = useState(null);

  // ── fetch ──
  const fetchBrands = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'brands'), orderBy('brandName', 'asc')));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch { return []; }
  };

  const fetchAllMedia = async (brandList) => {
    let items = [];
    for (const brand of brandList) {
      const [imgSnap, vidSnap] = await Promise.all([
        getDocs(query(collection(db, 'brandMedia', brand.id, 'images'), orderBy('uploadedAt', 'desc'))),
        getDocs(query(collection(db, 'brandMedia', brand.id, 'videos'), orderBy('uploadedAt', 'desc'))),
      ]);
      const imgs = imgSnap.docs.map(d => ({ id: d.id, ...d.data(), format: 'image', brandId: brand.id, brandName: brand.brandName }));
      const vids = vidSnap.docs.map(d => ({ id: d.id, ...d.data(), format: 'video', brandId: brand.id, brandName: brand.brandName }));
      items = [...items, ...imgs, ...vids];
    }
    // Only show items that have AD metadata
    return items.filter(i => i.adStartDate || i.adEndDate || i.adType || i.project);
  };

  useEffect(() => {
    if (USE_MOCK) {
      setBrands(MOCK_BRANDS);
      setAllItems(MOCK_ITEMS);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const brandList = await fetchBrands();
      setBrands(brandList);
      const media = await fetchAllMedia(brandList);
      setAllItems(media);
      setLoading(false);
    })();
  }, []);

  // ── filter pipeline ──
  const filtered = allItems.filter(item => {
    if (brandFilter     !== 'all' && item.brandId !== brandFilter) return false;
    if (placementFilter !== 'all' && !item.adPlacements?.includes(placementFilter)) return false;
    if (typeFilter      !== 'all' && item.adType !== typeFilter) return false;
    if (projectFilter   !== 'all' && item.project !== projectFilter) return false;
    return true;
  });

  const byStatus = {
    active:   filtered.filter(i => getStatus(i) === 'active'),
    upcoming: filtered.filter(i => getStatus(i) === 'upcoming'),
    expired:  filtered.filter(i => getStatus(i) === 'expired'),
  };

  // ── content renderers ──
  const renderGrid = (items, tab) => {
    if (loading) return <SkeletonGrid />;
    if (!items.length) return <EmptyState tab={tab} />;
    return (
      <Grid gap={3} className="w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(item => (
          <AdCard key={`${item.brandId}-${item.id}`} item={item} onExpand={setLightboxItem} />
        ))}
      </Grid>
    );
  };

  const renderTable = (items, tab) => {
    if (loading) return <SkeletonGrid />;
    if (!items.length) return <EmptyState tab={tab} />;
    return (
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <AdTableRow key={`${item.brandId}-${item.id}`} item={item} />
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderContent = (items, tab) =>
    view === 'grid' ? renderGrid(items, tab) : renderTable(items, tab);

  return (
    <Flex direction="col" className="gap-5">

      {/* Header */}
      <Flex align="start" justify="between" className="gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">AD Requests</h2>

        <Flex align="center" className="gap-2 flex-wrap">
          {/* Filters */}
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
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            Active
            {!loading && (
              <Badge variant="secondary" className="ml-1 text-[9px] px-1.5 py-0 h-4">
                {byStatus.active.length}
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
        </TabsList>

        <TabsContent value="active">
          {renderContent(byStatus.active, 'active')}
        </TabsContent>
        <TabsContent value="upcoming">
          {renderContent(byStatus.upcoming, 'upcoming')}
        </TabsContent>
        <TabsContent value="expired">
          {renderContent(byStatus.expired, 'expired')}
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
                </Flex>

                <Flex className="flex-wrap gap-1.5 shrink-0">
                  <StatusBadge status={getStatus(lightboxItem)} />
                  {lightboxItem.adPlacements?.map(p => (
                    <Badge key={p} variant="secondary" className="text-xs">{PLACEMENT_LABELS[p] ?? p}</Badge>
                  ))}
                  {lightboxItem.adType && (
                    <Badge variant="outline" className="text-xs">{TYPE_LABELS[lightboxItem.adType]}</Badge>
                  )}
                  {lightboxItem.project && (
                    <Badge variant="outline" className="text-xs uppercase">{PROJECT_LABELS[lightboxItem.project]}</Badge>
                  )}
                  {(lightboxItem.adStartDate || lightboxItem.adEndDate) && (
                    <span className="text-xs text-muted-foreground self-center">
                      {lightboxItem.adStartDate} → {lightboxItem.adEndDate}
                    </span>
                  )}
                </Flex>
              </Flex>
            </Flex>
          )}
        </DialogContent>
      </Dialog>

    </Flex>
  );
}
