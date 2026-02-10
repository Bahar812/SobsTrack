<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('branch_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->string('month', 7);
            $table->unsignedInteger('unit_target')->default(0);
            $table->timestamps();

            $table->unique(['branch_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_goals');
    }
};
