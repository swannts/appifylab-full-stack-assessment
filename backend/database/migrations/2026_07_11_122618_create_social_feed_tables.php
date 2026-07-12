<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create posts table
        Schema::create('posts', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('author_id');
            $table->text('content')->nullable();
            $table->string('image_url')->nullable();
            $table->enum('visibility', ['PUBLIC', 'PRIVATE']);
            $table->timestamps();

            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');

            // Indexes
            $table->index(['visibility', 'created_at']);
            $table->index(['author_id', 'created_at']);
        });

        // Add CHECK constraint to posts
        DB::statement('ALTER TABLE posts ADD CONSTRAINT posts_content_or_image_check CHECK (NULLIF(TRIM(content), \'\') IS NOT NULL OR image_url IS NOT NULL)');

        // 2. Create comments table
        Schema::create('comments', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('post_id');
            $table->string('author_id');
            $table->string('parent_id')->nullable();
            $table->text('content');
            $table->timestamps();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');

            // Indexes
            $table->index(['post_id', 'parent_id', 'created_at']);
            $table->index(['parent_id', 'created_at']);
            $table->index('author_id');
        });

        // Add self-referential foreign key constraint on comments
        Schema::table('comments', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('comments')->onDelete('cascade');
        });

        // 3. Create post_likes table
        Schema::create('post_likes', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('post_id');
            $table->string('user_id');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unique(['post_id', 'user_id']);
            $table->index(['post_id', 'created_at']);
            $table->index('user_id');
        });

        // 4. Create comment_likes table
        Schema::create('comment_likes', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('comment_id');
            $table->string('user_id');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('comment_id')->references('id')->on('comments')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unique(['comment_id', 'user_id']);
            $table->index(['comment_id', 'created_at']);
            $table->index('user_id');
        });

        // 5. Create refresh_tokens table
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('user_id');
            $table->string('token_hash')->unique();
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->index('user_id');
            $table->index(['expires_at', 'revoked_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
        Schema::dropIfExists('comment_likes');
        Schema::dropIfExists('post_likes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('posts');
    }
};
