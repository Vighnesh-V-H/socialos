import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const platformEnum = pgEnum("platform", [
  "linkedin",
  "instagram",
  "twitter",
]);

export const scheduledPostStatusEnum = pgEnum("scheduled_post_status", [
  "pending",
  "published",
  "cancelled",
]);

export const post = pgTable("post", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  platformPostId: text("platform_post_id"),
  platformPostUrl: text("platform_post_url"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const postLike = pgTable("post_like", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  likerName: text("liker_name").notNull(),
  likerProfileUrl: text("liker_profile_url"),
  likerAvatarUrl: text("liker_avatar_url"),
  platform: platformEnum("platform").notNull(),
  likedAt: timestamp("liked_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const postComment = pgTable("post_comment", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  commenterName: text("commenter_name").notNull(),
  commenterProfileUrl: text("commenter_profile_url"),
  commenterAvatarUrl: text("commenter_avatar_url"),
  content: text("content").notNull(),
  platform: platformEnum("platform").notNull(),
  commentedAt: timestamp("commented_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const scheduledPost = pgTable("scheduled_post", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  platforms: platformEnum("platforms").array().notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: scheduledPostStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  post,
  postLike,
  postComment,
  scheduledPost,
};
