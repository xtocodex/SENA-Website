import { useState, useEffect } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flex, Grid, Box } from "@/components/ui/layout";
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

function MediaCard({ item, isSelecting, selectedItems, onToggle, showActions, actionMode, onAddToCollection }) {
  const isSelected = selectedItems.includes(item.id);
  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('Banner');
  const isVideo = item.format === 'video';

  const handleAdd = async () => {
    setLoading(true);
    await onAddToCollection(item, actionMode, selectedCollection);
    setLoading(false);
  };

  return (
    <Flex
      direction="col"
      className={`rounded-xl border border-border overflow-hidden bg-card group ${isSelected ? 'border-primary ring-2 ring-primary/50' : ''}`}
    >
      <Box className="relative">
        {isVideo ? (
          <video src={item.url} className="w-full h-full object-cover" muted />
        ) : (
          <img src={item.url} className="w-full h-full object-cover" alt={item.fileName} />
        )}

        {isSelecting && (
          <Flex align="center" justify="center" className="absolute top-3 left-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(item.id)}
              className="bg-background/80 border-border"
            />
          </Flex>
        )}
      </Box>

      <Flex direction="col" className="gap-2 p-3">
        <span className="text-xs text-foreground font-medium truncate" title={item.fileName}>
          {item.fileName}
        </span>
        <Flex align="center" className="gap-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {item.ratioLabel}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{item.brandName}</span>
        </Flex>

        {showActions && !isSelecting && (
          <Flex align="center" justify="between" className="pt-1 gap-2">
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-24 h-7 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Banner">Banner</SelectItem>
                <SelectItem value="Interstitial">Interstitial</SelectItem>
                <SelectItem value="Rewards">Rewards</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-[11px] gap-1"
              onClick={handleAdd}
              disabled={loading}
            >
              {loading ? 'Adding...' : (
                <>
                  <FolderPlus className="w-3 h-3" />
                  Add
                </>
              )}
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default function BrowseBrandMedia() {
  const [brands, setBrands] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [actionMode, setActionMode] = useState('copy');

  const fetchBrands = async () => {
    try {
      const q = query(collection(db, 'brands'), orderBy('brandName', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let items = [];

      if (brandFilter === 'all') {
        for (const brand of brands) {
          const imgQuery = query(collection(db, 'brandMedia', brand.id, 'images'), orderBy('uploadedAt', 'desc'));
          const vidQuery = query(collection(db, 'brandMedia', brand.id, 'videos'), orderBy('uploadedAt', 'desc'));

          const [imgSnap, vidSnap] = await Promise.all([
            getDocs(imgQuery),
            getDocs(vidQuery),
          ]);

          const imgs = imgSnap.docs.map((d) => ({ id: d.id, ...d.data(), format: 'image', brandId: brand.id, brandName: brand.brandName }));
          const vids = vidSnap.docs.map((d) => ({ id: d.id, ...d.data(), format: 'video', brandId: brand.id, brandName: brand.brandName }));
          items = [...items, ...imgs, ...vids];
        }
      } else {
        const selectedBrand = brands.find((b) => b.brandName === brandFilter);
        if (selectedBrand) {
          const imgQuery = query(collection(db, 'brandMedia', selectedBrand.id, 'images'), orderBy('uploadedAt', 'desc'));
          const vidQuery = query(collection(db, 'brandMedia', selectedBrand.id, 'videos'), orderBy('uploadedAt', 'desc'));

          const [imgSnap, vidSnap] = await Promise.all([
            getDocs(imgQuery),
            getDocs(vidQuery),
          ]);

          const imgs = imgSnap.docs.map((d) => ({ id: d.id, ...d.data(), format: 'image', brandId: selectedBrand.id, brandName: selectedBrand.brandName }));
          const vids = vidSnap.docs.map((d) => ({ id: d.id, ...d.data(), format: 'video', brandId: selectedBrand.id, brandName: selectedBrand.brandName }));
          items = [...imgs, ...vids];
        }
      }

      setMediaItems(items);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (brands.length > 0) {
      fetchMedia();
    }
  }, [brandFilter, brands]);

  const filtered = mediaItems.filter((m) => {
    const matchFormat = formatFilter === 'all' || m.format === formatFilter;
    return matchFormat;
  });

  const toggleSelectMode = () => {
    if (isSelecting) {
      setSelectedItems([]);
    }
    setIsSelecting(!isSelecting);
  };

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    setSelectedItems(filtered.map((item) => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkAdd = async () => {
    for (const itemId of selectedItems) {
      const item = mediaItems.find((m) => m.id === itemId);
      if (item) {
        await handleAddToCollection(item, actionMode, 'Banner');
      }
    }
    setSelectedItems([]);
    setIsSelecting(false);
  };

  const handleAddToCollection = async (item, mode, collectionName) => {
    try {
      await addDoc(collection(db, 'devCollections', 'main', `${item.format}s`), {
        fileName: item.fileName,
        url: item.url,
        ratio: item.ratio,
        ratioLabel: item.ratioLabel,
        collection: collectionName,
        type: item.format,
        storagePath: item.storagePath,
        sourceBrandId: item.brandId,
        sourceBrandName: item.brandName,
        addedAt: serverTimestamp(),
      });

      if (mode === 'move') {
        await deleteDoc(doc(db, 'brandMedia', item.brandId, `${item.format}s`, item.id));
        if (item.storagePath) {
          await deleteObject(ref(storage, item.storagePath));
        }
        setMediaItems((prev) => prev.filter((m) => m.id !== item.id));
      }
    } catch (err) {
      console.error('Error adding to collection:', err);
    }
  };

  return (
    <Flex direction="col" className="gap-6">
      <Flex align="center" justify="between">
        <h2 className="text-lg font-semibold text-foreground">Browse Brand Media</h2>

        {isSelecting ? (
          <Flex align="center" className="gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedItems.length} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={selectAllVisible}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
            <Select value={actionMode} onValueChange={setActionMode}>
              <SelectTrigger className="w-24 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copy">Copy</SelectItem>
                <SelectItem value="move">Move</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="default"
              size="sm"
              className="gap-1"
              onClick={handleBulkAdd}
              disabled={selectedItems.length === 0}
            >
              <FolderPlus className="w-4 h-4" />
              Add to Collection
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSelectMode}>
              <X className="w-4 h-4" />
            </Button>
          </Flex>
        ) : (
          <Flex align="center" className="gap-2">
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.brandName}>{b.brandName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleSelectMode}>
              Select
            </Button>
          </Flex>
        )}
      </Flex>

      {loading ? (
        <Grid cols={3} gap={4} className="w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card animate-pulse h-48" />
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Flex align="center" justify="center" className="py-24">
          <span className="text-sm text-muted-foreground">No media found for selected filters.</span>
        </Flex>
      ) : (
        <Grid cols={3} gap={4} className="w-full">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              isSelecting={isSelecting}
              selectedItems={selectedItems}
              onToggle={toggleItem}
              showActions={!isSelecting}
              actionMode={actionMode}
              onAddToCollection={handleAddToCollection}
            />
          ))}
        </Grid>
      )}
    </Flex>
  );
}