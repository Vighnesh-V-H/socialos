import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createDb } from "@/db";
import * as schema from "@/db/schema";
import { SESSION_EXPIRY_TIME, SESSION_UPDATE_AGE } from "@/lib/config/auth";

const { db } = createDb(process.env.DATABASE_URL!);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    },
  },
  advanced: {
    ipAddress: { disableIpTracking: false },
  },
  session: {
    cookieName: "session",
    disableSessionRefresh: false,
    cookieCache: {
      enabled: true,
      maxAge: 1 * 60,
    },
    expiresIn: SESSION_EXPIRY_TIME,
    updateAge: SESSION_UPDATE_AGE,
  },
  plugins: [nextCookies()],
  logger: {
    level: "debug",
  },
});
