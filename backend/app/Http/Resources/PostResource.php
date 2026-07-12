<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewerId = $request->user()?->id;
        $postLikes = $this->relationLoaded('postLikes') ? $this->postLikes : collect();
        $comments = $this->relationLoaded('comments') ? $this->comments : collect();

        return [
            'id' => $this->id,
            'author_id' => $this->author_id,
            'content' => $this->content,
            'image_url' => $this->image_url,
            'visibility' => (bool) $this->visibility,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'likes_count' => (int) ($this->likes_count ?? 0),
            'comments_count' => (int) ($this->comments_count ?? 0),
            'liked' => $viewerId ? $postLikes->contains('user_id', $viewerId) : false,
            'liked_by_users' => $this->likeUsers($postLikes),
            'author' => [
                'id' => $this->author?->id,
                'first_name' => $this->author?->first_name,
                'last_name' => $this->author?->last_name,
                'email' => $this->author?->email,
            ],
            'comments' => CommentResource::collection($comments)->resolve($request),
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
