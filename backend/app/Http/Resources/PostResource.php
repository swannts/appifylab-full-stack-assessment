<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
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
            'liked' => (int) ($this->viewer_like_count ?? 0) > 0,
            'author' => [
                'id' => $this->author?->id,
                'first_name' => $this->author?->first_name,
                'last_name' => $this->author?->last_name,
                'email' => $this->author?->email,
            ],
            'comments' => CommentResource::collection($comments)->resolve($request),
        ];
    }
}
