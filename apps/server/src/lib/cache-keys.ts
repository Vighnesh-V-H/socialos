/**
 * Helpers for building cache keys in a consistent format.
 */

export const CacheKeys = {
  post: (postId: string) => `post:${postId}`,
  userPosts: (userId: string, page: number, limit: number) =>
    `posts:user:${userId}:${page}:${limit}`,
  postLikes: (postId: string, page: number, limit: number) =>
    `post:${postId}:likes:${page}:${limit}`,
  postComments: (postId: string, page: number, limit: number) =>
    `post:${postId}:comments:${page}:${limit}`,

  // patterns for invalidation
  userPostsPattern: (userId: string) => `posts:user:${userId}:*`,
  postLikesPattern: (postId: string) => `post:${postId}:likes:*`,
  postCommentsPattern: (postId: string) => `post:${postId}:comments:*`,
} as const;
