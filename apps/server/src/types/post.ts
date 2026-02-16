import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { post, postLike, postComment } from "@/db/schema";

// ─── DB Model Types ─────────────────────────────────────────
export type Post = InferSelectModel<typeof post>;
export type NewPost = InferInsertModel<typeof post>;

export type PostLike = InferSelectModel<typeof postLike>;
export type NewPostLike = InferInsertModel<typeof postLike>;

export type PostComment = InferSelectModel<typeof postComment>;
export type NewPostComment = InferInsertModel<typeof postComment>;

// ─── Request DTOs ───────────────────────────────────────────
export interface CreatePostBody {
  platform: "linkedin" | "instagram" | "twitter";
  content: string;
  mediaUrl?: string;
}

export interface CreateCommentBody {
  content: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

// ─── Response DTOs ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostWithEngagement extends Post {
  likesCount: number;
  commentsCount: number;
}
