<?php

namespace App\DTOs;

class StoreCommentDTO
{
    public function __construct(
        public readonly string $content,
        public readonly ?string $parent_id,
    ) {}

    public static function fromRequest(array $validated): self
    {
        return new self(
            $validated['content'],
            $validated['parent_id'] ?? null
        );
    }
}
