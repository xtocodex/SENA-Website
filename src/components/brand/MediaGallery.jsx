import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flex, Grid, Box } from "@/components/ui/layout";
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

const BADGE_VARIANTS = {
  'Banner AD': 'default',
  'Banner AD Video': 'default',
  'Interstitial AD': 'secondary',
  'Interstitial AD Video': 'secondary',
  'Rewards AD': 'outline',
  'Rewards AD Video': 'outline',
};

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function MediaCard({ item, isVideo, onDelete }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Flex
      direction="col"
      className="rounded-xl border border-border overflow-hidden bg-card group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box className="relative">
        {isVideo ? (
          <video src={item.url} className="w-full h-full object-cover" muted />
        ) : (
          <img src={item.url} className="w-full h-full object-cover" alt={item.fileName} />
        )}
        <Flex
          align="center"
          justify="center"
          className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Button variant="destructive" size="icon" className="w-8 h-8" onClick={() => onDelete(item)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </Flex>
      </Box>

      <Flex direction="col" className="gap-2 p-3">
        <span className="text-xs text-foreground font-medium truncate" title={item.fileName}>
          {item.fileName}
        </span>
        <Flex align="center" justify="between">
          <Badge variant={BADGE_VARIANTS[item.ratioLabel] || 'secondary'} className="text-[10px] px-1.5 py-0">
            {item.ratioLabel}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{formatFileSize(item.size)}</span>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default function MediaGallery({ brandId, type }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
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
      if (item.storagePath) {
        await deleteObject(ref(storage, item.storagePath));
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  if (loading) {
    return (
      <Grid cols={3} gap={4} className="w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-48" />
        ))}
      </Grid>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Flex direction="col" align="center" justify="center" className="py-24 gap-2">
        <span className="text-sm text-muted-foreground">No {isVideo ? 'videos' : 'images'} uploaded yet.</span>
      </Flex>
    );
  }

  return (
    <Grid cols={3} gap={4} className="w-full">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} isVideo={isVideo} onDelete={handleDelete} />
      ))}
    </Grid>
  );
}