<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\JwtService;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateJwt
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Missing or invalid token format.'
            ], 401);
        }

        $token = substr($authHeader, 7);
        $payload = JwtService::verifyToken($token);

        if (!$payload || !isset($payload['user_id'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Token is invalid or expired.'
            ], 401);
        }

        $user = User::find($payload['user_id']);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: User not found.'
            ], 401);
        }

        auth()->setUser($user);

        return $next($request);
    }
}
