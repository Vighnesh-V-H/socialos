import { eq, desc, count, and } from "drizzle-orm";
import { post, postLike, postComment, account } from "@/db/schema";
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

const CACHE_TTL = 120;

type LinkedInPublishResult = {
  platformPostId: string;
  platformPostUrl: string;
};

const LINKEDIN_PROVIDER_ID = "linkedin";

export class PostService {
  constructor(
    private db: DB,
    private cache: ICacheService,
  ) {}

  async createPost(userId: string, body: CreatePostBody): Promise<Post> {
    const normalizedContent = this.toPlainText(body.content);

    if (!normalizedContent) {
      throw new Error("Content is required");
    }

    let linkedinPublishResult: LinkedInPublishResult | null = null;

    if (body.platform === "linkedin") {
      linkedinPublishResult = await this.publishToLinkedIn(
        userId,
        normalizedContent,
      );
    }

    const [created] = await this.db
      .insert(post)
      .values({
        userId,
        platform: body.platform,
        content: normalizedContent,
        mediaUrl: body.mediaUrl ?? null,
        platformPostId: linkedinPublishResult?.platformPostId ?? null,
        platformPostUrl: linkedinPublishResult?.platformPostUrl ?? null,
      })
      .returning();

    if (!created) throw new Error("Failed to create post");

    await this.cache.delPattern(CacheKeys.userPostsPattern(userId));

    return created;
  }

  private async publishToLinkedIn(
    userId: string,
    content: string,
  ): Promise<LinkedInPublishResult> {
    const linkedinAccount = await this.getLinkedInAccount(userId);
    const accessToken = linkedinAccount.accessToken;
    const memberId = linkedinAccount.accountId;

    if (!accessToken) {
      throw new Error("LinkedIn account is missing an access token");
    }

    if (!memberId) {
      throw new Error("LinkedIn account is missing a member ID");
    }

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${memberId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const rawError = await response.text().catch(() => "");
      throw new Error(
        rawError || `LinkedIn publish failed with status ${response.status}`,
      );
    }

    const responseBody = (await response.json().catch(() => ({}))) as {
      id?: string;
    };

    const platformPostId =
      response.headers.get("x-restli-id") ?? responseBody.id ?? "";

    if (!platformPostId) {
      throw new Error(
        "LinkedIn publish succeeded but post ID was not returned",
      );
    }

    const platformPostUrl = `https://www.linkedin.com/feed/update/${encodeURIComponent(platformPostId)}`;

    return {
      platformPostId,
      platformPostUrl,
    };
  }

  private async getLinkedInAccount(userId: string) {
    const rows = await this.db
      .select({
        accountId: account.accountId,
        accessToken: account.accessToken,
      })
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, LINKEDIN_PROVIDER_ID),
        ),
      )
      .limit(1);

    const linkedAccount = rows[0];

    if (!linkedAccount) {
      throw new Error("LinkedIn account is not connected");
    }

    return linkedAccount;
  }

  private toPlainText(content: string): string {
    return content
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
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

    await Promise.all([
      this.cache.del(CacheKeys.post(postId)),
      this.cache.delPattern(CacheKeys.userPostsPattern(userId)),
      this.cache.delPattern(CacheKeys.postLikesPattern(postId)),
      this.cache.delPattern(CacheKeys.postCommentsPattern(postId)),
    ]);

    return true;
  }

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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async syncPostLikes(
    postId: string,
    likes: Array<{
      likerName: string;
      likerProfileUrl: string | null;
      likerAvatarUrl: string | null;
      platform: "linkedin" | "instagram" | "twitter";
      likedAt: Date;
    }>,
  ): Promise<void> {
    if (likes.length > 0) {
      await this.db
        .insert(postLike)
        .values(likes.map((l) => ({ postId, ...l })));
    }

    await Promise.all([
      this.cache.del(CacheKeys.post(postId)),
      this.cache.delPattern(CacheKeys.postLikesPattern(postId)),
    ]);
  }

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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };

    await this.cache.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async syncPostComments(
    postId: string,
    comments: Array<{
      commenterName: string;
      commenterProfileUrl: string | null;
      commenterAvatarUrl: string | null;
      content: string;
      platform: "linkedin" | "instagram" | "twitter";
      commentedAt: Date;
    }>,
  ): Promise<void> {
    if (comments.length > 0) {
      await this.db
        .insert(postComment)
        .values(comments.map((c) => ({ postId, ...c })));
    }

    await Promise.all([
      this.cache.del(CacheKeys.post(postId)),
      this.cache.delPattern(CacheKeys.postCommentsPattern(postId)),
    ]);
  }
}
