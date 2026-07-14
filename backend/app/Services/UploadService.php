<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class UploadService
{
    public function saveImage(UploadedFile $file): string
    {
        // Generate unique filename
        $filename = \Illuminate\Support\Str::random(40) . '.' . $file->getClientOriginalExtension();
        
        // Create uploads directory under public if it doesn't exist
        $uploadPath = public_path('uploads');
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }

        // Move file to public/uploads
        $file->move($uploadPath, $filename);

        // Generate full asset URL using configured app.url
        $baseUrl = rtrim(config('app.url', url('/')), '/');
        return $baseUrl . '/uploads/' . $filename;
    }
}
