<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class DailyActivityProof extends Model
{
    use HasFactory;

    protected $fillable = [
        'daily_activity_id',
        'proof_type',
        'proof_path',
        'proof_url',
    ];

    protected $appends = [
        'proof_full_url',
    ];

    public function activity()
    {
        return $this->belongsTo(DailyActivity::class, 'daily_activity_id');
    }

    public function getProofFullUrlAttribute()
    {
        return $this->proof_path ? url(Storage::url($this->proof_path)) : null;
    }
}
