<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('stock_units', function (Blueprint $table) {
            $table->id();
            $table->string('unit_type', 120);
            $table->string('unit_color', 80);
            $table->string('frame_no', 80);
            $table->string('engine_no', 80);
            $table->foreignId('branch_id')->constrained('branches');
            $table->enum('status', ['booking', 'available'])->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_units');
    }
};
