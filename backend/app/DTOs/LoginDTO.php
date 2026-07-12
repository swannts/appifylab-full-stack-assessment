<?php

namespace App\DTOs;

class LoginDTO
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
    ) {}

    public static function fromRequest(array $validated): self
    {
        return new self(
            $validated['email'],
            $validated['password']
        );
    }
}
