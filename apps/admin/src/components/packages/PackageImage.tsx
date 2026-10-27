import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

export function PackageImage({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed ? (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className={`package-image-empty ${className}`}
      role="img"
      aria-label={`No photo for ${alt}`}
    >
      <ImageIcon size={24} aria-hidden="true" />
      <span>No photo</span>
    </div>
  );
}
