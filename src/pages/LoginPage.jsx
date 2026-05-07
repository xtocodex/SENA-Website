import { useState } from 'react';
import { ArrowRight, User, Code, AlertCircle, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Flex, Grid, Container, Box } from "@/components/ui/layout";

export default function LoginPage() {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSelect = (selected) => {
    setRole(selected);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const collectionName = role === 'dev' ? 'devs' : 'brands';
      const q = query(
        collection(db, collectionName),
        where('email', '==', email),
        where('password', '==', password)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      const userData = snapshot.docs[0].data();
      const sessionData = {
        id: snapshot.docs[0].id,
        role: role,
        email: userData.email,
        brandName: userData.brandName || userData.name || ''
      };

      login(sessionData);

      if (role === 'brand') navigate('/brand');
      else if (role === 'dev') navigate('/dev');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      className="min-h-screen px-4 py-12"
    >
      <Container maxWidth="sm">

        {/* Logo / Wordmark */}
        <Flex direction="col" align="center" className="mb-8 gap-3">
          <Flex
            align="center"
            justify="center"
            className="w-14 h-14 rounded-2xl bg-card border border-border"
          >
            <Layers className="w-7 h-7 text-primary" />
          </Flex>
          <Flex direction="col" align="center" className="gap-1">
            <CardTitle className="text-4xl tracking-tight text-foreground">
              SENA
            </CardTitle>
            <CardDescription className="text-sm">
              Management Platform for SENA AD
            </CardDescription>
          </Flex>
        </Flex>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardDescription className="text-center text-xs uppercase tracking-widest">
              Select your role to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selector */}
            <Grid cols={2} gap={3}>
              <Button
                size="tile"
                variant={role === 'brand' ? 'outline-active' : 'outline'}
                onClick={() => handleRoleSelect('brand')}
              >
                <User />
                <span>Brand Login</span>
              </Button>
              <Button
                size="tile"
                variant={role === 'dev' ? 'outline-active' : 'outline'}
                onClick={() => handleRoleSelect('dev')}
              >
                <Code />
                <span>Dev Login</span>
              </Button>
            </Grid>

            {/* Animated Form Reveal */}
            <Grid state={role ? 'visible' : 'hidden'}>
              <Box className="overflow-hidden">
                <Flex direction="col" className="gap-4 pt-1">
                  <Separator />
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Box className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                      />
                    </Box>

                    <Box className="space-y-2">
                      <Flex justify="between" align="center">
                        <Label htmlFor="password">Password</Label>
                        
                      </Flex>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </Box>

                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                      {loading ? 'Signing in...' : `Sign in as ${role === 'brand' ? 'Brand' : role === 'dev' ? 'Dev' : '…'}`}
                      {!loading && <ArrowRight />}
                    </Button>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </form>
                </Flex>
              </Box>
            </Grid>
          </CardContent>
        </Card>

        <Flex justify="center" className="mt-6">
          <CardDescription className="text-xs">
            © {new Date().getFullYear()} GauravGo Games. All rights reserved.
          </CardDescription>
        </Flex>

      </Container>
    </Flex>
  );
}