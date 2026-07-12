<?php

namespace App\Services;

use App\DTOs\StorePostDTO;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PostService
{
    public function getFeedForUserService(User $user, int $perPage = 10, ?string $cursor = null): CursorPaginator
    {
        return Post::with([
                'author:id,first_name,last_name,email',
                'postLikes.user:id,first_name,last_name',
                'comments' => function ($query) {
                    $query->whereNull('parent_id')->orderBy('created_at', 'desc');
                },
                'comments.author:id,first_name,last_name',
                'comments.commentLikes.user:id,first_name,last_name',
                'comments.replies' => function ($query) {
                    $query->orderBy('created_at', 'asc');
                },
                'comments.replies.author:id,first_name,last_name',
                'comments.replies.commentLikes.user:id,first_name,last_name',
            ])
            ->where(function ($query) use ($user) {
                $query->where('visibility', true)
                    ->orWhere(function ($query) use ($user) {
                        $query->where('visibility', false)
                            ->where('author_id', $user->id);
                    });
            })
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
    }

    public function createPostService(User $user, StorePostDTO $dto): Post
    {
        $post = Post::create([
            'author_id' => $user->id,
            'content' => $dto->content !== null ? trim($dto->content) : null,
            'image_url' => $dto->image_url !== null ? trim($dto->image_url) : null,
            'visibility' => $dto->visibility,
            'likes_count' => 0,
            'comments_count' => 0,
        ]);

        $post->load('author:id,first_name,last_name,email');

        return $post;
    }

    public function toggleLikeService(User $user, string $postId): ?array
    {
        return DB::transaction(function () use ($user, $postId) {
            $post = Post::whereKey($postId)->lockForUpdate()->first();
            if (!$post) {
                return null;
            }

            $like = PostLike::where('post_id', $post->id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if ($like) {
                $like->delete();
                $liked = false;
                $post->decrement('likes_count');
            } else {
                PostLike::create([
                    'post_id' => $post->id,
                    'user_id' => $user->id,
                ]);
                $liked = true;
                $post->increment('likes_count');
            }

            return $this->buildLikeState($post->id, $liked, (int) $post->likes_count);
        });
    }

    public function getLikesListService(string $postId): Collection
    {
        return PostLike::with('user:id,first_name,last_name')
            ->where('post_id', $postId)
            ->get()
            ->map(function ($like) {
                return [
                    'id' => $like->user->id,
                    'name' => $like->user->first_name . ' ' . $like->user->last_name,
                ];
            });
    }

    private function buildLikeState(string $postId, bool $liked, int $likesCount): array
    {
        $likesList = $this->getLikesListService($postId);

        return [
            'liked' => $liked,
            'likes_count' => $likesCount,
            'liked_by_users' => $likesList,
        ];
    }
}
