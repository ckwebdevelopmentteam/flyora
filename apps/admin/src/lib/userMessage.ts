// Only known, actionable messages reach staff. Never echo provider errors,
// stack traces, credentials or arbitrary server validation payloads.
export function userMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const status = (error as { statusCode?: number } | null)?.statusCode;
  const message = error instanceof Error ? error.message : "";
  if (status === 401) return "Please sign in again to continue.";
  if (status === 403)
    return "You don't have permission to do this. Please contact your manager.";
  if (status === 429)
    return "Too many attempts. Please wait a moment and try again.";
  if (/invalid email or password/i.test(message))
    return "Check your email and password, then try again.";
  if (/email.*(already|exists|used)|already.*email/i.test(message))
    return "This email is already in use. Please use a different email.";
  if (
    /receipt.*(missing|not found)|upload.*receipt.*before|proof.*never/i.test(
      message,
    )
  )
    return "We couldn't find this receipt. Please upload it again.";
  if (/receipt.*(empty|10mb|PNG|JPG|PDF)|choose.*(PNG|JPG|PDF)/i.test(message))
    return "Choose a non-empty PNG, JPG or PDF receipt, up to 10 MB.";
  if (/receipt|storage|upload|presign|cloudflare|\bR2\b/i.test(message))
    return "We couldn't upload or open the file. Please try again. If it continues, contact your manager.";
  if (status === 409)
    return "This record has changed. Refresh the page and try again.";
  if (status === 404)
    return "This record is no longer available. Refresh the page to continue.";
  if (
    status === 503 ||
    /network|fetch|timeout|temporarily unavailable|prisma|database|sql|jwt/i.test(
      message,
    )
  )
    return "We couldn't connect. Please try again in a moment.";
  return fallback;
}
