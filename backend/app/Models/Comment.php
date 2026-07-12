<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory, HasCuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'post_id',
        'author_id',
        'parent_id',
        'content',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    public function commentLikes()
    {
        return $this->hasMany(CommentLike::class, 'comment_id');
    }
}
