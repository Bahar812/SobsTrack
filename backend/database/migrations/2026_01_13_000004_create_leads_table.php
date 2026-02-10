<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_id')->constrained('users');
            $table->foreignId('branch_id')->constrained('branches');
            $table->date('lead_date');
            $table->string('name', 120);
            $table->string('whatsapp', 30);
            $table->string('motor_interest', 120);
            $table->enum('status', ['new', 'fu', 'deal', 'cancel'])->default('new');
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('lead_followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->dateTime('followup_at');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_followups');
        Schema::dropIfExists('leads');
    }
};
