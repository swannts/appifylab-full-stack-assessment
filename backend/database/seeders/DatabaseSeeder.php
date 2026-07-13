<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\PostLike;
use App\Models\CommentLike;
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
        $passwordHash = Hash::make('Password123!');

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
            'image_url' => 'https://images.unsplash.com/photo-1777471369659-e3b23a4899f5',
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

        CommentLike::create([
            'comment_id' => $c1->id,
            'user_id' => $alice->id,
        ]);

        CommentLike::create([
            'comment_id' => $r1->id,
            'user_id' => $bob->id,
        ]);

        // Generate additional posts to reach a total of 30 posts
        $users = [$alice, $bob, $charlie, $dave];
        $images = [
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
            'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
            'https://images.unsplash.com/photo-1501854140801-50d01698950b',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        ];

        for ($i = 1; $i <= 19; $i++) {
            $user = $users[array_rand($users)];
            $hasImage = (rand(0, 1) === 1);
            Post::create([
                'author_id' => $user->id,
                'content' => "This is automatically seeded post number {$i} with some interesting thoughts and ideas.",
                'image_url' => $hasImage ? $images[array_rand($images)] : null,
                'visibility' => (rand(0, 4) > 0), // 80% chance of public visibility
            ]);
        }

        Post::all()->each(function ($post) {
            $post->update([
                'likes_count' => $post->postLikes()->count(),
                'comments_count' => $post->comments()->count(),
            ]);
        });
    }
}
