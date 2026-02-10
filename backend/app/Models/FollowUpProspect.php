<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowUpProspect extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'prospect_date',
        'customer_name',
        'customer_address',
        'customer_phone',
        'interested_unit',
        'status',
        'source',
    ];

    protected $casts = [
        'prospect_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
