<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_shift_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('shift_date');
            $table->timestamps();

            $table->unique(['user_id', 'shift_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_shift_schedules');
    }
};
