import { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flex } from "@/components/ui/layout";
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION = 'appVersions';
const DOC_ID     = 'config';

export default function AppVersion() {
  const [androidVersion, setAndroidVersion] = useState('');
  const [iosVersion, setIosVersion]         = useState('');
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [status, setStatus]                 = useState(null); // 'success' | 'error'

  const fetchVersion = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
      if (snap.exists()) {
        const data = snap.data();
        setAndroidVersion(data.android_version ?? '');
        setIosVersion(data.ios_version ?? '');
      }
    } catch (err) {
      console.error('Error fetching app version:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVersion(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await setDoc(doc(db, COLLECTION, DOC_ID), {
        android_version: androidVersion.trim(),
        ios_version:     iosVersion.trim(),
      }, { merge: true });
      setStatus('success');
    } catch (err) {
      console.error('Error saving app version:', err);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = androidVersion.trim() || iosVersion.trim();

  return (
    <Flex direction="col" className="gap-6">

      {/* Header */}
      <Flex align="center" justify="between">
        <h2 className="text-lg font-semibold text-foreground">App Version</h2>
      </Flex>

      <div className="rounded-xl border border-border bg-card p-6 max-w-sm">
        {loading ? (
          <span className="text-sm text-muted-foreground">Loading...</span>
        ) : (
          <Flex direction="col" className="gap-5">

            {/* Android */}
            <Flex direction="col" className="gap-2">
              <Label htmlFor="android-version">Android Version</Label>
              <Input
                id="android-version"
                value={androidVersion}
                onChange={(e) => { setAndroidVersion(e.target.value); setStatus(null); }}
                placeholder="1.0.0"
              />
            </Flex>

            {/* iOS */}
            <Flex direction="col" className="gap-2">
              <Label htmlFor="ios-version">iOS Version</Label>
              <Input
                id="ios-version"
                value={iosVersion}
                onChange={(e) => { setIosVersion(e.target.value); setStatus(null); }}
                placeholder="1.0.0"
              />
            </Flex>

            {/* Inline feedback */}
            {status === 'success' && (
              <Flex align="center" className="gap-2 text-sm text-primary">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Saved successfully.
              </Flex>
            )}
            {status === 'error' && (
              <Flex align="center" className="gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                Failed to save. Please try again.
              </Flex>
            )}

            <Button
              onClick={handleSave}
              disabled={!isFormValid || saving}
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Versions'}
            </Button>

          </Flex>
        )}
      </div>

    </Flex>
  );
}
