<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyActivityGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'wa_story_target',
        'fb_marketplace_target',
        'tiktok_post_target',
        'new_prospect_target',
        'fu_prospect_target',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
