import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { validateFile, getFileType } from "@/lib/s3";

interface FileAttachmentProps {
  onFileUpload: (fileUrl: string) => void;
  onClose: () => void;
}

export function FileAttachment({ onFileUpload, onClose }: FileAttachmentProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Get presigned URL
      const { data } = await axios.post("/api/upload", {
        fileName: file.name,
        fileType: file.type,
      });

      // Upload to S3
      await axios.put(data.presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // If it's an image, show preview
      if (getFileType(file.name) === "image") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }

      onFileUpload(data.fileUrl);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Upload File</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/20 hover:border-primary/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2 text-center">
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? "Drop the file here"
              : "Drag & drop a file here, or click to select"}
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum file size: 5MB
          </p>
        </div>
      </div>

      {uploadError && (
        <p className="mt-2 text-sm text-destructive">{uploadError}</p>
      )}

      {preview && (
        <div className="mt-4 relative aspect-video w-full">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-contain rounded-lg"
          />
        </div>
      )}

      {isUploading && (
        <p className="mt-2 text-sm text-muted-foreground">
          Uploading...
        </p>
      )}
    </div>
  );
} 