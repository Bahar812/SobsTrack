<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('branch_goals', 'unit_name')) {
            Schema::table('branch_goals', function (Blueprint $table) {
                $table->string('unit_name', 120)->default('')->after('month');
            });
        }

        $hasBranchIndex = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'branch_goals' AND index_name = 'branch_goals_branch_id_index' LIMIT 1"
        );
        if (!$hasBranchIndex) {
            Schema::table('branch_goals', function (Blueprint $table) {
                $table->index('branch_id', 'branch_goals_branch_id_index');
            });
        }

        $hasOldUnique = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'branch_goals' AND index_name = 'branch_goals_branch_id_month_unique' LIMIT 1"
        );
        if ($hasOldUnique) {
            DB::statement('ALTER TABLE branch_goals DROP INDEX branch_goals_branch_id_month_unique');
        }

        $hasNewUnique = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'branch_goals' AND index_name = 'branch_goals_branch_id_month_unit_name_unique' LIMIT 1"
        );
        if (!$hasNewUnique) {
            Schema::table('branch_goals', function (Blueprint $table) {
                $table->unique(['branch_id', 'month', 'unit_name']);
            });
        }
    }

    public function down(): void
    {
        $hasNewUnique = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'branch_goals' AND index_name = 'branch_goals_branch_id_month_unit_name_unique' LIMIT 1"
        );
        if ($hasNewUnique) {
            Schema::table('branch_goals', function (Blueprint $table) {
                $table->dropUnique(['branch_id', 'month', 'unit_name']);
            });
        }

        $hasBranchIndex = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'branch_goals' AND index_name = 'branch_goals_branch_id_index' LIMIT 1"
        );
        if ($hasBranchIndex) {
            Schema::table('branch_goals', function (Blueprint $table) {
                $table->dropIndex('branch_goals_branch_id_index');
            });
        }

        $hasOldUnique = DB::select(
            "SELECT 1 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'branch_goals' AND index_name = 'branch_goals_branch_id_month_unique' LIMIT 1"
        );
        if (!$hasOldUnique) {
            Schema::table('branch_goals', function (Blueprint $table) {
                $table->unique(['branch_id', 'month']);
            });
        }

        if (Schema::hasColumn('branch_goals', 'unit_name')) {
            Schema::table('branch_goals', function (Blueprint $table) {
                $table->dropColumn('unit_name');
            });
        }
    }
};
