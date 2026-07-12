# Database Design Document (Laravel & Eloquent)

This document provides a comprehensive overview of the database layer for the Social Feed Application using Laravel and Eloquent ORM.

## Entity Relationship Diagram

```text
User (App\Models\User)
 ├── Posts
 ├── Comments
 ├── PostLikes
 ├── CommentLikes
 └── RefreshTokens

Post (App\Models\Post)
 ├── Author (User)
 ├── Comments
 └── PostLikes

Comment (App\Models\Comment)
 ├── Author (User)
 ├── Post
 ├── ParentComment (Self-relation)
 ├── Replies (Self-relation)
 └── CommentLikes

PostLike (App\Models\PostLike)
 ├── Post
 └── User

CommentLike (App\Models\CommentLike)
 ├── Comment (or Reply)
 └── User

RefreshToken (App\Models\RefreshToken)
 └── User
```

---

## Design Choices & Rationale

### 1. Comments and Replies Shared Table
Both comments and replies are stored in the single `comments` table. A reply is distinguished by having a non-null `parent_id` linking to its parent comment.
*   **Why**: Since replies and top-level comments share identical structures (same attributes: author, post, content, timestamps), separating them into two tables would result in duplicated schemas, complex joins, and unnecessary queries.
*   **One-Level Rule**: We restrict replies to only one level (i.e. replies cannot have replies). This rule is enforced in the application layer.

### 2. Preventing Duplicate Likes
Duplicate likes are strictly prevented using composite unique constraints on the relational junction tables:
*   For posts: `unique(['post_id', 'user_id'])` on `post_likes`.
*   For comments/replies: `unique(['comment_id', 'user_id'])` on `comment_likes`.
These constraints result in database-level `UNIQUE` index violations if a user attempts to like the same resource twice.

### 3. Public vs. Private Post Modeling
Post visibility is modeled using a `visibility` column with values `'PUBLIC'` or `'PRIVATE'`.
*   **PUBLIC**: Visible to all authenticated users.
*   **PRIVATE**: Visible only to the author.
Visibility checks are verified at the application level during queries.

### 4. Refresh Token Session Modeling
Refresh tokens are stored in the `refresh_tokens` table.
*   **Security**: Only hashed refresh tokens are stored in the database (`token_hash`), never the plain-text token.
*   **Multiple Sessions**: Each device/session gets a unique record associated with the user's ID.
*   **Single-Session Revocation**: A session is revoked individually by updating the `revoked_at` timestamp. This allows logging out of one device without invalidating sessions on other devices.

### 5. Indexing Strategy
To optimize for high performance under millions of records, the following indexes are defined:
*   **Posts**:
    *   `[visibility, created_at]`: Speeds up retrieval of the public newest-first feed.
    *   `[author_id, created_at]`: Speeds up author-specific profile feeds.
*   **Comments**:
    *   `[post_id, parent_id, created_at]`: Optimizes loading of newest-first top-level comments for a post.
    *   `[parent_id, created_at]`: Optimizes oldest-first reply threads under comments.
    *   `[author_id]`: Speeds up user-specific comment lookups.
*   **Likes**:
    *   `[post_id, created_at]` / `[comment_id, created_at]`: Optimizes loading of lists of users who liked the post/comment.
    *   `[user_id]`: Enables querying a user's liked history.
*   **Refresh Tokens**:
    *   `[user_id]`: Fast session lookup.
    *   `[expires_at, revoked_at]`: Fast batch cleanup of expired/revoked tokens.

### 6. Cursor-Pagination Considerations
For large datasets, offset-based pagination (`OFFSET 100000 LIMIT 10`) performs poorly because the database must scan all preceding records.
This design uses **cursor pagination** based on the primary key `id` (or composite `created_at` and `id` keys). The indices on `created_at DESC` ensure pagination queries are extremely efficient.

### 7. External Image Storage (URLs vs. Binary)
Post images are stored as String URLs (`image_url`) referencing external cloud storage (e.g. AWS S3) rather than binary blobs in the database.
*   **Rationale**: Storing raw binary files (BLOBs) inside PostgreSQL increases database backup sizes, memory usage, and slows down database transaction processing.

---

## Constraints Enforcement

### PostgreSQL Enforced Rules
*   **Cascade Deletions**: Deleting a User cascades down to delete their posts, comments, likes, and refresh tokens. Deleting a Post cascades to delete comments and post likes.
*   **Post Content Check**: Enforced by a database-level `CHECK` constraint:
    ```sql
    CHECK (
      NULLIF(TRIM(content), '') IS NOT NULL
      OR image_url IS NOT NULL
    )
    ```
    This ensures a post cannot have both empty text content and an empty image URL.

### Laravel Service Layer Enforced Rules
*   **One-Level Replies**: Enforced by verifying that:
    1. The parent comment exists and has `parent_id = null`.
    2. The reply belongs to the same `post_id` as the parent comment.
    3. The content is non-empty.
*   **Visibility Policies**: Resolving if a user has permission to read a post before returning it (e.g. author-only checks for `PRIVATE` visibility).
