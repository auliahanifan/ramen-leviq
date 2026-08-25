export const SESSION_COOKIE = "ramen_session";
const SESSION_PAYLOAD = "authenticated";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function bufferToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(message: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return bufferToHex(signature);
}

export async function createSessionToken() {
  const signature = await hmac(SESSION_PAYLOAD);
  return `${SESSION_PAYLOAD}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (payload !== SESSION_PAYLOAD || !signature) return false;
  const expected = await hmac(payload);
  return expected === signature;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
