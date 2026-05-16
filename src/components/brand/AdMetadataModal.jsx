import { useState, useEffect } from 'react';
import { CalendarIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Flex, Box } from "@/components/ui/layout";
import { cn } from "@/lib/utils";

const formatDisplay = (date) =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const formatISO = (date) => date.toISOString().split('T')[0];

const AD_PLACEMENTS = [
  { id: 'in-map',      label: 'In Map ADs' },
  { id: 'ui-board',    label: 'UI Board ADs' },
  { id: 'interactive', label: 'Interactive ADs' },
];

const AD_TYPES = [
  { id: 'product-based',  label: 'Product Based' },
  { id: 'software-based', label: 'Software Based' },
  { id: 'other',          label: 'Other' },
];

const PROJECTS = [
  { id: 'sena',    label: 'SENA' },
  { id: 'option2', label: 'Option 2' },
  { id: 'option3', label: 'Option 3' },
];

function DateButton({ date, placeholder, onSelect, disabled }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9 text-sm",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? formatDisplay(date) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function AdMetadataModal({ open, onClose, file, filePreviewUrl, ratioLabel, onConfirm, isUploading }) {
  const [startDate,  setStartDate]  = useState(null);
  const [endDate,    setEndDate]    = useState(null);
  const [placements, setPlacements] = useState([]);
  const [adType,     setAdType]     = useState('');
  const [project,    setProject]    = useState('');

  useEffect(() => {
    if (open) {
      setStartDate(null);
      setEndDate(null);
      setPlacements([]);
      setAdType('');
      setProject('');
    }
  }, [open]);

  const togglePlacement = (id) => {
    setPlacements(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const dateError = startDate && endDate && endDate <= startDate;

  const isValid =
    startDate &&
    endDate &&
    !dateError &&
    placements.length > 0 &&
    adType &&
    project;

  const handleUpload = () => {
    if (!isValid) return;
    onConfirm({
      adStartDate:  formatISO(startDate),
      adEndDate:    formatISO(endDate),
      adPlacements: placements,
      adType,
      project,
    });
  };

  const isVideo = file?.type?.startsWith('video/');

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold">Upload AD Details</DialogTitle>
        </DialogHeader>

        <Separator />

        {/* Stacks vertically on mobile, side-by-side on sm+ */}
        <Flex className="min-h-0 flex-col sm:flex-row">

          {/* Preview panel */}
          <Flex
            direction="col"
            align="center"
            justify="center"
            className="sm:w-56 w-full shrink-0 bg-muted/40 border-b sm:border-b-0 sm:border-r border-border p-5 gap-3"
          >
            <Box className="w-full max-w-[140px] sm:max-w-full rounded-xl overflow-hidden border border-border bg-background aspect-square flex items-center justify-center">
              {filePreviewUrl ? (
                isVideo ? (
                  <video
                    src={filePreviewUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    aria-label={`Preview of ${file?.name}`}
                  />
                ) : (
                  <img
                    src={filePreviewUrl}
                    alt={`Preview of ${file?.name}`}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <span className="text-xs text-muted-foreground">No preview</span>
              )}
            </Box>

            <Flex direction="col" align="center" className="gap-1 w-full text-center">
              <span className="text-xs font-medium text-foreground truncate w-full" title={file?.name}>
                {file?.name}
              </span>
              <Flex align="center" justify="center" className="gap-1.5">
                {ratioLabel && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                    {ratioLabel}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {file ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : ''}
                </span>
              </Flex>
            </Flex>
          </Flex>

          {/* Form panel */}
          <Flex direction="col" className="flex-1 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
            <Flex direction="col" className="gap-5 p-6">

              {/* 1. AD Schedule */}
              <Flex direction="col" className="gap-3">
                <Label className="text-sm font-medium">AD Schedule</Label>
                <Flex className="gap-3 flex-col xs:flex-row">
                  <Flex direction="col" className="gap-1.5 flex-1">
                    <Label htmlFor="start-date-btn" className="text-xs text-muted-foreground font-normal">
                      Start Date
                    </Label>
                    <DateButton
                      date={startDate}
                      placeholder="Pick start date"
                      onSelect={setStartDate}
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </Flex>
                  <Flex direction="col" className="gap-1.5 flex-1">
                    <Label htmlFor="end-date-btn" className="text-xs text-muted-foreground font-normal">
                      End Date
                    </Label>
                    <DateButton
                      date={endDate}
                      placeholder="Pick end date"
                      onSelect={setEndDate}
                      disabled={(d) => startDate ? d <= startDate : d < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </Flex>
                </Flex>
                {dateError && (
                  <span role="alert" className="text-xs text-destructive">
                    End date must be after start date.
                  </span>
                )}
              </Flex>

              <Separator />

              {/* 2. AD Placement */}
              <Flex direction="col" className="gap-3">
                <Label className="text-sm font-medium">AD Placement</Label>
                <Flex direction="col" className="gap-1">
                  {AD_PLACEMENTS.map(({ id, label }) => (
                    <label
                      key={id}
                      htmlFor={`placement-${id}`}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors duration-150 select-none"
                    >
                      <Checkbox
                        id={`placement-${id}`}
                        checked={placements.includes(id)}
                        onCheckedChange={() => togglePlacement(id)}
                      />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </Flex>
              </Flex>

              <Separator />

              {/* 3. AD Type */}
              <Flex direction="col" className="gap-3">
                <Label className="text-sm font-medium">AD Type</Label>
                <RadioGroup value={adType} onValueChange={setAdType} className="gap-1">
                  {AD_TYPES.map(({ id, label }) => (
                    <label
                      key={id}
                      htmlFor={`adtype-${id}`}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-md cursor-pointer hover:bg-accent transition-colors duration-150 select-none"
                    >
                      <RadioGroupItem value={id} id={`adtype-${id}`} />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </Flex>

              <Separator />

              {/* 4. Project */}
              <Flex direction="col" className="gap-3">
                <Label htmlFor="project-select" className="text-sm font-medium">Project</Label>
                <Select value={project} onValueChange={setProject}>
                  <SelectTrigger id="project-select" className="w-full">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECTS.map(({ id, label }) => (
                      <SelectItem key={id} value={id}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Flex>

            </Flex>

            {/* Footer */}
            <Flex justify="end" className="gap-2 px-6 py-4 border-t border-border bg-background/50 mt-auto">
              <Button variant="outline" onClick={onClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!isValid || isUploading} className="gap-2">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  'Upload AD'
                )}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </DialogContent>
    </Dialog>
  );
}
