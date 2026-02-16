import type { Context, Next } from "hono";
import { auth } from "@/lib/auth";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export async function authGuard(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user as AuthUser);
  await next();
}
