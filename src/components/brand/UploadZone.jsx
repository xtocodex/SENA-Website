import { useState, useRef } from 'react';
import { Upload, FileImage, FileVideo, Info, Loader2, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flex, Box } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { uploadMedia } from "@/lib/uploadMedia";

export default function UploadZone({ type = 'image' }) {
  const { session } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const isImage = type === 'image';
  const Icon = isImage ? FileImage : FileVideo;
  const acceptLabel = isImage
    ? 'JPG, PNG, WebP'
    : 'MP4, MOV, WebM';
  const acceptAttr = isImage
    ? "image/jpeg,image/png,image/webp"
    : "video/mp4,video/quicktime,video/webm";

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!session?.id) return;
    setUploadResult(null);
    setIsUploading(true);

    const result = await uploadMedia(file, session.id, type);

    if (result.success) {
      setUploadResult({ success: true, fileName: file.name });
    } else {
      setUploadResult({ success: false, error: result.error });
    }
    setIsUploading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = '';
  };

  return (
    <Flex direction="col" className="gap-6 max-w-2xl w-full mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        accept={acceptAttr}
        onChange={handleFileChange}
        className="hidden"
      />
      {/* Drop Zone */}
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Upload ${isImage ? 'image' : 'video'} files. Click or press Enter to browse.`}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed transition-colors duration-200 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
        )}
      >
        <Flex direction="col" align="center" justify="center" className="gap-4 py-16 px-8">
          <Flex
            align="center"
            justify="center"
            className={cn(
              "w-16 h-16 rounded-2xl border transition-colors",
              isDragging ? "border-primary bg-primary/10" : "border-border bg-secondary"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            ) : (
              <Upload className={cn("w-7 h-7", isDragging ? "text-primary" : "text-muted-foreground")} />
            )}
          </Flex>

          <Flex direction="col" align="center" className="gap-1">
            <span className="text-base font-medium text-foreground">
              {isUploading ? 'Uploading...' : isDragging ? 'Drop to upload' : `Drag & drop ${isImage ? 'images' : 'videos'} here`}
            </span>
            <span className="text-sm text-muted-foreground">
              or click to browse files
            </span>
          </Flex>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <Icon className="w-4 h-4" />
            Browse {isImage ? 'Images' : 'Videos'}
          </Button>
        </Flex>
      </Box>

      {uploadResult?.success && (
        <Flex align="center" justify="center" className="gap-2">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-sm text-green-500 font-medium">
            {uploadResult.fileName} uploaded successfully
          </span>
        </Flex>
      )}

      {!uploadResult?.success && uploadResult?.error && (
        <Box className="text-center">
          <span className="text-sm text-red-500 font-medium">
            {uploadResult.error}
          </span>
        </Box>
      )}

      {/* Specs Card */}
      <Card>
        <CardContent className="py-4 px-5">
          <Flex direction="col" className="gap-3">
            <Flex align="center" className="gap-2">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">Upload Requirements</span>
            </Flex>

            <Separator />

            <Flex direction="col" className="gap-2">
              {[
                { label: 'Accepted formats', value: acceptLabel },
                { label: 'Accepted aspect ratios', value: '1:1 · 9:16 · 16:9 only' },
                { label: 'Max file size', value: isImage ? '2 MB per image' : '10 MB per video' },
              ].map(({ label, value }) => (
                <Flex key={label} justify="between" align="start" className="gap-4">
                  <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                  <span className="text-xs text-foreground text-right">{value}</span>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </CardContent>
      </Card>
    </Flex>
  );
}
