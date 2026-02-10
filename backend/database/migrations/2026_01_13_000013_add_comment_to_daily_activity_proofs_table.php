<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE daily_activity_proofs MODIFY COLUMN proof_type ENUM('wa_story','fb_marketplace','tiktok','comment')");
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE daily_activity_proofs MODIFY COLUMN proof_type ENUM('wa_story','fb_marketplace','tiktok')");
        }
    }
};
