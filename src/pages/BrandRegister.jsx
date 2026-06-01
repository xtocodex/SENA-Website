import { useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { toast } from 'sonner';
import { ArrowRight, ImagePlus, VideoIcon, Loader2, X, CheckCircle, LogOut, Gamepad2 } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { submitBrandRequest, resubmitBrandRequest, uploadBrandSample } from '@/lib/brandRequest';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Flex, Grid, Container, Box } from "@/components/ui/layout";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const EMPTY_FIELDS = {
  name: '',
  companyName: '',
  address: '',
  phone: '',
  operatingProducts: '',
  additionalInfo: '',
};

function StepHeader({ step }) {
  return (
    <Flex align="center" justify="center" className="gap-2 pt-1 pb-3">
      {[1, 2, 3].map((s) => (
        <Flex key={s} align="center" className="gap-2">
          <Box className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold",
            s < step ? "bg-primary text-primary-foreground"
              : s === step ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            {s < step ? <CheckCircle className="w-3 h-3" /> : s}
          </Box>
          {s < 3 && <Box className={cn("w-8 h-px", s < step ? "bg-primary" : "bg-border")} />}
        </Flex>
      ))}
    </Flex>
  );
}

function FilePreviewList({ files, kind, onRemove }) {
  if (!files.length) return null;
  return (
    <Grid gap={2} className="grid-cols-3 sm:grid-cols-4">
      {files.map((f, i) => {
        const url = URL.createObjectURL(f);
        return (
          <Box key={`${f.name}-${f.size}-${i}`} className="relative rounded-md border border-border bg-card overflow-hidden aspect-square group">
            {kind === 'image' ? (
              <img src={url} alt={f.name} className="w-full h-full object-cover" />
            ) : (
              <video src={url} muted playsInline className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/90 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove ${f.name}`}
            >
              <X className="w-3 h-3" />
            </button>
            <Box className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-background/80">
              <span className="text-[9px] text-muted-foreground truncate block" title={f.name}>{f.name}</span>
            </Box>
          </Box>
        );
      })}
    </Grid>
  );
}

export default function BrandRegister({ user, initialData = null, resubmit = false, onSubmitted }) {
  const { logout } = useAuth();
  const [step, setStep] = useState(user ? 2 : 1);
  const [signingIn, setSigningIn] = useState(false);
  const [signinError, setSigninError] = useState('');

  const [fields, setFields] = useState({
    ...EMPTY_FIELDS,
    name: initialData?.name || (user?.displayName ?? ''),
    companyName: initialData?.companyName || '',
    address: initialData?.address || '',
    phone: initialData?.phone ? String(initialData.phone).replace(/^\+91/, '') : '',
    operatingProducts: initialData?.operatingProducts || '',
    additionalInfo: initialData?.additionalInfo || '',
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && step === 1) setStep(2);
  }, [user, step]);

  const setField = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }));

  const setPhone = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFields(f => ({ ...f, phone: digits }));
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    setSigninError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // BrandGate will pick up the auth state and re-render with user
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setSigninError(err.message || 'Sign-in failed. Please try again.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const onImageInput = (e) => {
    const picked = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...picked]);
    e.target.value = '';
  };
  const onVideoInput = (e) => {
    const picked = Array.from(e.target.files || []);
    setVideos(prev => [...prev, ...picked]);
    e.target.value = '';
  };

  const validate = () => {
    const next = {};
    if (!fields.name.trim()) next.name = 'Required';
    if (!fields.companyName.trim()) next.companyName = 'Required';
    if (!fields.address.trim()) next.address = 'Required';
    if (fields.phone.length !== 10) next.phone = 'Enter a 10-digit phone number';
    if (!fields.operatingProducts.trim()) next.operatingProducts = 'Required';
    if (images.length === 0) next.images = 'Upload at least 1 sample image';
    if (videos.length === 0) next.videos = 'Upload at least 1 sample video';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      const imageUploads = await Promise.all(images.map(f => uploadBrandSample(user.uid, f, 'image')));
      const videoUploads = await Promise.all(videos.map(f => uploadBrandSample(user.uid, f, 'video')));

      const payload = {
        name: fields.name.trim(),
        companyName: fields.companyName.trim(),
        address: fields.address.trim(),
        phone: `+91${fields.phone}`,
        email: user.email,
        operatingProducts: fields.operatingProducts.trim(),
        additionalInfo: fields.additionalInfo.trim(),
        sampleImages: imageUploads.map(u => u.url),
        sampleImagePaths: imageUploads.map(u => u.storagePath),
        sampleVideos: videoUploads.map(u => u.url),
        sampleVideoPaths: videoUploads.map(u => u.storagePath),
      };

      if (resubmit) {
        await resubmitBrandRequest(user.uid, payload);
      } else {
        await submitBrandRequest(user.uid, payload);
      }

      setStep(3);
      toast.success('Request submitted successfully.');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex direction="col" align="center" justify="center" className="min-h-screen px-4 py-12 relative">
      {user && (
        <Box className="absolute top-5 right-5">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </Box>
      )}

      <Container maxWidth="lg">
        <Flex direction="col" align="center" className="mb-6 gap-3">
          <Flex align="center" justify="center" className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
            <Gamepad2 className="w-7 h-7 text-primary" />
          </Flex>
          <Flex direction="col" align="center" className="gap-1">
            <span className="text-2xl font-black tracking-tight text-foreground">
              GauravGo<span className="text-primary">Games</span>
            </span>
            <CardDescription className="text-sm">Brand Registration</CardDescription>
          </Flex>
        </Flex>

        <Card>
          <CardHeader>
            <StepHeader step={step} />
            <CardTitle className="text-center text-base">
              {step === 1 && 'Sign in with Google to continue'}
              {step === 2 && (resubmit ? 'Update your details and resubmit' : 'Tell us about your brand')}
              {step === 3 && 'Request submitted'}
            </CardTitle>
            <CardDescription className="text-center text-xs">
              {step === 1 && 'Use your work Google account to register your brand.'}
              {step === 2 && 'All fields are required unless marked optional.'}
              {step === 3 && 'Our team will review your submission shortly.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* ── STEP 1: Google sign-in ── */}
            {step === 1 && (
              <Flex direction="col" className="gap-4">
                <Button size="lg" className="w-full" onClick={handleGoogleSignIn} disabled={signingIn}>
                  {signingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue with Google'}
                  {!signingIn && <ArrowRight className="w-4 h-4" />}
                </Button>
                {signinError && <span className="text-xs text-destructive text-center">{signinError}</span>}
              </Flex>
            )}

            {/* ── STEP 2: Form ── */}
            {step === 2 && user && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Grid cols={2} gap={4} className="grid-cols-1 sm:grid-cols-2">
                  <Box className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" value={fields.name} onChange={setField('name')} placeholder="John Doe" />
                    {errors.name && <span className="text-[11px] text-destructive">{errors.name}</span>}
                  </Box>
                  <Box className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" value={fields.companyName} onChange={setField('companyName')} placeholder="Acme Corp" />
                    {errors.companyName && <span className="text-[11px] text-destructive">{errors.companyName}</span>}
                  </Box>
                </Grid>

                <Grid cols={2} gap={4} className="grid-cols-1 sm:grid-cols-2">
                  <Box className="space-y-2">
                    <Label htmlFor="email">Email (from Google)</Label>
                    <Input id="email" value={user.email || ''} readOnly className="bg-muted text-muted-foreground" />
                  </Box>
                  <Box className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Flex align="center" className="gap-2">
                      <span className="text-sm text-muted-foreground">+91</span>
                      <Input id="phone" value={fields.phone} onChange={setPhone} placeholder="9876543210" inputMode="numeric" />
                    </Flex>
                    {errors.phone && <span className="text-[11px] text-destructive">{errors.phone}</span>}
                  </Box>
                </Grid>

                <Box className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={fields.address} onChange={setField('address')} placeholder="Street, City, State, Pincode" />
                  {errors.address && <span className="text-[11px] text-destructive">{errors.address}</span>}
                </Box>

                <Box className="space-y-2">
                  <Label htmlFor="operatingProducts">Operating Products</Label>
                  <textarea
                    id="operatingProducts"
                    value={fields.operatingProducts}
                    onChange={setField('operatingProducts')}
                    placeholder="e.g. Athletic apparel, footwear, accessories"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                  {errors.operatingProducts && <span className="text-[11px] text-destructive">{errors.operatingProducts}</span>}
                </Box>

                <Box className="space-y-2">
                  <Label htmlFor="additionalInfo">Additional Information <span className="text-muted-foreground text-[10px]">(optional)</span></Label>
                  <textarea
                    id="additionalInfo"
                    value={fields.additionalInfo}
                    onChange={setField('additionalInfo')}
                    placeholder="Anything else you'd like us to know"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                </Box>

                <Separator />

                {/* Sample images */}
                <Flex direction="col" className="gap-2">
                  <Flex align="center" justify="between">
                    <Label>Sample Images <span className="text-muted-foreground text-[10px]">(at least 1)</span></Label>
                    <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                      <label className="cursor-pointer">
                        <ImagePlus className="w-4 h-4" />
                        Add Images
                        <input type="file" accept="image/*" multiple onChange={onImageInput} className="hidden" />
                      </label>
                    </Button>
                  </Flex>
                  <FilePreviewList files={images} kind="image" onRemove={(i) => setImages(prev => prev.filter((_, idx) => idx !== i))} />
                  {errors.images && <span className="text-[11px] text-destructive">{errors.images}</span>}
                </Flex>

                {/* Sample videos */}
                <Flex direction="col" className="gap-2">
                  <Flex align="center" justify="between">
                    <Label>Sample Videos <span className="text-muted-foreground text-[10px]">(at least 1)</span></Label>
                    <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                      <label className="cursor-pointer">
                        <VideoIcon className="w-4 h-4" />
                        Add Videos
                        <input type="file" accept="video/*" multiple onChange={onVideoInput} className="hidden" />
                      </label>
                    </Button>
                  </Flex>
                  <FilePreviewList files={videos} kind="video" onRemove={(i) => setVideos(prev => prev.filter((_, idx) => idx !== i))} />
                  {errors.videos && <span className="text-[11px] text-destructive">{errors.videos}</span>}
                </Flex>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : (resubmit ? 'Resubmit Request' : 'Submit Request')}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            )}

            {/* ── STEP 3: Confirmation ── */}
            {step === 3 && (
              <Flex direction="col" align="center" className="gap-3 py-6">
                <Flex align="center" justify="center" className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20">
                  <CheckCircle className="w-7 h-7 text-primary" />
                </Flex>
                <span className="text-base font-medium text-foreground text-center">
                  Your request has been submitted.
                </span>
                <span className="text-sm text-muted-foreground text-center">
                  Please wait for review. We'll show your status here as soon as our team responds.
                </span>
              </Flex>
            )}
          </CardContent>
        </Card>
      </Container>
    </Flex>
  );
}
