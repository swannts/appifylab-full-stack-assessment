<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateJwt
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?: $request->cookie('auth_token');
        if (!$token) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Missing or invalid token.'
            ], 401);
        }

        try {
            if (!$user = auth('api')->setToken($token)->authenticate()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: User not found.'
                ], 401);
            }
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Token has expired.'
            ], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Token is invalid.'
            ], 401);
        }

        return $next($request);
    }
}
