<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Comment;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string',
            'parent_id' => 'nullable|string|exists:comments,id',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $parentId = $this->input('parent_id');
            if ($parentId) {
                $parentComment = Comment::find($parentId);
                $postId = $this->route('postId');

                if ($parentComment) {
                    if ($parentComment->post_id !== $postId) {
                        $validator->errors()->add('parent_id', 'Parent comment does not belong to this post.');
                    }
                    if ($parentComment->parent_id !== null) {
                        $validator->errors()->add('parent_id', 'Only one level of comment replies is supported.');
                    }
                }
            }
        });
    }

    public function toDto(): \App\DTOs\StoreCommentDTO
    {
        return \App\DTOs\StoreCommentDTO::fromRequest($this->validated());
    }
}
