<?php

namespace App\Services;

use App\Models\Post;
use App\Models\User;
use App\Models\Comment;
use App\Models\CommentLike;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CommentService
{
    public function createCommentService(User $user, string $postId, \App\DTOs\StoreCommentDTO $dto): Comment
    {
        return DB::transaction(function () use ($user, $postId, $dto) {
            $comment = Comment::create([
                'post_id' => $postId,
                'author_id' => $user->id,
                'parent_id' => $dto->parent_id ?? null,
                'content' => trim($dto->content),
            ]);

            Post::whereKey($postId)->increment('comments_count');

            $comment->load('author:id,first_name,last_name');
            $comment->likes_count = 0;
            $comment->liked = false;
            $comment->liked_by_users = [];
            $comment->replies = [];

            return $comment;
        });
    }

    public function toggleLikeService(User $user, string $commentId): ?array
    {
        return DB::transaction(function () use ($user, $commentId) {
            $comment = Comment::whereKey($commentId)->lockForUpdate()->first();
            if (!$comment) {
                return null;
            }

            $like = CommentLike::where('comment_id', $comment->id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if ($like) {
                $like->delete();
                $liked = false;
            } else {
                CommentLike::create([
                    'comment_id' => $comment->id,
                    'user_id' => $user->id
                ]);
                $liked = true;
            }

            return $this->buildLikeState($comment->id, $liked);
        });
    }

    public function getLikesListService(string $commentId): Collection
    {
        return CommentLike::with('user:id,first_name,last_name')
            ->where('comment_id', $commentId)
            ->get()
            ->map(function ($like) {
                return [
                    'id' => $like->user->id,
                    'name' => $like->user->first_name . ' ' . $like->user->last_name
                ];
            });
    }

    private function buildLikeState(string $commentId, bool $liked): array
    {
        $likesList = $this->getLikesListService($commentId);

        return [
            'liked' => $liked,
            'likes_count' => $likesList->count(),
            'liked_by_users' => $likesList,
        ];
    }
}
