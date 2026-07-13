<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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
    }

    public function down(): void
    {
        Schema::dropIfExists('post_likes');
    }
};
