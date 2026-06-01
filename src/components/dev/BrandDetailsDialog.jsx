import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Package, FileText, Building2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Flex, Grid, Box } from "@/components/ui/layout";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function formatDate(ts) {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString();
}

function MediaGridSection({ items, kind, onExpand }) {
  if (!items.length) {
    return (
      <Flex direction="col" align="center" justify="center" className="py-12">
        <span className="text-sm text-muted-foreground">No {kind} uploaded.</span>
      </Flex>
    );
  }
  return (
    <Grid gap={3} className="w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="rounded-lg border border-border overflow-hidden bg-card text-left group"
          onClick={() => onExpand(item)}
        >
          <AspectRatio ratio={1}>
            {kind === 'videos' ? (
              item.thumbnailUrl
                ? <img src={item.thumbnailUrl} alt={item.fileName} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                : <video src={item.url} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <img src={item.thumbnailUrl || item.url} alt={item.fileName} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </AspectRatio>
          <Box className="p-2">
            <span className="text-[10px] text-muted-foreground truncate block" title={item.fileName}>
              {item.fileName}
            </span>
          </Box>
        </button>
      ))}
    </Grid>
  );
}

function SampleList({ urls, kind }) {
  if (!urls?.length) {
    return <span className="text-xs text-muted-foreground">None submitted.</span>;
  }
  return (
    <Grid gap={2} className="grid-cols-3 sm:grid-cols-4">
      {urls.map((url, i) => (
        <a key={i} href={url} target="_blank" rel="noreferrer"
          className="rounded-md border border-border overflow-hidden bg-card aspect-square block">
          {kind === 'videos' ? (
            <video src={url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
          ) : (
            <img src={url} alt={`Sample ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
          )}
        </a>
      ))}
    </Grid>
  );
}

export default function BrandDetailsDialog({ brand, open, onClose }) {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    if (!open || !brand?.id) return;
    let cancelled = false;
    (async () => {
      setLoadingMedia(true);
      try {
        const [imgSnap, vidSnap] = await Promise.all([
          getDocs(query(collection(db, 'brandMedia', brand.id, 'images'), orderBy('uploadedAt', 'desc'))),
          getDocs(query(collection(db, 'brandMedia', brand.id, 'videos'), orderBy('uploadedAt', 'desc'))),
        ]);
        if (cancelled) return;
        setImages(imgSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setVideos(vidSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {
        if (!cancelled) { setImages([]); setVideos([]); }
      } finally {
        if (!cancelled) setLoadingMedia(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, brand?.id]);

  if (!brand) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              {brand.brandName || brand.companyName || 'Brand'}
            </DialogTitle>
            <DialogDescription>Approved brand profile and uploaded content.</DialogDescription>
          </DialogHeader>

          <Flex direction="col" className="gap-4 pt-2">
            {/* Profile */}
            <Box className="rounded-lg border border-border bg-card p-4">
              <Flex direction="col" className="gap-3">
                <Flex direction="col" className="gap-1">
                  <Flex align="center" className="gap-2">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground">{brand.email || '—'}</span>
                  </Flex>
                  <Flex align="center" className="gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground">{brand.phone || '—'}</span>
                  </Flex>
                  <Flex align="start" className="gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground">{brand.address || '—'}</span>
                  </Flex>
                </Flex>

                <Separator />

                <Flex direction="col" className="gap-2">
                  <Flex align="center" className="gap-2">
                    <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Operating Products</span>
                  </Flex>
                  <span className="text-xs text-foreground whitespace-pre-wrap">{brand.operatingProducts || '—'}</span>
                </Flex>

                <Flex direction="col" className="gap-2">
                  <Flex align="center" className="gap-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Additional Information</span>
                  </Flex>
                  <span className="text-xs text-foreground whitespace-pre-wrap">{brand.additionalInfo || '—'}</span>
                </Flex>

                {brand.feedback && (
                  <>
                    <Separator />
                    <Flex direction="col" className="gap-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Approval Feedback</span>
                      <span className="text-xs text-foreground whitespace-pre-wrap">{brand.feedback}</span>
                    </Flex>
                  </>
                )}

                <Separator />

                <Flex justify="between" className="gap-2 flex-wrap">
                  <Flex direction="col" className="gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Approved</span>
                    <span className="text-xs text-foreground">{formatDate(brand.createdAt)}</span>
                  </Flex>
                  {brand.approvedBy && (
                    <Flex direction="col" className="gap-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">By</span>
                      <span className="text-xs text-foreground">{brand.approvedBy}</span>
                    </Flex>
                  )}
                  <Badge variant="secondary" className="text-[10px] h-5 self-center">
                    {brand.status || 'approved'}
                  </Badge>
                </Flex>
              </Flex>
            </Box>

            {/* Original Sample Media */}
            {(brand.sampleImages?.length > 0 || brand.sampleVideos?.length > 0) && (
              <Box className="rounded-lg border border-border bg-card p-4">
                <Flex direction="col" className="gap-3">
                  <span className="text-xs font-medium text-foreground">Sample Media (from registration)</span>
                  <Flex direction="col" className="gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sample Images</span>
                    <SampleList urls={brand.sampleImages} kind="images" />
                  </Flex>
                  <Flex direction="col" className="gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sample Videos</span>
                    <SampleList urls={brand.sampleVideos} kind="videos" />
                  </Flex>
                </Flex>
              </Box>
            )}

            {/* Uploaded media */}
            <Tabs defaultValue="images">
              <TabsList>
                <TabsTrigger value="images" className="gap-2">
                  Uploaded Images
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{images.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="videos" className="gap-2">
                  Uploaded Videos
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{videos.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="images" className="mt-3">
                {loadingMedia
                  ? <Flex align="center" justify="center" className="py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></Flex>
                  : <MediaGridSection items={images} kind="images" onExpand={setLightboxItem} />}
              </TabsContent>
              <TabsContent value="videos" className="mt-3">
                {loadingMedia
                  ? <Flex align="center" justify="center" className="py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></Flex>
                  : <MediaGridSection items={videos} kind="videos" onExpand={setLightboxItem} />}
              </TabsContent>
            </Tabs>
          </Flex>
        </DialogContent>
      </Dialog>

      <Dialog open={!!lightboxItem} onOpenChange={(o) => { if (!o) setLightboxItem(null); }}>
        <DialogContent className="max-w-3xl p-2 bg-card border-border">
          {lightboxItem && (
            <Box className="w-full relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {lightboxItem.type === 'video' ? (
                <video src={lightboxItem.url} className="w-full max-h-[70vh] object-contain" controls autoPlay />
              ) : (
                <img src={lightboxItem.url} alt={lightboxItem.fileName} className="w-full max-h-[70vh] object-contain" />
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
