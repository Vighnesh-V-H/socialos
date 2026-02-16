import type { Context, Next } from "hono";
import { auth } from "@/lib/auth";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

/**
 * Hono middleware that verifies the user session via better-auth.
 * On success, stores the user object in `c.set("user", ...)`.
 */
export async function authMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user as AuthUser);
  await next();
}
