import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { verifyLocalToken } from "../localAuth";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

function parseCookiesSimple(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  cookieHeader.split(";").forEach(c => {
    const idx = c.indexOf("=");
    if (idx > 0) {
      const k = c.slice(0, idx).trim();
      const v = c.slice(idx + 1).trim();
      result[k] = decodeURIComponent(v);
    }
  });
  return result;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookies = parseCookiesSimple(opts.req.headers.cookie);
    const sessionCookie = cookies[COOKIE_NAME];
    if (sessionCookie) {
      // Try local auth first
      const localUser = await verifyLocalToken(sessionCookie);
      if (localUser) {
        user = localUser as unknown as User;
      } else {
        // Fallback to OAuth
        try {
          user = await sdk.authenticateRequest(opts.req);
        } catch {
          user = null;
        }
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
