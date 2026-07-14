<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Cookie as SymfonyCookie;

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

    private function generateUserTokensResponse(User $user): array
    {
        // 1 day = 1440 minutes
        $accessToken = auth('api')->setTTL(1440)->login($user);

        return [
            'access_token' => $accessToken,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ]
        ];
    }

    public function makeAuthCookie(string $token): SymfonyCookie
    {
        return cookie(
            'auth_token',
            $token,
            60 * 24,
            '/',
            config('session.domain'),
            (bool) config('session.secure'),
            true,
            false,
            config('session.same_site', 'lax')
        );
    }
}
