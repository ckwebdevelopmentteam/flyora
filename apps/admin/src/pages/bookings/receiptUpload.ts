export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

export function receiptContentType(
  file: Pick<File, "name" | "type" | "size">,
): string {
  if (file.size === 0)
    throw new Error("The receipt file is empty. Choose a PNG, JPG or PDF.");
  if (file.size > MAX_RECEIPT_BYTES)
    throw new Error("Receipt file exceeds 10MB maximum limit.");
  const mime = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (["image/png", "image/jpeg", "application/pdf"].includes(mime))
    return mime;
  if (!mime) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension === "png") return "image/png";
    if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
    if (extension === "pdf") return "application/pdf";
  }
  throw new Error("Choose a PNG, JPG or PDF receipt.");
}
