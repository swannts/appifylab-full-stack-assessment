<?php

namespace App\Services;

use App\Models\User;
use App\Models\RefreshToken;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    public function registerService(array $data): array
    {
        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password_hash' => Hash::make($data['password']),
        ]);

        return $this->generateUserTokensResponse($user);
    }

    public function loginService(array $data): ?array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password_hash)) {
            return null;
        }

        return $this->generateUserTokensResponse($user);
    }

    public function refreshTokenService(string $refreshTokenString): ?string
    {
        $tokenHash = hash('sha256', $refreshTokenString);
        $refreshToken = RefreshToken::where('token_hash', $tokenHash)
            ->where('expires_at', '>', now())
            ->whereNull('revoked_at')
            ->first();

        if (!$refreshToken) {
            return null;
        }

        return JwtService::generateToken(['user_id' => $refreshToken->user_id], 3600);
    }

    public function logoutService(string $refreshTokenString): bool
    {
        $tokenHash = hash('sha256', $refreshTokenString);
        return RefreshToken::where('token_hash', $tokenHash)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]) > 0;
    }

    private function generateUserTokensResponse(User $user): array
    {
        $accessToken = JwtService::generateToken(['user_id' => $user->id], 3600);
        $refreshTokenString = Str::random(64);

        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $refreshTokenString),
            'expires_at' => now()->addDays(30),
        ]);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshTokenString,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ]
        ];
    }
}
