<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesShiftSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shift_date',
    ];

    protected $casts = [
        'shift_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
