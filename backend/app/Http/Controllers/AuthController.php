<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RefreshTokenRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;

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

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully',
            ...$response
        ], 201);
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

        return response()->json([
            'status' => 'success',
            'message' => 'Logged in successfully',
            ...$response
        ], 200);
    }

    public function refresh(RefreshTokenRequest $request)
    {
        $accessToken = $this->authService->refreshTokenService($request->validated()['refresh_token']);

        if (!$accessToken) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid or expired refresh token'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'access_token' => $accessToken,
        ], 200);
    }

    public function logout(RefreshTokenRequest $request)
    {
        $this->authService->logoutService($request->validated()['refresh_token']);

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ], 200);
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
}
