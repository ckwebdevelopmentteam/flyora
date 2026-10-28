import { useRef, useState } from "react";
import { UploadCloud, X, Loader2, ImageIcon } from "lucide-react";
import { packagesApi } from "../../lib/packagesApi";
import { PackageImage } from "./PackageImage";
import { userMessage } from "../../lib/userMessage";

const formats = new Set(["image/png", "image/jpeg", "image/webp"]);
export function validatePackageImages(files: File[]) {
  if (files.some((file) => !formats.has(file.type)))
    return "Choose JPG, PNG or WebP photos.";
  if (files.some((file) => file.size > 10 * 1024 * 1024))
    return "Each photo must be 10 MB or smaller.";
  return null;
}
async function upload(
  file: File,
  folder: "packages" | "destinations",
  progress?: (percent: number) => void,
) {
  const result = await packagesApi.getPresignedUploadUrl(
    file.name,
    file.type,
    folder,
  );
  if (result.isMock || !result.publicUrl)
    throw new Error("Photo storage is unavailable. Please try again later.");
  await packagesApi.directUploadToR2(result.uploadUrl, file, progress);
  return result.publicUrl;
}
type BusyProps = {
  disabled?: boolean;
  onUploadingChange?: (busy: boolean) => void;
};
interface CoverProps extends BusyProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: "packages" | "destinations";
  label?: string;
  helperText?: string;
}
export function R2ImageDropzone({
  value,
  onChange,
  folder = "packages",
  label = "Cover photo",
  helperText = "JPG, PNG or WebP · Up to 10 MB",
  disabled = false,
  onUploadingChange,
}: CoverProps) {
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  async function choose(files: File[]) {
    if (!files.length || lock.current || disabled) return;
    const problem = validatePackageImages(files);
    if (problem) {
      setError(problem);
      return;
    }
    lock.current = true;
    setBusy(true);
    onUploadingChange?.(true);
    setError(null);
    setProgress(0);
    try {
      onChange(await upload(files[0], folder, setProgress));
    } catch (e) {
      setError(
        userMessage(e, "We couldn't upload this photo. Please try again."),
      );
    } finally {
      lock.current = false;
      setBusy(false);
      onUploadingChange?.(false);
    }
  }
  return (
    <div className="package-cover-uploader" aria-busy={busy}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">{label}</h3>
        {value && (
          <button
            type="button"
            disabled={busy || disabled}
            onClick={() => onChange("")}
            className="text-xs text-slate-500 inline-flex items-center gap-1"
          >
            <X size={14} />
            Remove cover
          </button>
        )}
      </div>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        aria-label="Package cover photo"
        ref={input}
        hidden
        disabled={busy || disabled}
        onChange={(e) => {
          void choose(Array.from(e.target.files || []));
          e.target.value = "";
        }}
      />
      <div className="package-cover-row">
        {value ? (
          <PackageImage
            src={value}
            alt="Package cover"
            className="package-cover-thumbnail"
          />
        ) : (
          <div className="package-cover-thumbnail package-image-empty">
            <ImageIcon size={26} />
            <span>No cover photo</span>
          </div>
        )}
        <div className="space-y-3">
          <p className="text-xs text-slate-500">{helperText}</p>
          <button
            type="button"
            className="button-secondary"
            disabled={busy || disabled}
            onClick={() => input.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void choose(Array.from(e.dataTransfer.files));
            }}
          >
            {busy ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Uploading {progress}%
              </>
            ) : (
              <>
                <UploadCloud size={15} />
                {value ? "Replace cover" : "Upload cover"}
              </>
            )}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-700 mt-3">
          {error}
        </p>
      )}
    </div>
  );
}
interface GalleryProps extends BusyProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  folder?: "packages" | "destinations";
  onChooseCover?: (url: string) => void;
  coverUrl?: string;
}
export function R2GalleryUploader({
  urls,
  onChange,
  folder = "packages",
  onChooseCover,
  coverUrl,
  disabled = false,
  onUploadingChange,
}: GalleryProps) {
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  async function choose(files: File[]) {
    if (!files.length || lock.current || disabled) return;
    const problem = validatePackageImages(files);
    if (problem) {
      setError(problem);
      return;
    }
    lock.current = true;
    setBusy(true);
    onUploadingChange?.(true);
    setError(null);
    const added: string[] = [];
    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading ${index + 1} of ${files.length}…`);
        added.push(
          await upload(file, folder, (pct) =>
            setProgress(`Uploading ${index + 1} of ${files.length} · ${pct}%`),
          ),
        );
      }
    } catch (e) {
      setError(
        added.length
          ? `${added.length} of ${files.length} photos uploaded. Please retry the remaining photos.`
          : userMessage(
              e,
              "We couldn't upload these photos. Please try again.",
            ),
      );
    } finally {
      if (added.length) onChange([...new Set([...urls, ...added])]);
      lock.current = false;
      setBusy(false);
      onUploadingChange?.(false);
    }
  }
  return (
    <div className="package-gallery-uploader" aria-busy={busy}>
      <div className="flex justify-between items-center gap-3 mb-3">
        <h3 className="font-semibold text-sm">
          Gallery{" "}
          <span className="font-normal text-slate-400">({urls.length})</span>
        </h3>
        <button
          type="button"
          className="button-secondary"
          disabled={busy || disabled}
          onClick={() => input.current?.click()}
        >
          <UploadCloud size={15} />
          Add photos
        </button>
      </div>
      <input
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        aria-label="Package gallery photos"
        ref={input}
        hidden
        disabled={busy || disabled}
        onChange={(e) => {
          void choose(Array.from(e.target.files || []));
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="package-photo-drop"
        disabled={busy || disabled}
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void choose(Array.from(e.dataTransfer.files));
        }}
      >
        {busy ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            <span role="status">{progress}</span>
          </>
        ) : (
          <>
            <UploadCloud size={18} />
            <span>Drop photos here, or select multiple files</span>
            <span className="text-xs text-slate-400">
              JPG, PNG or WebP · Up to 10 MB each
            </span>
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="text-sm text-rose-700 mt-3">
          {error}
        </p>
      )}
      {!!urls.length && (
        <div className="package-gallery-grid">
          {urls.map((url, index) => (
            <div key={url} className="package-gallery-tile">
              <PackageImage src={url} alt={`Gallery photo ${index + 1}`} />
              <button
                type="button"
                className="package-photo-remove"
                aria-label={`Remove gallery photo ${index + 1}`}
                disabled={busy || disabled}
                onClick={() => onChange(urls.filter((_, i) => i !== index))}
              >
                <X size={14} />
              </button>
              {onChooseCover && (
                <button
                  type="button"
                  className="package-use-cover"
                  disabled={busy || disabled || coverUrl === url}
                  onClick={() => onChooseCover(url)}
                >
                  {coverUrl === url ? "Cover photo" : "Use as cover"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
