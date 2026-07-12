<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->unsignedInteger('likes_count')->default(0)->after('visibility');
            $table->unsignedInteger('comments_count')->default(0)->after('likes_count');
        });

        DB::table('posts')
            ->select('id')
            ->orderBy('id')
            ->get()
            ->each(function ($post) {
                DB::table('posts')
                    ->where('id', $post->id)
                    ->update([
                        'likes_count' => DB::table('post_likes')->where('post_id', $post->id)->count(),
                        'comments_count' => DB::table('comments')->where('post_id', $post->id)->count(),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['likes_count', 'comments_count']);
        });
    }
};
