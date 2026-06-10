import { SignJWT, jwtVerify } from "jose";

export async function signAdminToken(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.ADMIN_TOKEN || "default-secret-for-build");
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token?: string): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_TOKEN || "default-secret-for-build");
    const { payload } = await jwtVerify(token, secret);
    return payload.admin === true;
  } catch {
    return false;
  }
}
