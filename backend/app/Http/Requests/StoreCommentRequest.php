<?php

namespace App\Http\Requests;

use App\Models\Comment;
use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'content' => is_string($this->input('content')) ? trim($this->input('content')) : $this->input('content'),
            'parent_id' => is_string($this->input('parent_id')) ? trim($this->input('parent_id')) : $this->input('parent_id'),
        ]);
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string|min:1',
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
}
