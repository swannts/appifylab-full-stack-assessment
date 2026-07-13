<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Resources\ApiResponseResource;
use App\Http\Resources\PostResource;
use App\Services\PostService;
use Illuminate\Http\Request;

class PostController extends Controller
{
    protected PostService $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index(Request $request)
    {
        $perPage = max(1, min((int) $request->integer('per_page', 10), 50));
        $cursor = $request->query('cursor');
        $posts = $this->postService->getFeedForUserService(
            auth()->user(),
            $perPage,
            is_string($cursor) ? $cursor : null
        );

        return response()->json(
            new ApiResponseResource([
                'status' => 'success',
                'posts' => PostResource::collection($posts->getCollection())->resolve($request),
                'pagination' => [
                    'next_cursor' => $posts->nextCursor()?->encode(),
                    'has_more' => $posts->nextCursor() !== null,
                ],
            ])
        );
    }

    public function store(StorePostRequest $request)
    {
        $post = $this->postService->createPostService(
            auth()->user(),
            $request->validated()
        );

        return response()->json(
            new ApiResponseResource([
                'status' => 'success',
                'message' => 'Post created successfully',
                'post' => new PostResource($post),
            ]),
            201
        );
    }

    public function toggleLike(Request $request, string $id)
    {
        $result = $this->postService->toggleLikeService(auth()->user(), $id);

        if (!$result) {
            return response()->json(
                new ApiResponseResource([
                    'status' => 'error',
                    'message' => 'Post not found',
                ]),
                404
            );
        }

        return response()->json(
            new ApiResponseResource([
                'status' => 'success',
                ...$result,
            ])
        );
    }

    public function likes(Request $request, string $id)
    {
        $result = $this->postService->getLikesListService($id);

        return response()->json(
            new ApiResponseResource([
                'status' => 'success',
                'likes' => $result,
            ])
        );
    }
}
