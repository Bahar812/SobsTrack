<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'event_start',
        'event_end',
        'location',
        'branch_id',
        'created_by',
        'description',
        'target',
        'budget_file_path',
    ];

    protected $appends = [
        'budget_file_url',
    ];

    protected $casts = [
        'event_start' => 'datetime',
        'event_end' => 'datetime',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attendees()
    {
        return $this->belongsToMany(User::class, 'event_user')->withTimestamps();
    }

    public function getBudgetFileUrlAttribute()
    {
        return $this->budget_file_path ? url(\Illuminate\Support\Facades\Storage::url($this->budget_file_path)) : null;
    }
}
