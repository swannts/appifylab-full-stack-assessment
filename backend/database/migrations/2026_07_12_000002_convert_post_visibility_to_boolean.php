<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("UPDATE posts SET visibility = CASE WHEN visibility = 'PUBLIC' THEN 1 ELSE 0 END");
        DB::statement("ALTER TABLE posts MODIFY visibility TINYINT(1) NOT NULL DEFAULT 1");
    }

    public function down(): void
    {
        DB::statement("UPDATE posts SET visibility = CASE WHEN visibility = 1 THEN 'PUBLIC' ELSE 'PRIVATE' END");
        DB::statement("ALTER TABLE posts MODIFY visibility ENUM('PUBLIC', 'PRIVATE') NOT NULL");
    }
};
