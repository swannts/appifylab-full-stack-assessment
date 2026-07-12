<?php

namespace App\Http\Controllers;

use App\Http\Requests\UploadImageRequest;
use App\Services\UploadService;

class UploadController extends Controller
{
    protected UploadService $uploadService;

    public function __construct(UploadService $uploadService)
    {
        $this->uploadService = $uploadService;
    }

    public function upload(UploadImageRequest $request)
    {
        $url = $this->uploadService->saveImage($request->file('image'));

        return response()->json([
            'status' => 'success',
            'message' => 'Image uploaded successfully',
            'url' => $url
        ], 200);
    }
}
