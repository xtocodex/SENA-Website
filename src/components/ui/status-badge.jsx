import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const STATUS_META = {
  pending:  { label: 'Pending',  Icon: Clock,       badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-400/20',   dotClass: 'bg-blue-400 animate-pulse' },
  approved: { label: 'Approved', Icon: CheckCircle, badgeClass: 'bg-green-500/10 text-green-500 border border-green-500/20', dotClass: 'bg-green-500' },
  rejected: { label: 'Rejected', Icon: XCircle,     badgeClass: 'bg-muted text-muted-foreground border border-border',       dotClass: 'bg-muted-foreground' },
};

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const { label, Icon, badgeClass, dotClass } = meta;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium', badgeClass)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClass)} aria-hidden="true" />
      <Icon className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
