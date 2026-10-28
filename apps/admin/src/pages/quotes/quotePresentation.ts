// Match the existing customer website address used when sharing a saved quotation.
export function quotePublicUrl(token: string): string {
  const base =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:3000"
      : "https://flyora.com";
  return `${base}/quote/${encodeURIComponent(token)}`;
}
