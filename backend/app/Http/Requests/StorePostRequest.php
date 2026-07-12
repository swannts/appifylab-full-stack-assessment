<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'nullable|string',
            'image_url' => 'nullable|url',
            'visibility' => 'required|boolean',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $contentInput = $this->input('content');
            $imageUrlInput = $this->input('image_url');
            $content = is_string($contentInput) ? trim($contentInput) : '';
            $imageUrl = is_string($imageUrlInput) ? trim($imageUrlInput) : '';

            if ($content === '' && $imageUrl === '') {
                $validator->errors()->add('content', 'A post must have either text content or an image.');
            }
        });
    }

    public function toDto(): \App\DTOs\StorePostDTO
    {
        return \App\DTOs\StorePostDTO::fromRequest($this->validated());
    }
}
