<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory, HasCuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'author_id',
        'content',
        'image_url',
        'visibility',
        'likes_count',
        'comments_count',
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'visibility' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'post_id');
    }

    public function postLikes()
    {
        return $this->hasMany(PostLike::class, 'post_id');
    }
}
