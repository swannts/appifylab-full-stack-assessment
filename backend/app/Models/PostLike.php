<?php

namespace App\Models;

use App\Traits\HasCuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostLike extends Model
{
    use HasFactory, HasCuid;

    public $incrementing = false;
    protected $keyType = 'string';

    // Disable updated_at since the table only contains created_at
    const UPDATED_AT = null;

    protected $fillable = [
        'post_id',
        'user_id',
    ];

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
