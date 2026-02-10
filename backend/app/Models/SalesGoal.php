<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'branch_id',
        'month',
        'unit_name',
        'unit_target',
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

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
