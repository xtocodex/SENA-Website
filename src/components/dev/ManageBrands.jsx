import { useState, useEffect } from 'react';
import { Plus, UserPlus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Flex } from "@/components/ui/layout";
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { useAuth } from "@/context/AuthContext";

export default function ManageBrands() {
  const { session } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'brands'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !emailRegex.test(value)) {
      setEmailError('Enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setEmailError('');
    setPassword('');
    setConfirmPassword('');
    setConfirmPasswordError('');
    setShowPassword(false);
  };

  const handleCreate = async () => {
    if (!isFormValid) return;
    setCreating(true);

    try {
      const emailQuery = query(collection(db, 'brands'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        setEmailError('A brand with this email already exists');
        setCreating(false);
        return;
      }

      await addDoc(collection(db, 'brands'), {
        email,
        password,
        brandName: name,
        role: 'brand',
        createdAt: serverTimestamp(),
        createdBy: session.id,
      });

      setOpen(false);
      resetForm();
      fetchBrands();
    } catch (err) {
      console.error('Error creating brand:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
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
      setDeleteTarget(null);
    }
  };

  const isFormValid = !emailError && email && name && password && confirmPassword && !confirmPasswordError;

  return (
    <Flex direction="col" className="gap-6">
      <Flex align="center" justify="between">
        <h2 className="text-lg font-semibold text-foreground">Manage Brands</h2>
        <Dialog open={open} onOpenChange={(openState) => {
          setOpen(openState);
          if (!openState) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Add New Brand
              </DialogTitle>
              <DialogDescription>
                Create a new brand account with email and password.
              </DialogDescription>
            </DialogHeader>
            <Flex direction="col" className="gap-4 pt-2">
              <Flex direction="col" className="gap-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input id="brand-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" />
              </Flex>
              <Flex direction="col" className="gap-2">
                <Label htmlFor="brand-email">Email address</Label>
                <Input id="brand-email" type="email" value={email} onChange={handleEmailChange} placeholder="brand@company.com" />
                {emailError && (
                  <span className="text-[11px] text-destructive">{emailError}</span>
                )}
              </Flex>
              <Flex direction="col" className="gap-2">
                <Label htmlFor="brand-password">Password</Label>
                <div className="relative">
                  <Input
                    id="brand-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </Flex>
              <Flex direction="col" className="gap-2">
                <Label htmlFor="brand-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="brand-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="••••••••"
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {confirmPasswordError && (
                  <span className="text-[11px] text-destructive">{confirmPasswordError}</span>
                )}
              </Flex>
              <Button className="w-full" disabled={!isFormValid || creating} onClick={handleCreate}>
                {creating ? 'Creating...' : 'Create Brand'}
              </Button>
            </Flex>
          </DialogContent>
        </Dialog>
      </Flex>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Loading brands...
                </TableCell>
              </TableRow>
            ) : brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No brands yet.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium text-foreground">{brand.brandName}</TableCell>
                  <TableCell className="text-muted-foreground">{brand.email}</TableCell>
                  <TableCell>
                    <Flex align="center" className="gap-1">
                      <span className="text-muted-foreground font-mono text-xs">
                        {visiblePasswords.has(brand.id) ? brand.password : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => togglePasswordVisibility(brand.id)}
                      >
                        {visiblePasswords.has(brand.id)
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </Button>
                    </Flex>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {brand.createdAt?.toDate ? brand.createdAt.toDate().toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(brand)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.brandName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteTarget.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Flex>
  );
}
