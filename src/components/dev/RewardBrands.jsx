import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Loader2, Gift, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Flex, Box } from "@/components/ui/layout";
import {
  subscribeRewardBrands, createRewardBrand, updateRewardBrand, deleteRewardBrand,
  uploadRewardBrandLogo,
} from "@/lib/rewards";

const EMPTY_FORM = {
  name: '',
  logoUrl: '',
  totalCoupons: '',
  availableCoupons: '',
  active: true,
  denominations: [{ value: '', coinCost: '' }],
};

function BrandFormDialog({ open, onClose, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial
        ? {
            name: initial.name || '',
            logoUrl: initial.logoUrl || '',
            totalCoupons: String(initial.totalCoupons ?? ''),
            availableCoupons: String(initial.availableCoupons ?? ''),
            active: initial.active !== false,
            denominations: (initial.denominations?.length
              ? initial.denominations.map((d) => ({ value: String(d.value ?? ''), coinCost: String(d.coinCost ?? '') }))
              : [{ value: '', coinCost: '' }]),
          }
        : EMPTY_FORM);
      setSaving(false);
    }
  }, [open, initial]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleLogoFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadRewardBrandLogo(file);
      setField('logoUrl', url);
      toast.success('Logo uploaded.');
    } catch (err) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const setDenom = (i, k, v) => setForm((f) => ({
    ...f,
    denominations: f.denominations.map((d, idx) => idx === i ? { ...d, [k]: v } : d),
  }));
  const addDenom = () => setForm((f) => ({ ...f, denominations: [...f.denominations, { value: '', coinCost: '' }] }));
  const removeDenom = (i) => setForm((f) => ({
    ...f,
    denominations: f.denominations.filter((_, idx) => idx !== i),
  }));

  const cleanDenoms = form.denominations
    .map((d) => ({ value: Number(d.value), coinCost: Number(d.coinCost) }))
    .filter((d) => d.value > 0 && d.coinCost > 0);

  const valid = form.name.trim()
    && form.totalCoupons !== '' && Number(form.totalCoupons) >= 0
    && form.availableCoupons !== '' && Number(form.availableCoupons) >= 0
    && cleanDenoms.length > 0;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        logoUrl: form.logoUrl.trim(),
        totalCoupons: Number(form.totalCoupons),
        availableCoupons: Number(form.availableCoupons),
        active: form.active,
        denominations: cleanDenoms,
      };
      if (initial) {
        await updateRewardBrand(initial.id, payload);
        toast.success(`${payload.name} updated.`);
      } else {
        await createRewardBrand(payload);
        toast.success(`${payload.name} added.`);
      }
      onClose();
    } catch (err) {
      toast.error(`Save failed: ${err.message}`);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit reward brand' : 'Add reward brand'}</DialogTitle>
          <DialogDescription>Coupon partner shown to players in the Rewards section.</DialogDescription>
        </DialogHeader>

        <Flex direction="col" className="gap-4 pt-1">
          <Box className="space-y-2">
            <Label htmlFor="rb-name">Brand name</Label>
            <Input id="rb-name" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Flipkart" />
          </Box>

          <Box className="space-y-2">
            <Label htmlFor="rb-logo">Brand logo</Label>
            <Flex align="center" className="gap-3">
              <Flex align="center" justify="center" className="w-12 h-12 rounded-md bg-muted border border-border overflow-hidden shrink-0">
                {form.logoUrl
                  ? <img src={form.logoUrl} alt="" className="w-full h-full object-contain" />
                  : <Gift className="w-5 h-5 text-muted-foreground" />}
              </Flex>
              <Box className="space-y-2 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFile}
                />
                <Button
                  type="button" variant="outline" size="sm" className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()} disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading…' : 'Upload image'}
                </Button>
                <Input
                  id="rb-logo" value={form.logoUrl}
                  onChange={(e) => setField('logoUrl', e.target.value)}
                  placeholder="…or paste a direct image URL"
                />
              </Box>
            </Flex>
          </Box>

          <Flex className="gap-3">
            <Box className="space-y-2 flex-1">
              <Label htmlFor="rb-total">Total coupons</Label>
              <Input id="rb-total" type="number" min="0" value={form.totalCoupons} onChange={(e) => setField('totalCoupons', e.target.value)} />
            </Box>
            <Box className="space-y-2 flex-1">
              <Label htmlFor="rb-avail">Available coupons</Label>
              <Input id="rb-avail" type="number" min="0" value={form.availableCoupons} onChange={(e) => setField('availableCoupons', e.target.value)} />
            </Box>
          </Flex>

          <Box className="space-y-2">
            <Flex align="center" justify="between">
              <Label>Denominations (₹ value → coin cost)</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addDenom}>
                <Plus className="w-3 h-3" /> Add
              </Button>
            </Flex>
            <Flex direction="col" className="gap-2">
              {form.denominations.map((d, i) => (
                <Flex key={i} align="center" className="gap-2">
                  <Input
                    type="number" min="0" placeholder="₹ value"
                    value={d.value} onChange={(e) => setDenom(i, 'value', e.target.value)}
                  />
                  <span className="text-muted-foreground text-xs shrink-0">→</span>
                  <Input
                    type="number" min="0" placeholder="coins"
                    value={d.coinCost} onChange={(e) => setDenom(i, 'coinCost', e.target.value)}
                  />
                  <Button
                    type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeDenom(i)} disabled={form.denominations.length <= 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </Flex>
              ))}
            </Flex>
          </Box>

          <Flex align="center" className="gap-2">
            <Checkbox id="rb-active" checked={form.active} onCheckedChange={(v) => setField('active', !!v)} />
            <Label htmlFor="rb-active" className="cursor-pointer">Active (visible to players)</Label>
          </Flex>
        </Flex>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!valid || saving || uploading}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {initial ? 'Save changes' : 'Add brand'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RewardBrands() {
  const [brands, setBrands] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = subscribeRewardBrands(setBrands);
    return () => unsub();
  }, []);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (b) => { setEditing(b); setFormOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRewardBrand(deleteTarget.id);
      toast.success(`${deleteTarget.name} removed.`);
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Flex direction="col" className="gap-4">
      <Flex align="center" justify="between">
        <span className="text-sm text-muted-foreground">Manage the coupon partners players can redeem.</span>
        <Button size="sm" className="gap-1.5" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Brand
        </Button>
      </Flex>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Coupons</TableHead>
              <TableHead>Denominations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands === null ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
            ) : brands.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No reward brands yet.</TableCell></TableRow>
            ) : (
              brands.map((b) => (
                <TableRow key={b.id} className={deleting && deleteTarget?.id === b.id ? 'opacity-50 pointer-events-none' : ''}>
                  <TableCell>
                    <Flex align="center" className="gap-2.5">
                      <Flex align="center" justify="center" className="w-8 h-8 rounded-md bg-muted border border-border overflow-hidden shrink-0">
                        {b.logoUrl ? <img src={b.logoUrl} alt="" className="w-full h-full object-contain" /> : <Gift className="w-4 h-4 text-muted-foreground" />}
                      </Flex>
                      <span className="font-medium text-foreground">{b.name}</span>
                    </Flex>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{b.availableCoupons ?? 0}/{b.totalCoupons ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{b.denominations?.length || 0} options</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={b.active !== false ? 'text-green-500' : 'text-muted-foreground'}>
                      {b.active !== false ? 'Active' : 'Hidden'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Flex align="center" justify="end" className="gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(b)} title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(b)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BrandFormDialog open={formOpen} onClose={() => setFormOpen(false)} initial={editing} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete reward brand</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{deleteTarget?.name}</strong> from the rewards catalog? Existing requests are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
