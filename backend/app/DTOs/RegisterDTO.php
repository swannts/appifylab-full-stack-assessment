<?php

namespace App\DTOs;

class RegisterDTO
{
    public function __construct(
        public readonly string $first_name,
        public readonly string $last_name,
        public readonly string $email,
        public readonly string $password,
    ) {}

    public static function fromRequest(array $validated): self
    {
        return new self(
            $validated['first_name'],
            $validated['last_name'],
            $validated['email'],
            $validated['password']
        );
    }
}
