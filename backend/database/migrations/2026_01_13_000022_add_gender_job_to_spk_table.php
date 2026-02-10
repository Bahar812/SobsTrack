<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spk', function (Blueprint $table) {
            $table->enum('customer_gender', ['laki-laki', 'perempuan'])->nullable()->after('customer_age');
            $table->string('customer_job', 120)->nullable()->after('customer_gender');
        });
    }

    public function down(): void
    {
        Schema::table('spk', function (Blueprint $table) {
            $table->dropColumn(['customer_gender', 'customer_job']);
        });
    }
};
