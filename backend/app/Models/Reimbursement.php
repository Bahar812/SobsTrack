<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reimbursement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category',
        'amount',
        'transaction_date',
        'merchant_name',
        'receipt_path',
        'status',
    ];

    protected $casts = [
        'transaction_date' => 'date',
    ];

    protected $appends = [
        'receipt_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getReceiptUrlAttribute()
    {
        return $this->receipt_path ? url(\Illuminate\Support\Facades\Storage::url($this->receipt_path)) : null;
    }
}
