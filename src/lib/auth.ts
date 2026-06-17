import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.ADMIN_TOKEN;
  if (!secret) {
    throw new Error("ADMIN_TOKEN is not configured.");
  }
  return new TextEncoder().encode(secret);
};

export async function signAdminToken(): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload.admin === true;
  } catch {
    return false;
  }
}
