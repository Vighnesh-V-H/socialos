import { Hono } from "hono";
import { handle } from "hono/vercel";
import { authGuard, type AuthUser } from "@/lib/middleware/auth-guard";
import { PostService } from "@/services/post.service";
import { getCache } from "@/lib/cache";
import { createDb } from "@/db/index";
import { parsePagination } from "@/lib/pagination";
import type {
  CreatePostBody,
  SyncLikesBody,
  SyncCommentsBody,
} from "@/types/post";

type AppEnv = {
  Variables: {
    user: AuthUser;
  };
};

const { db } = createDb(process.env.DATABASE_URL!);
const postService = new PostService(db, getCache());

const app = new Hono<AppEnv>().basePath("/api/v1");

app.use("/*", authGuard);

app.post("/posts", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<CreatePostBody>();

  if (!body.content?.trim()) {
    return c.json({ error: "Content is required" }, 400);
  }

  const validPlatforms = ["linkedin", "instagram", "twitter"] as const;
  if (
    !validPlatforms.includes(body.platform as (typeof validPlatforms)[number])
  ) {
    return c.json(
      {
        error: "Invalid platform. Must be one of: linkedin, instagram, twitter",
      },
      400,
    );
  }

  const created = await postService.createPost(user.id, {
    platform: body.platform,
    content: body.content.trim(),
    mediaUrl: body.mediaUrl,
  });

  return c.json({ data: created }, 201);
});

app.get("/posts", async (c) => {
  const user = c.get("user");
  const { page, limit, offset } = parsePagination({
    page: c.req.query("page"),
    limit: c.req.query("limit"),
  });

  const result = await postService.getUserPosts(user.id, page, limit, offset);
  return c.json(result);
});

app.get("/posts/:id", async (c) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  const found = await postService.getPostById(postId);
  if (!found) return c.json({ error: "Post not found" }, 404);
  if (found.userId !== user.id) return c.json({ error: "Forbidden" }, 403);

  return c.json({ data: found });
});

app.delete("/posts/:id", async (c) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  const deleted = await postService.deletePost(postId, user.id);
  if (!deleted) return c.json({ error: "Post not found or forbidden" }, 404);

  return c.json({ message: "Post deleted" });
});

app.get("/posts/:id/likes", async (c) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  const found = await postService.getPostById(postId);
  if (!found) return c.json({ error: "Post not found" }, 404);
  if (found.userId !== user.id) return c.json({ error: "Forbidden" }, 403);

  const { page, limit, offset } = parsePagination({
    page: c.req.query("page"),
    limit: c.req.query("limit"),
  });

  const result = await postService.getPostLikes(postId, page, limit, offset);
  return c.json(result);
});

app.post("/posts/:id/likes/sync", async (c) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  const found = await postService.getPostById(postId);
  if (!found) return c.json({ error: "Post not found" }, 404);
  if (found.userId !== user.id) return c.json({ error: "Forbidden" }, 403);

  const { likes } = await c.req.json<SyncLikesBody>();
  if (!Array.isArray(likes)) {
    return c.json({ error: "likes must be an array" }, 400);
  }

  await postService.syncPostLikes(
    postId,
    likes.map((l) => ({
      likerName: l.likerName,
      likerProfileUrl: l.likerProfileUrl ?? null,
      likerAvatarUrl: l.likerAvatarUrl ?? null,
      platform: l.platform,
      likedAt: new Date(l.likedAt),
    })),
  );

  return c.json({ message: "Likes synced" });
});

app.get("/posts/:id/comments", async (c) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  const found = await postService.getPostById(postId);
  if (!found) return c.json({ error: "Post not found" }, 404);
  if (found.userId !== user.id) return c.json({ error: "Forbidden" }, 403);

  const { page, limit, offset } = parsePagination({
    page: c.req.query("page"),
    limit: c.req.query("limit"),
  });

  const result = await postService.getPostComments(postId, page, limit, offset);
  return c.json(result);
});

app.post("/posts/:id/comments/sync", async (c) => {
  const user = c.get("user");
  const postId = c.req.param("id");

  const found = await postService.getPostById(postId);
  if (!found) return c.json({ error: "Post not found" }, 404);
  if (found.userId !== user.id) return c.json({ error: "Forbidden" }, 403);

  const { comments } = await c.req.json<SyncCommentsBody>();
  if (!Array.isArray(comments)) {
    return c.json({ error: "comments must be an array" }, 400);
  }

  await postService.syncPostComments(
    postId,
    comments.map((cm) => ({
      commenterName: cm.commenterName,
      commenterProfileUrl: cm.commenterProfileUrl ?? null,
      commenterAvatarUrl: cm.commenterAvatarUrl ?? null,
      content: cm.content,
      platform: cm.platform,
      commentedAt: new Date(cm.commentedAt),
    })),
  );

  return c.json({ message: "Comments synced" });
});

export const GET = handle(app);
export const POST = handle(app);
export const DELETE = handle(app);
