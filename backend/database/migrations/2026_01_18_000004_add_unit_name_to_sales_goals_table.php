<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('sales_goals', 'unit_name')) {
            Schema::table('sales_goals', function (Blueprint $table) {
                $table->string('unit_name', 120)->default('')->after('month');
            });
        }

        $hasUserIndex = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'sales_goals' AND index_name = 'sales_goals_user_id_index' LIMIT 1"
        );
        if (!$hasUserIndex) {
            Schema::table('sales_goals', function (Blueprint $table) {
                $table->index('user_id', 'sales_goals_user_id_index');
            });
        }

        $hasOldUnique = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'sales_goals' AND index_name = 'sales_goals_user_id_month_unique' LIMIT 1"
        );
        if ($hasOldUnique) {
            DB::statement('ALTER TABLE sales_goals DROP INDEX sales_goals_user_id_month_unique');
        }

        $hasNewUnique = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'sales_goals' AND index_name = 'sales_goals_user_id_month_unit_name_unique' LIMIT 1"
        );
        if (!$hasNewUnique) {
            Schema::table('sales_goals', function (Blueprint $table) {
                $table->unique(['user_id', 'month', 'unit_name']);
            });
        }
    }

    public function down(): void
    {
        $hasNewUnique = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'sales_goals' AND index_name = 'sales_goals_user_id_month_unit_name_unique' LIMIT 1"
        );
        if ($hasNewUnique) {
            Schema::table('sales_goals', function (Blueprint $table) {
                $table->dropUnique(['user_id', 'month', 'unit_name']);
            });
        }

        $hasUserIndex = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'sales_goals' AND index_name = 'sales_goals_user_id_index' LIMIT 1"
        );
        if ($hasUserIndex) {
            Schema::table('sales_goals', function (Blueprint $table) {
                $table->dropIndex('sales_goals_user_id_index');
            });
        }

        $hasOldUnique = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'sales_goals' AND index_name = 'sales_goals_user_id_month_unique' LIMIT 1"
        );
        if (!$hasOldUnique) {
            Schema::table('sales_goals', function (Blueprint $table) {
                $table->unique(['user_id', 'month']);
            });
        }

        if (Schema::hasColumn('sales_goals', 'unit_name')) {
            Schema::table('sales_goals', function (Blueprint $table) {
                $table->dropColumn('unit_name');
            });
        }
    }
};
