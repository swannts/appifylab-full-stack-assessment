<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'content' => is_string($this->input('content')) ? trim($this->input('content')) : $this->input('content'),
            'image_url' => is_string($this->input('image_url')) ? trim($this->input('image_url')) : $this->input('image_url'),
        ]);
    }

    public function rules(): array
    {
        return [
            'content' => 'nullable|string|required_without:image_url',
            'image_url' => 'nullable|url|required_without:content',
            'visibility' => 'required|boolean',
        ];
    }
}
