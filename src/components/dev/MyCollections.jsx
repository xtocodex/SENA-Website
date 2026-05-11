import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Trash2, Expand } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Flex, Grid } from "@/components/ui/layout";
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

const TABS = ['All', 'Banner', 'Interstitial', 'Rewards'];


function MediaCard({ item, onDelete, onExpand }) {
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const isVideo    = item.type === 'video';

  return (
    <Flex
      direction="col"
      className="rounded-xl border border-border overflow-hidden bg-card cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onExpand(item)}
    >
      <AspectRatio ratio={1}>
        {!loaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
        {isVideo ? (
          item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.fileName}
              loading="lazy"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLoaded(true)}
            />
          ) : (
            <video
              src={item.url}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
              onSeeked={() => setLoaded(true)}
            />
          )
        ) : (
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.fileName}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
          />
        )}

        <Flex
          align="center"
          justify="center"
          className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-150 gap-2 ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Button variant="secondary" size="icon" className="w-8 h-8" onClick={(e) => { e.stopPropagation(); onExpand(item); }}>
            <Expand className="w-3.5 h-3.5" />
          </Button>
          <Button variant="destructive" size="icon" className="w-8 h-8" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </Flex>
      </AspectRatio>

      <Flex direction="col" className="gap-2 p-3">
        <span className="text-xs text-foreground font-medium truncate" title={item.fileName}>
          {item.fileName}
        </span>
        <Flex align="center" justify="between">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {item.collection}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{item.sourceBrandName}</span>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default function MyCollections() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lightboxItem, setLightboxItem] = useState(null);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const imgQuery = query(collection(db, 'devCollections', 'main', 'images'), orderBy('addedAt', 'desc'));
      const vidQuery = query(collection(db, 'devCollections', 'main', 'videos'), orderBy('addedAt', 'desc'));

      const [imgSnap, vidSnap] = await Promise.all([
        getDocs(imgQuery),
        getDocs(vidQuery),
      ]);

      const imgs = imgSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: 'image' }));
      const vids = vidSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: 'video' }));

      setItems([...imgs, ...vids]);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (item) => {
    try {
      await deleteDoc(doc(db, 'devCollections', 'main', `${item.type}s`, item.id));
      if (item.storagePath && item.sourceMoved) {
        await deleteObject(ref(storage, item.storagePath)).catch(() => {});
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const filtered = activeTab === 'All'
    ? items
    : items.filter((m) => m.collection === activeTab);

  return (
    <Flex direction="col" className="gap-6">
      <Flex align="center" justify="between">
        <h2 className="text-lg font-semibold text-foreground">My Collections</h2>
      </Flex>

      <Flex align="center" className="gap-1">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </Flex>

      {loading ? (
        <Grid cols={4} gap={3} className="w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card animate-pulse aspect-square" />
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Flex align="center" justify="center" className="py-24">
          <span className="text-sm text-muted-foreground">No items in this collection.</span>
        </Flex>
      ) : (
        <Grid cols={4} gap={3} className="w-full">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} onDelete={setDeleteTarget} onExpand={setLightboxItem} />
          ))}
        </Grid>
      )}

      <Dialog open={!!lightboxItem} onOpenChange={(open) => { if (!open) setLightboxItem(null); }}>
        <DialogContent className="max-w-4xl p-2 bg-card border-border">
          {lightboxItem && (
            <Flex direction="col" className="gap-3">
              <div className="w-full relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {lightboxItem.type === 'video' ? (
                  <video
                    src={lightboxItem.url}
                    className="w-full max-h-[70vh] object-contain"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={lightboxItem.url}
                    alt={lightboxItem.fileName}
                    className="w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>
              <Flex justify="between" align="center" className="px-2 pb-1">
                <span className="text-sm font-medium text-foreground truncate max-w-xs">
                  {lightboxItem.fileName}
                </span>
                <Flex align="center" className="gap-2 shrink-0">
                  <Badge variant="secondary">{lightboxItem.collection}</Badge>
                  <span className="text-xs text-muted-foreground">{lightboxItem.sourceBrandName}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 h-7 text-xs"
                    onClick={() => { setDeleteTarget(lightboxItem); setLightboxItem(null); }}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.fileName}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
