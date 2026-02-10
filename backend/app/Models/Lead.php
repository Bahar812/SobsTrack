<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'sales_id',
        'branch_id',
        'lead_date',
        'name',
        'whatsapp',
        'motor_interest',
        'status',
        'note',
    ];

    protected $casts = [
        'lead_date' => 'date',
    ];

    public function sales()
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function followups()
    {
        return $this->hasMany(LeadFollowUp::class);
    }
}
