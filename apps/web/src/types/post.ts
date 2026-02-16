import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { post, postLike, postComment } from "@/db/schema";

export type Post = InferSelectModel<typeof post>;
export type NewPost = InferInsertModel<typeof post>;

export type PostLike = InferSelectModel<typeof postLike>;
export type NewPostLike = InferInsertModel<typeof postLike>;

export type PostComment = InferSelectModel<typeof postComment>;
export type NewPostComment = InferInsertModel<typeof postComment>;

export interface CreatePostBody {
  platform: "linkedin" | "instagram" | "twitter";
  content: string;
  mediaUrl?: string;
}

export interface SyncLikesBody {
  likes: Array<{
    likerName: string;
    likerProfileUrl?: string;
    likerAvatarUrl?: string;
    platform: "linkedin" | "instagram" | "twitter";
    likedAt: string;
  }>;
}

export interface SyncCommentsBody {
  comments: Array<{
    commenterName: string;
    commenterProfileUrl?: string;
    commenterAvatarUrl?: string;
    content: string;
    platform: "linkedin" | "instagram" | "twitter";
    commentedAt: string;
  }>;
}

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
