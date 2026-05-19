import { useState, useEffect } from 'react';
import { CalendarIcon, Loader2, PlayCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Flex } from "@/components/ui/layout";
import { cn } from '@/lib/utils';
import { PLACEMENT_LABELS, TYPE_LABELS, PROJECT_LABELS } from '@/lib/adConstants';

const formatDisplay = (date) =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const formatISO = (date) => date.toISOString().split('T')[0];

const parseISO = (str) => (str ? new Date(str + 'T00:00:00') : null);

function DateButton({ label, date, onSelect, id }) {
  const [open, setOpen] = useState(false);
  return (
    <Flex direction="col" className="gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDisplay(date) : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onDayClick={(d) => { onSelect(d); setOpen(false); }}
          />
        </PopoverContent>
      </Popover>
    </Flex>
  );
}

export default function RunScheduleModal({ item, open, onClose, onSchedule }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate,   setEndDate]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [dateError, setDateError] = useState(null);

  // Pre-fill from brand's requested dates whenever item changes
  useEffect(() => {
    if (item) {
      setStartDate(parseISO(item.adStartDate));
      setEndDate(parseISO(item.adEndDate));
      setDateError(null);
      setLoading(false);
    }
  }, [item?.id]);

  useEffect(() => {
    if (startDate && endDate && endDate <= startDate) {
      setDateError('End date must be after start date.');
    } else {
      setDateError(null);
    }
  }, [startDate, endDate]);

  const isValid = startDate && endDate && !dateError;

  const handleSchedule = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await onSchedule({
        opStartDate: formatISO(startDate),
        opEndDate:   formatISO(endDate),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !loading) onClose(); }}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle>Schedule AD</DialogTitle>
        </DialogHeader>

        <Flex className="gap-6 flex-col sm:flex-row">

          {/* Left: preview + metadata */}
          <Flex direction="col" className="gap-3 sm:w-2/5 shrink-0">
            <div className="rounded-lg overflow-hidden bg-muted aspect-square w-full">
              {item.format === 'video' ? (
                <video
                  src={item.thumbnailUrl || item.url}
                  className="w-full h-full object-cover"
                  muted playsInline
                />
              ) : (
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <Flex direction="col" className="gap-0.5">
              <span className="text-sm font-medium text-foreground truncate" title={item.fileName}>
                {item.fileName}
              </span>
              <span className="text-xs text-muted-foreground">{item.brandName}</span>
            </Flex>

            <Flex className="flex-wrap gap-1">
              {item.adPlacements?.map(p => (
                <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                  {PLACEMENT_LABELS[p] ?? p}
                </Badge>
              ))}
              {item.adType && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                  {TYPE_LABELS[item.adType] ?? item.adType}
                </Badge>
              )}
              {item.project && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 uppercase">
                  {PROJECT_LABELS[item.project] ?? item.project}
                </Badge>
              )}
            </Flex>

            {(item.adStartDate || item.adEndDate) && (
              <span className="text-[10px] text-muted-foreground">
                Requested: {item.adStartDate} → {item.adEndDate}
              </span>
            )}
          </Flex>

          {/* Right: date pickers */}
          <Flex direction="col" className="flex-1 gap-4 justify-center">
            <Flex direction="col" className="gap-1">
              <span className="text-sm font-medium text-foreground">Set Schedule</span>
              <span className="text-xs text-muted-foreground">
                Pre-filled from the brand's request. Adjust if needed.
              </span>
            </Flex>

            <DateButton
              label="Start Date"
              date={startDate}
              onSelect={setStartDate}
              id="op-start-date"
            />
            <DateButton
              label="End Date"
              date={endDate}
              onSelect={setEndDate}
              id="op-end-date"
            />

            {dateError && (
              <span role="alert" className="text-xs text-destructive">{dateError}</span>
            )}
          </Flex>

        </Flex>

        <DialogFooter className="mt-2 gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!isValid || loading}>
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
              : <PlayCircle className="h-4 w-4 mr-2" />}
            {loading ? 'Scheduling…' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
