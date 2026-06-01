import { useState, useEffect } from 'react';
import { Trash2, Eye, Loader2 } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Flex } from "@/components/ui/layout";
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import BrandDetailsDialog from "@/components/dev/BrandDetailsDialog";

export default function ManageBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'brands'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setBrands(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      for (const sub of ['images', 'videos']) {
        const snap = await getDocs(collection(db, 'brandMedia', id, sub));
        for (const d of snap.docs) {
          const { storagePath } = d.data();
          if (storagePath) await deleteObject(ref(storage, storagePath)).catch(() => {});
          await deleteDoc(doc(db, 'brandMedia', id, sub, d.id));
        }
      }
      await deleteDoc(doc(db, 'brands', id));
      setBrands((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error deleting brand:', err);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <Flex direction="col" className="gap-6">
      <Flex align="center" justify="between">
        <h2 className="text-lg font-semibold text-foreground">Manage Brands</h2>
      </Flex>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Loading brands...</TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No approved brands yet.</TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id} className={deletingId === brand.id ? 'opacity-50 pointer-events-none' : ''}>
                  <TableCell className="font-medium text-foreground">{brand.brandName || brand.companyName || '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{brand.email}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {brand.createdAt?.toDate ? brand.createdAt.toDate().toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell>
                    <Flex align="center" justify="end" className="gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setViewTarget(brand)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(brand)}
                        disabled={deletingId === brand.id}
                        title="Delete brand"
                      >
                        {deletingId === brand.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BrandDetailsDialog
        brand={viewTarget}
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.brandName || deleteTarget?.companyName}</strong>?
              This will remove their account and all uploaded media. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
