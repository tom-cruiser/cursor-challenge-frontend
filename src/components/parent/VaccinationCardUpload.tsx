import { useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { cn } from "@/lib/cn";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;

interface VaccinationCardUploadProps {
  childName: string;
  imageUrl: string | null;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}

export function VaccinationCardUpload({
  childName,
  imageUrl,
  onUpload,
  onRemove,
}: VaccinationCardUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function validateAndUpload(file: File) {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpload(reader.result);
      }
    };
    reader.onerror = () => setError("Failed to read image. Please try again.");
    reader.readAsDataURL(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Physical Vaccination Card Backup</CardTitle>
        <CardDescription>
          Upload a photo of {childName}&apos;s paper immunization record for quick reference.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          className="sr-only"
          aria-label={`Upload vaccination card for ${childName}`}
        />

        {imageUrl ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-muted ring-1 ring-border-subtle">
              <img
                src={imageUrl}
                alt={`Vaccination card backup for ${childName}`}
                className="max-h-72 w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Replace Image
              </Button>
              <Button variant="ghost" size="sm" onClick={onRemove}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all",
              isDragging
                ? "border-accent/50 bg-accent-glow/20"
                : "border-border-subtle bg-surface-muted/30 hover:border-border-strong hover:bg-surface-muted/50",
            )}
            aria-label="Upload vaccination card image"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-overlay ring-1 ring-border-subtle">
              <ImagePlus className="h-6 w-6 text-health-text-muted" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-medium text-health-text">
              Click or drag to upload
            </p>
            <p className="mt-1 text-xs text-health-text-muted">
              JPG, PNG, or WebP · Max {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-danger-bright" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
