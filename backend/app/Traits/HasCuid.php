<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasCuid
{
    protected static function bootHasCuid()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                // Generate a CUID-compatible string starting with 'c'
                $model->{$model->getKeyName()} = 'c' . base_convert((int)(microtime(true) * 1000), 10, 36) . Str::random(10);
            }
        });
    }
}
