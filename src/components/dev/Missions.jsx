import { useState, useEffect } from 'react';
import { Plus, Target, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Flex } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import { db } from '@/lib/firebase';
import {
  collection, getDocs, addDoc, deleteDoc, doc, updateDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';

const REWARD_TYPES = [
  { id: 'coins',       label: 'Coins' },
  { id: 'voucher',     label: 'Voucher' },
  { id: 'merchandise', label: 'Merchandise' },
  { id: 'exclusive',   label: 'Exclusive' },
];

const TABS = [
  { id: 'all',    label: 'All' },
  { id: 'daily',  label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
];

const EMPTY_FORM = {
  type: '',
  description: '',
  active: true,
  rewards: [],
};

export default function Missions() {
  const [missions, setMissions]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('all');

  /* ── Dialog state ── */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  /* ── Form state ── */
  const [form, setForm]               = useState(EMPTY_FORM);
  const [rewardType, setRewardType]   = useState('');
  const [rewardAmount, setRewardAmount] = useState('');

  /* ── Op states ── */
  const [saving, setSaving]         = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'missions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setMissions(snapshot.docs.map((d) => ({ docId: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMissions(); }, []);

  const filtered = tab === 'all' ? missions : missions.filter((m) => m.type === tab);

  /* ── Dialog helpers ── */
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setRewardType('');
    setRewardAmount('');
    setDialogOpen(true);
  };

  const openEdit = (mission) => {
    setEditTarget(mission);
    setForm({
      type:        mission.type,
      description: mission.description,
      active:      mission.active,
      rewards:     [...(mission.rewards || [])],
    });
    setRewardType('');
    setRewardAmount('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditTarget(null);
  };

  /* ── Rewards builder ── */
  const addReward = () => {
    if (!rewardType || !rewardAmount || Number(rewardAmount) <= 0) return;
    setForm((prev) => ({
      ...prev,
      rewards: [...prev.rewards, { type: rewardType, amount: Number(rewardAmount) }],
    }));
    setRewardType('');
    setRewardAmount('');
  };

  const removeReward = (index) => {
    setForm((prev) => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index),
    }));
  };

  const isFormValid =
    form.type &&
    form.description.trim() &&
    form.rewards.length > 0;

  /* ── CRUD handlers ── */
  const handleSave = async () => {
    if (!isFormValid) return;
    setSaving(true);
    try {
      if (editTarget) {
        const payload = {
          type:        form.type,
          description: form.description.trim(),
          active:      form.active,
          rewards:     form.rewards,
        };
        await updateDoc(doc(db, 'missions', editTarget.docId), payload);
        setMissions((prev) =>
          prev.map((m) => m.docId === editTarget.docId ? { ...m, ...payload } : m)
        );
      } else {
        const typeSnap = await getDocs(query(collection(db, 'missions'), where('type', '==', form.type)));
        const generatedId = `${form.type}_${String(typeSnap.size + 1).padStart(3, '0')}`;
        const payload = {
          id:          generatedId,
          type:        form.type,
          description: form.description.trim(),
          active:      form.active,
          rewards:     form.rewards,
        };
        const ref = await addDoc(collection(db, 'missions'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setMissions((prev) => [{ docId: ref.id, ...payload, createdAt: null }, ...prev]);
      }
      closeDialog();
    } catch (err) {
      console.error('Error saving mission:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (mission) => {
    setTogglingId(mission.docId);
    try {
      await updateDoc(doc(db, 'missions', mission.docId), { active: !mission.active });
      setMissions((prev) =>
        prev.map((m) => m.docId === mission.docId ? { ...m, active: !m.active } : m)
      );
    } catch (err) {
      console.error('Error toggling active:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.docId);
    try {
      await deleteDoc(doc(db, 'missions', deleteTarget.docId));
      setMissions((prev) => prev.filter((m) => m.docId !== deleteTarget.docId));
    } catch (err) {
      console.error('Error deleting mission:', err);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  return (
    <Flex direction="col" className="gap-6">

      {/* Header */}
      <Flex align="center" justify="between">
        <h2 className="text-lg font-semibold text-foreground">Missions</h2>
        <Button variant="default" size="sm" className="gap-2" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Mission
        </Button>
      </Flex>

      {/* Filter tabs */}
      <Flex className="gap-1 border-b border-border">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </Flex>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Rewards</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Loading missions...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No missions yet.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((mission) => (
                <TableRow
                  key={mission.docId}
                  className={deletingId === mission.docId ? 'opacity-50 pointer-events-none' : ''}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {mission.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={mission.type === 'daily' ? 'default' : 'secondary'} className="capitalize">
                      {mission.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground max-w-[200px] truncate">
                    {mission.description}
                  </TableCell>
                  <TableCell>
                    <Flex className="gap-1 flex-wrap">
                      {(mission.rewards || []).map((r, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                          {r.type} ×{r.amount}
                        </Badge>
                      ))}
                    </Flex>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={!!mission.active}
                      disabled={togglingId === mission.docId}
                      onCheckedChange={() => handleToggleActive(mission)}
                    />
                  </TableCell>
                  <TableCell>
                    <Flex align="center" className="gap-1">
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(mission)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(mission)}
                        disabled={deletingId === mission.docId}
                      >
                        {deletingId === mission.docId
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) closeDialog(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              {editTarget ? 'Edit Mission' : 'Add New Mission'}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? 'Update the details for this mission.'
                : 'Create a new mission for the game app.'}
            </DialogDescription>
          </DialogHeader>

          <Flex direction="col" className="gap-4 pt-2">

            {/* Type */}
            <Flex direction="col" className="gap-2">
              <Label htmlFor="m-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((prev) => ({ ...prev, type: v }))}
              >
                <SelectTrigger id="m-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </Flex>

            {/* Description */}
            <Flex direction="col" className="gap-2">
              <Label htmlFor="m-desc">Description</Label>
              <textarea
                id="m-desc"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Win 3 matches in a row"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </Flex>

            {/* Rewards builder */}
            <Flex direction="col" className="gap-2">
              <Label>Rewards</Label>
              <Flex className="gap-2">
                <Select value={rewardType} onValueChange={setRewardType}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Reward type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REWARD_TYPES.map(({ id, label }) => (
                      <SelectItem key={id} value={id}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-24"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReward}
                  disabled={!rewardType || !rewardAmount || Number(rewardAmount) <= 0}
                >
                  Add
                </Button>
              </Flex>

              {form.rewards.length > 0 ? (
                <Flex className="gap-1.5 flex-wrap">
                  {form.rewards.map((r, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1 capitalize">
                      {r.type} ×{r.amount}
                      <button
                        onClick={() => removeReward(i)}
                        className="ml-0.5 rounded hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </Flex>
              ) : (
                <span className="text-xs text-muted-foreground">Add at least one reward.</span>
              )}
            </Flex>

            {/* Active */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Checkbox
                checked={form.active}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, active: !!checked }))}
              />
              <span className="text-sm text-foreground">Active</span>
            </label>

            {/* Actions */}
            <Flex className="gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!isFormValid || saving}
                onClick={handleSave}
              >
                {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Create Mission'}
              </Button>
            </Flex>

          </Flex>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete mission{' '}
              <strong>{deleteTarget?.id}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
