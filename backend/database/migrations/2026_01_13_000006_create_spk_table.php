<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('spk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_id')->constrained('users');
            $table->foreignId('branch_id')->constrained('branches');
            $table->string('spk_no', 50)->nullable();
            $table->string('customer_name', 120);
            $table->string('unit_name', 120);
            $table->date('spk_date');
            $table->timestamps();
        });

        Schema::create('sales_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_id')->constrained('users');
            $table->date('target_month');
            $table->unsignedInteger('target_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_targets');
        Schema::dropIfExists('spk');
    }
};
