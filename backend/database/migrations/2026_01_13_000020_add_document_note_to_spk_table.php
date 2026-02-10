<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spk', function (Blueprint $table) {
            $table->text('note')->nullable()->after('leasing_name');
            $table->string('document_path')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('spk', function (Blueprint $table) {
            $table->dropColumn(['note', 'document_path']);
        });
    }
};
