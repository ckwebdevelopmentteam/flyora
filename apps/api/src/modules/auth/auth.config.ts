import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ACCESS_TTL_SECONDS = 15 * 60;
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
export const RECOVERY_WINDOW_MS = 30_000;
// Only refresh rotation gets a cloud-database budget; other transactions retain their limits.
export const REFRESH_TRANSACTION_OPTIONS = { maxWait: 5_000, timeout: 10_000 };
export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export class AuthError extends Error {
  statusCode = 401;
  constructor(message = "Invalid or expired session. Please sign in again.") {
    super(message);
  }
}
export function authConfig() {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (
    !secret ||
    secret.length < 32 ||
    !refreshSecret ||
    refreshSecret.length < 32 ||
    secret === refreshSecret
  ) {
    throw new Error(
      "JWT_SECRET and JWT_REFRESH_SECRET must be distinct secrets of at least 32 characters",
    );
  }
  const production = process.env.NODE_ENV === "production";
  if (
    production &&
    [secret, refreshSecret].some((value) =>
      /development|super-secret|change.?me|replace/i.test(value),
    )
  ) {
    throw new Error("Configure random production auth secrets");
  }
  const origins = [
    process.env.ADMIN_APP_URL || "http://localhost:3001",
    process.env.WEB_APP_URL || "http://localhost:3000",
  ].map((value) => new URL(value).origin);
  if (production && origins.some((value) => !value.startsWith("https://")))
    throw new Error("Production app origins must use HTTPS");
  return {
    secret,
    refreshSecret,
    production,
    origins,
    cookieName: production ? "__Host-flyora_refresh" : "flyora_refresh",
  };
}
function mac(value: string) {
  return createHmac("sha256", authConfig().refreshSecret)
    .update(value)
    .digest("hex");
}
export function equalHash(a: string, b: string) {
  return (
    /^[0-9a-f]{64}$/.test(a) &&
    /^[0-9a-f]{64}$/.test(b) &&
    timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"))
  );
}
export function hashSecret(secret: string) {
  return mac(`hash:${secret}`);
}
export function refreshToken(
  id: string,
  secret = randomBytes(32).toString("hex"),
) {
  return {
    raw: `${id}.${secret}.${mac(`token:${id}.${secret}`)}`,
    hash: hashSecret(secret),
    secret,
  };
}
export function parseRefresh(raw: string) {
  const parts = raw.split(".");
  if (
    parts.length !== 3 ||
    !UUID.test(parts[0]) ||
    !/^(?:[0-9a-f]{64}|v1-[0-9a-f-]{36}-[0-9a-f]{64})$/.test(parts[1]) ||
    !equalHash(parts[2], mac(`token:${parts[0]}.${parts[1]}`))
  )
    throw new AuthError();
  return { id: parts[0], secret: parts[1] };
}
export function successorToken(id: string, secret: string, operation: string) {
  return refreshToken(
    id,
    `v1-${operation}-${mac(JSON.stringify(["rotate-v1", id, secret, operation]))}`,
  );
}
