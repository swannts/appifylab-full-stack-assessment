<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommentRequest;
use App\Services\CommentService;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    protected CommentService $commentService;

    public function __construct(CommentService $commentService)
    {
        $this->commentService = $commentService;
    }

    public function store(StoreCommentRequest $request, string $postId)
    {
        $comment = $this->commentService->createCommentService(
            auth()->user(),
            $postId,
            $request->toDto()
        );

        return response()->json([
            'status' => 'success',
            'message' => $request->has('parent_id') ? 'Reply added successfully' : 'Comment added successfully',
            'comment' => $comment
        ], 201);
    }

    public function toggleLike(Request $request, string $id)
    {
        $result = $this->commentService->toggleLikeService(auth()->user(), $id);

        if (!$result) {
            return response()->json([
                'status' => 'error',
                'message' => 'Comment not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            ...$result
        ]);
    }

    public function likes(Request $request, string $id)
    {
        $result = $this->commentService->getLikesListService($id);

        return response()->json([
            'status' => 'success',
            'likes' => $result
        ]);
    }
}
