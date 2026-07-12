<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\PostLike;
use App\Models\CommentLike;
use App\Models\RefreshToken;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Hash passwords
        $passwordHash = Hash::make('Password123!');

        // 1. Create 4 Users
        $alice = User::create([
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'email' => 'alice@example.com',
            'password_hash' => $passwordHash,
        ]);

        $bob = User::create([
            'first_name' => 'Bob',
            'last_name' => 'Jones',
            'email' => 'bob@example.com',
            'password_hash' => $passwordHash,
        ]);

        $charlie = User::create([
            'first_name' => 'Charlie',
            'last_name' => 'Brown',
            'email' => 'charlie@example.com',
            'password_hash' => $passwordHash,
        ]);

        $dave = User::create([
            'first_name' => 'Dave',
            'last_name' => 'Miller',
            'email' => 'dave@example.com',
            'password_hash' => $passwordHash,
        ]);

        // 2. Create Posts (8 public, 3 private)
        // Public Posts
        $p1 = Post::create([
            'author_id' => $alice->id,
            'content' => 'Hello world! This is my first text-only public post.',
            'visibility' => true,
        ]);

        $p2 = Post::create([
            'author_id' => $bob->id,
            'image_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
            'visibility' => true,
        ]);

        $p3 = Post::create([
            'author_id' => $charlie->id,
            'content' => 'Beautiful scenery from my hike today!',
            'image_url' => 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
            'visibility' => true,
        ]);

        $p4 = Post::create([
            'author_id' => $dave->id,
            'content' => 'Just learning Laravel and Eloquent. So far, so good!',
            'visibility' => true,
        ]);

        $p5 = Post::create([
            'author_id' => $alice->id,
            'content' => 'Another post because I love this platform.',
            'visibility' => true,
        ]);

        $p6 = Post::create([
            'author_id' => $bob->id,
            'content' => 'No context image post here.',
            'image_url' => 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
            'visibility' => true,
        ]);

        $p7 = Post::create([
            'author_id' => $charlie->id,
            'content' => 'Text content only for Charlie.',
            'visibility' => true,
        ]);

        $p8 = Post::create([
            'author_id' => $dave->id,
            'content' => 'Final public post from Dave.',
            'image_url' => 'https://images.unsplash.com/photo-1472214222541-d510753a4907',
            'visibility' => true,
        ]);

        // Private Posts
        Post::create([
            'author_id' => $alice->id,
            'content' => 'My secret private diary entry.',
            'visibility' => false,
        ]);

        Post::create([
            'author_id' => $bob->id,
            'content' => 'Bob\'s private ideas draft.',
            'visibility' => false,
        ]);

        Post::create([
            'author_id' => $charlie->id,
            'image_url' => 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
            'visibility' => false,
        ]);

        // 3. Comments & One-Level Replies
        // Top-Level Comments
        $c1 = Comment::create([
            'post_id' => $p1->id,
            'author_id' => $bob->id,
            'content' => 'Great post, Alice!',
        ]);

        $c2 = Comment::create([
            'post_id' => $p1->id,
            'author_id' => $charlie->id,
            'content' => 'Welcome to the platform, Alice!',
        ]);

        // Replies (Parent ID exists)
        $r1 = Comment::create([
            'post_id' => $p1->id,
            'author_id' => $alice->id,
            'parent_id' => $c1->id,
            'content' => 'Thanks, Bob! Glad you like it.',
        ]);

        $r2 = Comment::create([
            'post_id' => $p1->id,
            'author_id' => $dave->id,
            'parent_id' => $c1->id,
            'content' => 'I agree, Bob, nice post.',
        ]);

        // 4. Post Likes
        PostLike::create([
            'post_id' => $p1->id,
            'user_id' => $bob->id,
        ]);

        PostLike::create([
            'post_id' => $p1->id,
            'user_id' => $charlie->id,
        ]);

        PostLike::create([
            'post_id' => $p3->id,
            'user_id' => $alice->id,
        ]);

        PostLike::create([
            'post_id' => $p3->id,
            'user_id' => $dave->id,
        ]);

        // 5. Comment Likes
        CommentLike::create([
            'comment_id' => $c1->id,
            'user_id' => $alice->id,
        ]);

        CommentLike::create([
            'comment_id' => $r1->id, // Like on a reply
            'user_id' => $bob->id,
        ]);

        // 6. Refresh Tokens (dave has multiple refresh tokens)
        RefreshToken::create([
            'user_id' => $dave->id,
            'token_hash' => 'hashed-token-iphone',
            'expires_at' => Carbon::now()->addDays(30),
        ]);

        RefreshToken::create([
            'user_id' => $dave->id,
            'token_hash' => 'hashed-token-safari-mac',
            'expires_at' => Carbon::now()->addDays(14),
        ]);
    }
}
