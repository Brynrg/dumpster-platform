// Signed, self-expiring admin session token.
//
// The previous scheme set a constant cookie `admin=1` and authorized on
// `admin === "1"`, which any visitor could forge by setting the cookie in their
// browser. This replaces it with an HMAC-SHA256 signed token of the form
// `<expiryMs>.<base64url(hmac)>`, which cannot be forged without the server-side
// secret and expires on its own.
//
// Web Crypto (`crypto.subtle`) is available in BOTH the Edge middleware runtime
// and the Node route-handler runtime, so this needs no extra dependencies.

const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, in seconds

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short (need >= 32 random chars).",
    );
  }
  return secret;
}

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return toBase64Url(signature);
}

/**
 * Constant-time string comparison.
 * Hashing both strings before comparing prevents leaking the length of the
 * expected string (which an early length check would do) and ensures
 * the comparison always takes a constant amount of time regardless of
 * how many leading characters match.
 */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const arrA = new Uint8Array(hashA);
  const arrB = new Uint8Array(hashB);
  let diff = 0;
  for (let i = 0; i < 32; i++) {
    diff |= arrA[i] ^ arrB[i];
  }
  return diff === 0;
}

/** Mint a signed session token: `<expiryMs>.<hmac>`. */
export async function createAdminSession(): Promise<string> {
  const exp = String(Date.now() + ADMIN_SESSION_MAX_AGE * 1000);
  return `${exp}.${await sign(exp)}`;
}

/** True only for an authentic, unexpired token. */
export async function verifyAdminSession(
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || !signature) return false;
  const expected = await sign(exp);
  if (!(await timingSafeEqual(signature, expected))) return false;
  return Number(exp) > Date.now();
}

/**
 * Authorization guard usable from both middleware and route handlers — both
 * receive an object exposing `cookies.get(name)`.
 */
export async function isAuthedAdmin(request: {
  cookies: { get(name: string): { value: string } | undefined };
}): Promise<boolean> {
  return verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
