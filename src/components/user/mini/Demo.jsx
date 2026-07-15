import { FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Flex } from '@/components/ui/layout';

// Shared DEMO treatment for SENA MINI showcase sections.
// Rule: a section is either 100% live or 100% mock. Every mock-backed page
// renders <DemoBanner /> at the top and <DemoBadge /> in its section header,
// so sample data can never be mistaken for real telemetry.

export function DemoBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 border-primary/40 text-primary font-display text-[10px] uppercase tracking-widest px-1.5 py-0 h-5"
    >
      <FlaskConical className="w-3 h-3" />
      Demo
    </Badge>
  );
}

export function DemoBanner({ feature }) {
  return (
    <Flex
      align="center"
      className="gap-2.5 rounded-md border border-dashed border-primary/30 bg-primary/5 px-4 py-2.5"
    >
      <FlaskConical className="w-4 h-4 text-primary shrink-0" />
      <p className="text-xs text-muted-foreground">
        <span className="text-foreground font-medium">Preview mode.</span>{' '}
        {feature ? `${feature} shows ` : 'This section shows '}
        sample data — it goes live when SENA MINI ships this feature. Your real stats stay on
        Overview &amp; Leaderboard.
      </p>
    </Flex>
  );
}

// Section header used by every demo page: title + DEMO badge.
export function DemoSectionHeader({ icon: Icon, title }) {
  return (
    <Flex align="center" className="gap-2">
      {Icon && <Icon className="w-4 h-4 text-primary" />}
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-display font-semibold">
        // {title}
      </span>
      <DemoBadge />
    </Flex>
  );
}

// Any interactive control inside a demo section calls this instead of a
// real action.
export const demoAction = (what) =>
  toast.info(`${what} is a demo preview — coming soon to SENA MINI.`);
