<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE leads MODIFY COLUMN status ENUM('new','fu','deal','cancel','prospek','hot') DEFAULT 'new'");
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE leads MODIFY COLUMN status ENUM('new','fu','deal','cancel') DEFAULT 'new'");
        }
    }
};
