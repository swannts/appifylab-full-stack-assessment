<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $replies = $this->relationLoaded('replies') ? $this->replies : collect();

        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'author_id' => $this->author_id,
            'parent_id' => $this->parent_id,
            'content' => $this->content,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'likes_count' => (int) ($this->comment_likes_count ?? 0),
            'liked' => (int) ($this->viewer_like_count ?? 0) > 0,
            'author' => [
                'id' => $this->author?->id,
                'first_name' => $this->author?->first_name,
                'last_name' => $this->author?->last_name,
            ],
            'replies' => self::collection($replies)->resolve($request),
        ];
    }
}
