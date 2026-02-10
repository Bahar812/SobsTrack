<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spk', function (Blueprint $table) {
            $table->enum('spk_status', ['spk', 'do'])->default('spk')->after('spk_no');
        });
    }

    public function down(): void
    {
        Schema::table('spk', function (Blueprint $table) {
            $table->dropColumn('spk_status');
        });
    }
};
