<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentLike extends Model
{
    use HasFactory, HasCuid;

    public $incrementing = false;
    protected $keyType = 'string';

    const UPDATED_AT = null;

    protected $fillable = [
        'comment_id',
        'user_id',
    ];

    public function comment()
    {
        return $this->belongsTo(Comment::class, 'comment_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
