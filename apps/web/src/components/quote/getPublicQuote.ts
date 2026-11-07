import { parsePublicQuote, type PublicQuote } from "./publicQuote";

export type QuoteResult =
  | { kind: "ready"; quote: PublicQuote; receivedAt: number }
  | { kind: "not-found" }
  | { kind: "unavailable" };

// Imported only by the server page. Never forward staff cookies or bearer tokens.
export async function getPublicQuote(token: string): Promise<QuoteResult> {
  if (!/^[a-zA-Z0-9_-]{16,128}$/.test(token)) return { kind: "not-found" };
  try {
    const base = (
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000/api/v1"
    ).replace(/\/+$/, "");
    const url = new URL(`${base}/public/quotes/${encodeURIComponent(token)}`);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return { kind: "unavailable" };
    const response = await fetch(url.toString(), {
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: { Accept: "application/json" },
    });
    if (response.status === 404 || response.status === 410)
      return { kind: "not-found" };
    if (!response.ok) return { kind: "unavailable" };
    return {
      kind: "ready",
      quote: parsePublicQuote(await response.json(), token),
      receivedAt: Date.now(),
    };
  } catch {
    // Do not log tokens, upstream payloads, customer details or validation errors.
    return { kind: "unavailable" };
  }
}
