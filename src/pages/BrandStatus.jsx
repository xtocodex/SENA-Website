import { Clock, XCircle, LogOut, Gamepad2, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Flex, Container, Box } from "@/components/ui/layout";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/context/AuthContext';

export default function BrandStatus({ request, onResubmit }) {
  const { logout } = useAuth();
  const status = request?.status || 'pending';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <Flex direction="col" align="center" justify="center" className="min-h-screen px-4 py-12 relative">
      <Box className="absolute top-5 right-5">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={logout}>
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </Box>

      <Container maxWidth="sm">
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
            <Flex justify="center" className="pb-2">
              <Flex align="center" justify="center" className={`w-14 h-14 rounded-full ${isRejected ? 'bg-destructive/10 border border-destructive/20' : 'bg-primary/10 border border-primary/20'}`}>
                {isRejected
                  ? <XCircle className="w-7 h-7 text-destructive" />
                  : <Clock className="w-7 h-7 text-primary" />}
              </Flex>
            </Flex>
            <CardTitle className="text-center text-base">
              {isPending && 'Your request is under review'}
              {isRejected && 'Your request was not approved'}
            </CardTitle>
            <CardDescription className="text-center text-xs">
              {isPending && 'Our team is reviewing your submission. You\'ll be redirected automatically once it\'s approved.'}
              {isRejected && 'Please review the feedback below and update your details.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {request?.companyName && (
              <Box className="rounded-lg border border-border bg-card/50 p-4">
                <Flex direction="col" className="gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Submitted as</span>
                  <span className="text-sm text-foreground font-medium">{request.companyName}</span>
                  <span className="text-xs text-muted-foreground">{request.email}</span>
                </Flex>
              </Box>
            )}

            {isRejected && request?.feedback && (
              <Box className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <Flex direction="col" className="gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-destructive font-medium">Feedback from our team</span>
                  <span className="text-sm text-foreground whitespace-pre-wrap">{request.feedback}</span>
                </Flex>
              </Box>
            )}

            {isRejected && (
              <>
                <Separator />
                <Button size="lg" className="w-full gap-2" onClick={onResubmit}>
                  <Pencil className="w-4 h-4" />
                  Edit &amp; Resubmit
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Flex>
  );
}
