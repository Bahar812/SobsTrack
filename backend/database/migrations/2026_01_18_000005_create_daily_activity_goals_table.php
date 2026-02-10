<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('daily_activity_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('month', 7);
            $table->unsignedInteger('wa_story_target')->default(0);
            $table->unsignedInteger('fb_marketplace_target')->default(0);
            $table->unsignedInteger('tiktok_post_target')->default(0);
            $table->unsignedInteger('new_prospect_target')->default(0);
            $table->unsignedInteger('fu_prospect_target')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_activity_goals');
    }
};
