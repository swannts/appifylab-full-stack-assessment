<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('author_id');
            $table->text('content')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('visibility')->default(true);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();

            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');

            $table->index(['visibility', 'created_at']);
            $table->index(['author_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
