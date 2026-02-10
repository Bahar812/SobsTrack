<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OvertimeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'overtime_date',
        'start_time',
        'end_time',
        'reason',
        'proof_path',
        'status',
    ];

    protected $casts = [
        'overtime_date' => 'date',
    ];

    protected $appends = [
        'proof_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getProofUrlAttribute()
    {
        return $this->proof_path ? url(\Illuminate\Support\Facades\Storage::url($this->proof_path)) : null;
    }
}
