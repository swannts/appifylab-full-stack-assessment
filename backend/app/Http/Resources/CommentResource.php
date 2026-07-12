<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewerId = $request->user()?->id;
        $commentLikes = $this->relationLoaded('commentLikes') ? $this->commentLikes : collect();
        $replies = $this->relationLoaded('replies') ? $this->replies : collect();

        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'author_id' => $this->author_id,
            'parent_id' => $this->parent_id,
            'content' => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'likes_count' => $commentLikes->count(),
            'liked' => $viewerId ? $commentLikes->contains('user_id', $viewerId) : false,
            'liked_by_users' => $this->likeUsers($commentLikes),
            'author' => [
                'id' => $this->author?->id,
                'first_name' => $this->author?->first_name,
                'last_name' => $this->author?->last_name,
            ],
            'replies' => self::collection($replies)->resolve($request),
        ];
    }

    protected function likeUsers(Collection $likes): array
    {
        return $likes->map(function ($like) {
            return [
                'id' => $like->user->id,
                'name' => $like->user->first_name . ' ' . $like->user->last_name,
            ];
        })->values()->all();
    }
}
