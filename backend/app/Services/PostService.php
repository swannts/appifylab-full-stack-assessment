<?php

namespace App\Services;

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
                'comments' => function ($query) use ($user) {
                    $query->whereNull('parent_id')
                        ->orderBy('created_at', 'desc')
                        ->with('author:id,first_name,last_name')
                        ->withCount('commentLikes')
                        ->withCount([
                            'commentLikes as viewer_like_count' => function ($likeQuery) use ($user) {
                                $likeQuery->where('user_id', $user->id);
                            },
                        ])
                        ->with([
                            'replies' => function ($replyQuery) use ($user) {
                                $replyQuery->orderBy('created_at', 'asc')
                                    ->with('author:id,first_name,last_name')
                                    ->withCount('commentLikes')
                                    ->withCount([
                                        'commentLikes as viewer_like_count' => function ($likeQuery) use ($user) {
                                            $likeQuery->where('user_id', $user->id);
                                        },
                                    ]);
                            },
                        ]);
                },
            ])
            ->withCount([
                'postLikes as viewer_like_count' => function ($likeQuery) use ($user) {
                    $likeQuery->where('user_id', $user->id);
                },
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

    public function createPostService(User $user, array $data): Post
    {
        $post = Post::create([
            'author_id' => $user->id,
            'content' => isset($data['content']) && is_string($data['content']) ? trim($data['content']) : null,
            'image_url' => isset($data['image_url']) && is_string($data['image_url']) ? trim($data['image_url']) : null,
            'visibility' => (bool) $data['visibility'],
            'likes_count' => 0,
            'comments_count' => 0,
        ]);

        $post->load('author:id,first_name,last_name,email');
        $post->viewer_like_count = 0;

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
