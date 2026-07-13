<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use App\Services\JwtService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Cookie as SymfonyCookie;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request)
    {
        $response = $this->authService->registerService($request->validated());
        $token = $response['access_token'];
        unset($response['access_token']);

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            ...$response
        ], 201)->withCookie($this->makeAuthCookie($token));
    }

    public function login(LoginRequest $request)
    {
        $response = $this->authService->loginService($request->validated());

        if (!$response) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $response['access_token'];
        unset($response['access_token']);

        return response()->json([
            'status' => 'success',
            'message' => 'Logged in successfully',
            ...$response
        ], 200)->withCookie($this->makeAuthCookie($token));
    }

    public function logout(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ], 200)->withCookie(Cookie::forget(JwtService::COOKIE_NAME, '/', config('session.domain')));
    }

    public function profile(Request $request)
    {
        $user = auth()->user();
        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ]
        ], 200);
    }

    private function makeAuthCookie(string $token): SymfonyCookie
    {
        return cookie(
            JwtService::COOKIE_NAME,
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
