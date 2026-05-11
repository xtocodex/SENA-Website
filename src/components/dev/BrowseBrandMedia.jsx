import { useState, useEffect } from 'react';
import { FolderPlus, X, Expand } from 'lucide-react';
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Flex, Grid } from "@/components/ui/layout";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';


function MediaCard({ item, isSelecting, selectedItems, onToggle, showActions, onAddToCollection, onExpand }) {
  const isSelected = selectedItems.includes(item.id);
  const [loading, setLoading]               = useState(false);
  const [loaded, setLoaded]                 = useState(false);
  const [hovered, setHovered]               = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('Banner');
  const isVideo = item.format === 'video';

  const handleAdd = async () => {
    setLoading(true);
    await onAddToCollection(item, 'copy', selectedCollection);
    setLoading(false);
  };

  return (
    <Flex
      direction="col"
      className={`rounded-xl border border-border overflow-hidden bg-card group ${isSelected ? 'border-primary ring-2 ring-primary/50' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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

        {isSelecting ? (
          <Flex align="center" justify="center" className="absolute top-3 left-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggle(item.id)}
              className="bg-background/80 border-border"
            />
          </Flex>
        ) : (
          <Flex
            align="center"
            justify="center"
            className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          >
            <Button variant="secondary" size="icon" className="w-8 h-8" onClick={() => onExpand(item)}>
              <Expand className="w-3.5 h-3.5" />
            </Button>
          </Flex>
        )}
      </AspectRatio>

      <Flex direction="col" className="gap-2 p-3">
        <span className="text-xs text-foreground font-medium truncate" title={item.fileName}>
          {item.fileName}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {item.brandName}{item.uploadedAt?.toDate ? ` · ${item.uploadedAt.toDate().toLocaleDateString()}` : ''}
        </span>

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
  const [bulkCollection, setBulkCollection] = useState('Banner');
  const [lightboxItem, setLightboxItem] = useState(null);

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
        const selectedBrand = brands.find((b) => b.id === brandFilter);
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
      setActionMode('copy');
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
        await handleAddToCollection(item, actionMode, bulkCollection);
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
        thumbnailUrl: item.thumbnailUrl || null,
        ratio: item.ratio,
        collection: collectionName,
        type: item.format,
        storagePath: item.storagePath,
        sourceBrandId: item.brandId,
        sourceBrandName: item.brandName,
        sourceMoved: mode === 'move',
        addedAt: serverTimestamp(),
      });

      if (mode === 'move') {
        await deleteDoc(doc(db, 'brandMedia', item.brandId, `${item.format}s`, item.id));
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
            <Select value={bulkCollection} onValueChange={setBulkCollection}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Banner">Banner</SelectItem>
                <SelectItem value="Interstitial">Interstitial</SelectItem>
                <SelectItem value="Rewards">Rewards</SelectItem>
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
                  <SelectItem key={b.id} value={b.id}>{b.brandName}</SelectItem>
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
        <Grid cols={4} gap={3} className="w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card animate-pulse aspect-square" />
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Flex align="center" justify="center" className="py-24">
          <span className="text-sm text-muted-foreground">No media found for selected filters.</span>
        </Flex>
      ) : (
        <Grid cols={4} gap={3} className="w-full">
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
              onExpand={setLightboxItem}
            />
          ))}
        </Grid>
      )}

      <Dialog open={!!lightboxItem} onOpenChange={(open) => { if (!open) setLightboxItem(null); }}>
        <DialogContent className="max-w-4xl p-2 bg-card border-border">
          {lightboxItem && (
            <Flex direction="col" className="gap-3">
              <div className="w-full relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {lightboxItem.format === 'video' ? (
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
                  <span className="text-xs text-muted-foreground">{lightboxItem.brandName}</span>
                </Flex>
              </Flex>
            </Flex>
          )}
        </DialogContent>
      </Dialog>
    </Flex>
  );
}
