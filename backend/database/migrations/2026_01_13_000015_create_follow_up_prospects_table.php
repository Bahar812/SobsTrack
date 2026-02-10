<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('follow_up_prospects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('prospect_date');
            $table->string('customer_name', 120);
            $table->string('customer_address', 255);
            $table->string('customer_phone', 30);
            $table->string('interested_unit', 100);
            $table->string('status', 20);
            $table->string('source', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follow_up_prospects');
    }
};
