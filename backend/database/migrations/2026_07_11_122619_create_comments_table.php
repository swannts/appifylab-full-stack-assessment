<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('post_id');
            $table->string('author_id');
            $table->string('parent_id')->nullable();
            $table->text('content');
            $table->timestamps();

            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');

            $table->index(['post_id', 'parent_id', 'created_at']);
            $table->index(['parent_id', 'created_at']);
            $table->index('author_id');
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('comments')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
