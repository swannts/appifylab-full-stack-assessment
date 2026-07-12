<?php

namespace App\DTOs;

class StorePostDTO
{
    public function __construct(
        public readonly ?string $content,
        public readonly ?string $image_url,
        public readonly bool $visibility,
    ) {}

    public static function fromRequest(array $validated): self
    {
        return new self(
            $validated['content'] ?? null,
            $validated['image_url'] ?? null,
            (bool) $validated['visibility']
        );
    }
}
