<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity_date',
        'wa_story_count',
        'fb_marketplace_count',
        'tiktok_post_count',
        'new_prospect_count',
        'fu_prospect_count',
    ];

    protected $casts = [
        'activity_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function proofs()
    {
        return $this->hasMany(DailyActivityProof::class);
    }
}
