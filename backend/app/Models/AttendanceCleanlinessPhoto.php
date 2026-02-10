<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class AttendanceCleanlinessPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_id',
        'photo_path',
    ];

    protected $appends = [
        'photo_url',
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo_path ? url(Storage::url($this->photo_path)) : null;
    }
}
