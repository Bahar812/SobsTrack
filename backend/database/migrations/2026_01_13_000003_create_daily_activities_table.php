<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('daily_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->date('activity_date');
            $table->unsignedInteger('wa_story_count')->default(0);
            $table->unsignedInteger('fb_marketplace_count')->default(0);
            $table->unsignedInteger('tiktok_post_count')->default(0);
            $table->unsignedInteger('new_prospect_count')->default(0);
            $table->unsignedInteger('fu_prospect_count')->default(0);
            $table->timestamps();
        });

        Schema::create('daily_activity_proofs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_activity_id')->constrained('daily_activities')->cascadeOnDelete();
            $table->enum('proof_type', ['wa_story', 'fb_marketplace', 'tiktok']);
            $table->string('proof_path')->nullable();
            $table->string('proof_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_activity_proofs');
        Schema::dropIfExists('daily_activities');
    }
};
