<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'branch_id',
        'attendance_date',
        'check_in_at',
        'check_out_at',
        'location_text',
        'latitude',
        'longitude',
        'selfie_path',
        'checkout_photo_path',
    ];

    protected $appends = [
        'selfie_url',
        'checkout_photo_url',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'check_in_at' => 'datetime',
        'check_out_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function cleanlinessPhotos()
    {
        return $this->hasMany(AttendanceCleanlinessPhoto::class);
    }

    public function getSelfieUrlAttribute()
    {
        return $this->selfie_path ? url(Storage::url($this->selfie_path)) : null;
    }

    public function getCheckoutPhotoUrlAttribute()
    {
        return $this->checkout_photo_path ? url(Storage::url($this->checkout_photo_path)) : null;
    }
}
