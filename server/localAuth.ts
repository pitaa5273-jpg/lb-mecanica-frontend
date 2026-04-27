import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";

const LOCAL_USER = {
  username: "lbmecanica",
  password: "eaixuxu",
  name: "LB Mecânica Automotiva",
  role: "admin" as const,
};

const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || "lb-mecanica-secret-2024");

export async function loginLocal(username: string, password: string) {
  if (username !== LOCAL_USER.username || password !== LOCAL_USER.password) {
    return null;
  }
  const token = await new SignJWT({
    sub: "local-admin",
    name: LOCAL_USER.name,
    role: LOCAL_USER.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return { token, user: { id: 1, name: LOCAL_USER.name, role: LOCAL_USER.role } };
}

export async function verifyLocalToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: 1,
      openId: "local-admin",
      name: payload.name as string,
      role: payload.role as "admin" | "user",
      email: null,
      loginMethod: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  } catch {
    return null;
  }
}
