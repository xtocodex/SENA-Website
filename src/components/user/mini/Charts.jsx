import { Flex, Box } from '@/components/ui/layout';
import { cn } from '@/lib/utils';

// Minimal chart primitives for the MINI dashboard. Deliberately dependency-free
// (the app ships no chart library) and styled from theme tokens only, so both
// follow the HUD theme rather than hardcoding hexes.
//
// Conventions: one series = no legend (the card title names it); values are not
// printed on every mark — they surface on hover; axes/grid stay recessive.

// Vertical bars. Plain HTML rather than SVG so the rounded data-ends keep their
// radius at any width instead of distorting with a scaled viewBox.
export function BarChart({ data, height = 180, valueLabel = 'value' }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <Flex direction="col" className="gap-2">
      <Flex align="end" className="gap-2" style={{ height }}>
        {data.map((d) => (
          <Flex
            key={d.label}
            direction="col"
            justify="end"
            align="center"
            className="flex-1 h-full gap-1.5 group"
          >
            <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {d.value}
            </span>
            <Box
              title={`${d.label}: ${d.value} ${valueLabel}`}
              className="w-full rounded-t bg-primary/70 group-hover:bg-primary transition-colors"
              style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
            />
          </Flex>
        ))}
      </Flex>
      <Flex className="gap-2 border-t border-border pt-1.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
            {d.label}
          </span>
        ))}
      </Flex>
    </Flex>
  );
}

// Two-part donut (part-of-whole). Fixed size, so the SVG never scales unevenly.
// A 2px surface gap separates the segments per the dashboard's mark spec.
export function Donut({ segments, size = 150, thickness = 14, center, sub }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const GAP = 2;

  let offset = 0;
  const arcs = segments.map((s) => {
    const len = (s.value / total) * c;
    const arc = { ...s, dash: Math.max(len - GAP, 0), offset };
    offset += len;
    return arc;
  });

  return (
    <Flex align="center" justify="center" className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            className={a.className}
            strokeDasharray={`${a.dash} ${c - a.dash}`}
            strokeDashoffset={-a.offset}
          >
            <title>{`${a.label}: ${a.value}`}</title>
          </circle>
        ))}
      </svg>
      <Flex direction="col" align="center" className="absolute inset-0 justify-center gap-0.5 pointer-events-none">
        <span className="font-display text-xl font-bold text-foreground tabular-nums leading-none">{center}</span>
        {sub && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{sub}</span>}
      </Flex>
    </Flex>
  );
}

// Legend swatch — identity never rides on color alone; the label sits beside it.
export function LegendItem({ className, label, value }) {
  return (
    <Flex align="center" className="gap-2">
      <span className={cn('w-2.5 h-2.5 rounded-sm shrink-0', className)} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground tabular-nums ml-auto">{value}</span>
    </Flex>
  );
}
