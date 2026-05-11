import { useState, useEffect } from 'react';
import { Trash2, Expand } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Flex, Grid, Box } from "@/components/ui/layout";
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}


function MediaCard({ item, isVideo, onDelete, onExpand }) {
  const [hovered, setHovered] = useState(false);
  const [loaded, setLoaded]   = useState(false);
  const displaySrc = item.thumbnailUrl || item.url;

  return (
    <Flex
      direction="col"
      className="rounded-xl border border-border overflow-hidden bg-card group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onExpand(item)}
    >
      <AspectRatio ratio={1}>
        {!loaded && (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-t-xl" />
        )}

        {isVideo ? (
          <video
            src={displaySrc}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            muted
            preload="metadata"
            onLoadedMetadata={() => setLoaded(true)}
          />
        ) : (
          <img
            src={displaySrc}
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
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8"
            onClick={(e) => { e.stopPropagation(); onExpand(item); }}
          >
            <Expand className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="w-8 h-8"
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </Flex>
      </AspectRatio>

      <Flex direction="col" className="gap-1.5 p-3">
        <span className="text-xs text-foreground font-medium truncate" title={item.fileName}>
          {item.fileName}
        </span>
        <Flex justify="between" align="center">
          <span className="text-[10px] text-muted-foreground">{formatFileSize(item.size)}</span>
          {item.ratioLabel && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
              {item.ratioLabel}
            </Badge>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default function MediaGallery({ brandId, type }) {
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lightboxItem, setLightboxItem] = useState(null);
  const isVideo = type === 'video';

  const fetchMedia = async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'brandMedia', brandId, `${type}s`),
        orderBy('uploadedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [brandId, type]);

  const handleDelete = async (item) => {
    try {
      await deleteDoc(doc(db, 'brandMedia', brandId, `${type}s`, item.id));
      if (item.storagePath) await deleteObject(ref(storage, item.storagePath));
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('Error deleting:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <Grid cols={4} gap={3} className="w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card animate-pulse aspect-square" />
        ))}
      </Grid>
    );
  }

  if (!items.length) {
    return (
      <Flex direction="col" align="center" justify="center" className="py-24 gap-2">
        <span className="text-sm text-muted-foreground">No {isVideo ? 'videos' : 'images'} uploaded yet.</span>
      </Flex>
    );
  }

  return (
    <>
      <Grid cols={4} gap={3} className="w-full">
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            isVideo={isVideo}
            onDelete={setDeleteTarget}
            onExpand={setLightboxItem}
          />
        ))}
      </Grid>

      <Dialog open={!!lightboxItem} onOpenChange={(open) => { if (!open) setLightboxItem(null); }}>
        <DialogContent className="max-w-4xl p-2 bg-card border-border">
          {lightboxItem && (
            <Flex direction="col" className="gap-3">
              <Box className="w-full relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {isVideo ? (
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
              </Box>
              <Flex justify="between" align="center" className="px-2 pb-1">
                <span className="text-sm font-medium text-foreground truncate max-w-xs">
                  {lightboxItem.fileName}
                </span>
                <Flex align="center" className="gap-2 shrink-0">
                  {lightboxItem.ratioLabel && (
                    <Badge variant="secondary">{lightboxItem.ratioLabel}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(lightboxItem.size)}
                  </span>
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
            <AlertDialogTitle>Delete {isVideo ? 'Video' : 'Image'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.fileName}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
