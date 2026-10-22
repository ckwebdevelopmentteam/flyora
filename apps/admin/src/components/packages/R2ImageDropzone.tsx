import { useState, useRef } from "react";
import {
  UploadCloud,
  X,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { packagesApi } from "../../lib/packagesApi";

interface R2ImageDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "packages" | "destinations";
  label?: string;
  helperText?: string;
}

export const R2ImageDropzone = ({
  value,
  onChange,
  folder = "packages",
  label = "Cover Image",
  helperText = "PNG, JPG, or WEBP up to 10MB. Stored directly on Cloudflare R2.",
}: R2ImageDropzoneProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    // Basic validation
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image file size must not exceed 10MB");
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Request presigned upload URL from Fastify
      const { uploadUrl, publicUrl } = await packagesApi.getPresignedUploadUrl(
        file.name,
        file.type,
        folder,
      );

      // Step 2: Stream binary directly to Cloudflare R2 presigned PUT
      await packagesApi.directUploadToR2(uploadUrl, file, (percent) => {
        setUploadProgress(percent);
      });

      // Step 3: Emit public URL to parent form
      onChange(publicUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload image to storage");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-zinc-900 tracking-tight">
          {label}
        </label>
        {value && !isUploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] text-zinc-500 hover:text-red-600 transition flex items-center gap-1 font-mono"
          >
            <X className="w-3 h-3" />
            Remove
          </button>
        )}
      </div>

      {value ? (
        // Preview State
        <div className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-white p-2">
          <div className="relative aspect-video w-full rounded-md overflow-hidden bg-zinc-100 flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If direct R2 media domain doesn't load in dev, show placeholder
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md bg-white text-black text-xs font-medium shadow-sm hover:bg-zinc-100 transition"
              >
                Replace Photo
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[280px]">
              {value}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono">
              R2 Direct
            </span>
          </div>
        </div>
      ) : (
        // Dropzone State
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative rounded-lg border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
            isDragging
              ? "border-black bg-zinc-100/50"
              : "border-zinc-200 bg-[#FAFAF9] hover:bg-zinc-100/40 hover:border-zinc-300"
          } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
        >
          {isUploading ? (
            <div className="w-full max-w-xs space-y-3 py-2">
              <Loader2 className="w-6 h-6 animate-spin text-black mx-auto" />
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                  <span>Uploading to Cloudflare R2...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-2 shadow-xs">
                <UploadCloud className="w-5 h-5 text-zinc-600 stroke-[1.5]" />
              </div>
              <p className="text-xs font-medium text-zinc-900 mb-0.5">
                Click to upload or drag & drop
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">
                {helperText}
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            handleFileUpload(files[0]);
          }
        }}
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50/80 p-2 rounded-md border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

interface R2GalleryUploaderProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  folder?: "packages" | "destinations";
}

export const R2GalleryUploader = ({
  urls,
  onChange,
  folder = "packages",
}: R2GalleryUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMultiUpload = async (fileList: FileList) => {
    setErrorMessage(null);
    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file.type.startsWith("image/")) continue;

        const { uploadUrl, publicUrl } =
          await packagesApi.getPresignedUploadUrl(file.name, file.type, folder);

        await packagesApi.directUploadToR2(uploadUrl, file);
        newUrls.push(publicUrl);
      }

      onChange([...urls, ...newUrls]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed uploading some images to storage");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const updated = [...urls];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-medium text-zinc-900 tracking-tight">
            Photo Gallery
          </label>
          <p className="text-[11px] text-zinc-500 font-mono">
            Add multiple destination or hotel photos for the public brochure (
            {urls.length} uploaded).
          </p>
        </div>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800 disabled:opacity-50 transition"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Add Images</span>
            </>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleMultiUpload(e.target.files);
          }
        }}
      />

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50/80 p-2 rounded-md border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {urls.length === 0 ? (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="border border-dashed border-zinc-200 rounded-lg p-8 text-center bg-[#FAFAF9] hover:bg-zinc-100/50 cursor-pointer transition"
        >
          <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2 stroke-[1.2]" />
          <p className="text-xs text-zinc-600 font-medium">
            No gallery images added yet
          </p>
          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
            Click "Add Images" above or click here to upload multiple photos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {urls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group rounded-lg overflow-hidden border border-zinc-200 bg-white aspect-video"
            >
              <img
                src={url}
                alt={`Gallery ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white shadow-sm transition"
                  title="Delete image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="absolute bottom-1 right-1 text-[9px] px-1 rounded bg-black/60 text-white font-mono">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
