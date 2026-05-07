import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { Flex, Grid, Box } from "@/components/ui/layout";
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

const TABS = ['All', 'Banner', 'Interstitial', 'Rewards'];

function MediaCard({ item, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const isVideo = item.type === 'video';

  return (
    <Flex
      direction="col"
      className="rounded-xl border border-border overflow-hidden bg-card"
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
      if (item.storagePath) {
        await deleteObject(ref(storage, item.storagePath));
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
        <Grid cols={3} gap={4} className="w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-48" />
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Flex align="center" justify="center" className="py-24">
          <span className="text-sm text-muted-foreground">No items in this collection.</span>
        </Flex>
      ) : (
        <Grid cols={3} gap={4} className="w-full">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </Grid>
      )}
    </Flex>
  );
}