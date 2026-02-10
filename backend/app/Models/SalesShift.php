<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'month',
        'week1_shift',
        'week2_shift',
        'week3_shift',
        'week4_shift',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
