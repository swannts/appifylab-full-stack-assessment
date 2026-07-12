<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UploadController;
use App\Http\Middleware\AuthenticateJwt;

Route::get('/', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Social Feed API is running',
        'version' => '1.0.0'
    ]);
});

// Authentication routes
Route::post('/api/auth/register', [AuthController::class, 'register']);
Route::post('/api/auth/login', [AuthController::class, 'login']);
Route::post('/api/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/api/auth/logout', [AuthController::class, 'logout']);

// Protected routes
Route::middleware([AuthenticateJwt::class])->group(function () {
    Route::get('/api/auth/profile', [AuthController::class, 'profile']);
    
    // Uploads
    Route::post('/api/upload', [UploadController::class, 'upload']);
    
    // Posts
    Route::get('/api/posts', [PostController::class, 'index']);
    Route::post('/api/posts', [PostController::class, 'store']);
    Route::post('/api/posts/{id}/like', [PostController::class, 'toggleLike']);
    Route::get('/api/posts/{id}/likes', [PostController::class, 'likes']);
    
    // Comments
    Route::post('/api/posts/{postId}/comments', [CommentController::class, 'store']);
    Route::post('/api/comments/{id}/like', [CommentController::class, 'toggleLike']);
    Route::get('/api/comments/{id}/likes', [CommentController::class, 'likes']);
});
