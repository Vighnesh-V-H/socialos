import { eq, desc, count, and } from "drizzle-orm";
import { post, postLike, postComment } from "@/db/schema";
import type { DB } from "@/db/index";
import type {
  CreatePostBody,
  PaginatedResponse,
  Post,
  PostLike,
  PostComment,
  PostWithEngagement,
} from "@/types/post";
import type { ICacheService } from "@/types/cache";
import { CacheKeys } from "@/lib/cache-keys";

const CACHE_TTL = 120; // 2 minutes

export class PostService {
  constructor(
    private db: DB,
    private cache: ICacheService,
  ) {}

  // ────────────────────────────────────────────────────
  //  Posts
  // ────────────────────────────────────────────────────

  async createPost(userId: string, body: CreatePostBody): Promise<Post> {
    const [created] = await this.db
      .insert(post)
      .values({
        userId,
        platform: body.platform,
        content: body.content,
        mediaUrl: body.mediaUrl ?? null,
      })
      .returning();

    if (!created) throw new Error("Failed to create post");

    // invalidate user-posts list cache
    await this.cache.delPattern(CacheKeys.userPostsPattern(userId));

    return created;
  }

  async getPostById(postId: string): Promise<PostWithEngagement | null> {
    const cached = await this.cache.get<PostWithEngagement>(
      CacheKeys.post(postId),
    );
    if (cached) return cached;

    const rows = await this.db
      .select()
      .from(post)
      .where(eq(post.id, postId))
      .limit(1);

    const found = rows[0];
    if (!found) return null;

    const [likesResult] = await this.db
      .select({ count: count() })
      .from(postLike)
      .where(eq(postLike.postId, postId));

    const [commentsResult] = await this.db
      .select({ count: count() })
      .from(postComment)
      .where(eq(postComment.postId, postId));

    const enriched: PostWithEngagement = {
      ...found,
      likesCount: likesResult?.count ?? 0,
      commentsCount: commentsResult?.count ?? 0,
    };

    await this.cache.set(CacheKeys.post(postId), enriched, CACHE_TTL);
    return enriched;
  }

  async getUserPosts(
    userId: string,
    page: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Post>> {
    const cacheKey = CacheKeys.userPosts(userId, page, limit);
    const cached = await this.cache.get<PaginatedResponse<Post>>(cacheKey);
    if (cached) return cached;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(post)
      .where(eq(post.userId, userId));

    const total = totalResult?.count ?? 0;

    const rows = await this.db
      .select()
      .from(post)
      .where(eq(post.userId, userId))
      .orderBy(desc(post.createdAt))
      .limit(limit)
      .offset(offset);

    const result: PaginatedResponse<Post> = {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    const rows = await this.db
      .select()
      .from(post)
      .where(and(eq(post.id, postId), eq(post.userId, userId)))
      .limit(1);

    if (!rows[0]) return false;

    await this.db.delete(post).where(eq(post.id, postId));

    // invalidate all related caches
    await Promise.all([
      this.cache.del(CacheKeys.post(postId)),
      this.cache.delPattern(CacheKeys.userPostsPattern(userId)),
      this.cache.delPattern(CacheKeys.postLikesPattern(postId)),
      this.cache.delPattern(CacheKeys.postCommentsPattern(postId)),
    ]);

    return true;
  }

  // ────────────────────────────────────────────────────
  //  Likes
  // ────────────────────────────────────────────────────

  async getPostLikes(
    postId: string,
    page: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<PostLike>> {
    const cacheKey = CacheKeys.postLikes(postId, page, limit);
    const cached = await this.cache.get<PaginatedResponse<PostLike>>(cacheKey);
    if (cached) return cached;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(postLike)
      .where(eq(postLike.postId, postId));

    const total = totalResult?.count ?? 0;

    const rows = await this.db
      .select()
      .from(postLike)
      .where(eq(postLike.postId, postId))
      .orderBy(desc(postLike.likedAt))
      .limit(limit)
      .offset(offset);

    const result: PaginatedResponse<PostLike> = {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async syncPostLikes(
    postId: string,
    likes: Omit<PostLike, "id" | "postId">[],
  ): Promise<void> {
    // Bulk upsert likes fetched from the platform API
    if (likes.length > 0) {
      await this.db.insert(postLike).values(
        likes.map((l) => ({
          postId,
          likerName: l.likerName,
          likerProfileUrl: l.likerProfileUrl,
          likerAvatarUrl: l.likerAvatarUrl,
          platform: l.platform,
          likedAt: l.likedAt,
        })),
      );
    }

    await Promise.all([
      this.cache.del(CacheKeys.post(postId)),
      this.cache.delPattern(CacheKeys.postLikesPattern(postId)),
    ]);
  }

  // ────────────────────────────────────────────────────
  //  Comments
  // ────────────────────────────────────────────────────

  async getPostComments(
    postId: string,
    page: number,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<PostComment>> {
    const cacheKey = CacheKeys.postComments(postId, page, limit);
    const cached =
      await this.cache.get<PaginatedResponse<PostComment>>(cacheKey);
    if (cached) return cached;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(postComment)
      .where(eq(postComment.postId, postId));

    const total = totalResult?.count ?? 0;

    const rows = await this.db
      .select()
      .from(postComment)
      .where(eq(postComment.postId, postId))
      .orderBy(desc(postComment.commentedAt))
      .limit(limit)
      .offset(offset);

    const result: PaginatedResponse<PostComment> = {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async syncPostComments(
    postId: string,
    comments: Omit<PostComment, "id" | "postId">[],
  ): Promise<void> {
    if (comments.length > 0) {
      await this.db.insert(postComment).values(
        comments.map((c) => ({
          postId,
          commenterName: c.commenterName,
          commenterProfileUrl: c.commenterProfileUrl,
          commenterAvatarUrl: c.commenterAvatarUrl,
          content: c.content,
          platform: c.platform,
          commentedAt: c.commentedAt,
        })),
      );
    }

    await Promise.all([
      this.cache.del(CacheKeys.post(postId)),
      this.cache.delPattern(CacheKeys.postCommentsPattern(postId)),
    ]);
  }
}
