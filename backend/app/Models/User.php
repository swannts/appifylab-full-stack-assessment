<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasCuid;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password_hash',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    public function posts()
    {
        return $this->hasMany(Post::class, 'author_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'author_id');
    }

    public function postLikes()
    {
        return $this->hasMany(PostLike::class, 'user_id');
    }

    public function commentLikes()
    {
        return $this->hasMany(CommentLike::class, 'user_id');
    }

    public function refreshTokens()
    {
        return $this->hasMany(RefreshToken::class, 'user_id');
    }
}
